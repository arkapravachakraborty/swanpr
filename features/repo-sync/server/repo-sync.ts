import { CodeChunk } from "@/features/review/types/review";
import { RepoFile } from "../types";
import { getGithubApp } from "@/features/github/utils/github-app";
import { getPineConeIndex } from "@/features/pinecone/client";
import { prisma } from "@/lib/db";
import { inngest } from "@/features/inngest/client";

// get some max things to avoid overloading the system
const MAX_FILE_SIZE_BYTES = 100_000;
const MAX_FILES = 200;
const MAX_CHUNK_LINES = 80;
const UPSERT_BATCH_SIZE = 90;

// list of code file extensions to consider to read that files
const CODE_EXTENSIONS = [
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".py", ".go", ".rb", ".rs",
    ".java", ".kt", ".swift", ".c", ".h", ".cpp", ".cs", ".php",
    ".sql", ".prisma", ".css", ".md", ".yml", ".yaml",
];

// list of folders to skip when reading files
const SKIPPED_FOLDERS = [
    "node_modules/", "dist/", "build/", ".next/", "generated/", "vendor/",
];

// github tree entry type
type TreeEntry = {
    path?: string;
    type?: string;
    sha?: string;
    size?: number;
};

// we have index, inside that we have namspaces, inside that we have file details
export function buildRepoNamespace(repoFullName: string) {
    const safeRepoName = encodeURIComponent(repoFullName).replace(/%/g, "_");
    return `${safeRepoName}--codebase`;
}

// check if the file has a code extension
function hasCodeExtension(path: string) {
    return CODE_EXTENSIONS.some((extension) => path.endsWith(extension));
}

// check if the path is in the skipped folders
function isSkippedPath(path: string) {
    return SKIPPED_FOLDERS.some((folder) => path.includes(folder));
}

// check if the tree entry is a file that we can index
function isIndexableFile(entry: TreeEntry) {
    if (entry.type !== "blob" || !entry.path || !entry.sha) {
        return false;
    }

    if (entry.size && entry.size > MAX_FILE_SIZE_BYTES) {
        return false;
    }

    if (isSkippedPath(entry.path)) {
        return false;
    }

    return hasCodeExtension(entry.path);
}

// build a chunk id for a file path and part number
function buildChunkId(filePath: string, part: number) {
    // change the file path to a safe string by replacing all non-alphanumeric characters with underscores
    const safeFilePath = encodeURIComponent(filePath).replace(/%/g, "_");
    return `repo--${safeFilePath}--part-${part}`;
}

// split the files into chunks of MAX_CHUNK_LINES lines
export function chunkRepoFiles(files: RepoFile[]): CodeChunk[] {
    const chunks: CodeChunk[] = [];

    for (const file of files) {
        const lines = file.content.split("\n");

        for (let start = 0; start < lines.length; start += MAX_CHUNK_LINES) {
            const part = start / MAX_CHUNK_LINES;
            const text = lines.slice(start, start + MAX_CHUNK_LINES).join("\n");

            chunks.push({
                id: buildChunkId(file.filePath, part),
                filePath: file.filePath,
                text,
            });
        }
    }

    return chunks;
}

// fetch the files from the repo using the GitHub API
export async function getRepoFiles(
    installationId: number,
    repoFullName: string,
    branch: string
): Promise<RepoFile[]> {
    const app = getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId);
    const [owner, repo] = repoFullName.split("/");

    const { data: tree } = await octokit.request(
        "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
        { owner, repo, tree_sha: branch, recursive: "1" }
    );

    // filter the tree entries to only include indexable files and limit to MAX_FILES
    const entries = tree.tree.filter(isIndexableFile).slice(0, MAX_FILES);
    const files: RepoFile[] = [];

    // fetch the content of each file and decode it
    for (const entry of entries) {
        const { data: blob } = await octokit.request(
            "GET /repos/{owner}/{repo}/git/blobs/{file_sha}",
            { owner, repo, file_sha: entry.sha! }
        );

        // decode the content of the blob
        const content = Buffer.from(blob.content, "base64").toString("utf-8");
        files.push({ filePath: entry.path!, content });
    }

    return files;
}

// delete the namespace from the pinecone index
export async function deleteRepoNamespace(namespace: string) {
    const index = getPineConeIndex();
    await index.deleteNamespace(namespace);
}

// save the chunks to the pinecone index in batches
export async function saveRepoChunks(namespace: string, chunks: CodeChunk[]) {
    const index = getPineConeIndex();

    for (let start = 0; start < chunks.length; start += UPSERT_BATCH_SIZE) {
        // get the batch of chunks to upsert
        const batch = chunks.slice(start, start + UPSERT_BATCH_SIZE);

        // map the batch to the records format expected by pinecone
        const records = batch.map((chunk) => ({
            id: chunk.id,
            text: chunk.text,
            filePath: chunk.filePath,
        }));

        // upsert the records to the pinecone index
        await index.namespace(namespace).upsertRecords({ records });
    }
}

// get the sync statuses for the given repo full names from the db
export async function getRepoSyncStatuses(repoFullNames: string[]) {
    // fetch the sync statuses from the db
    const syncs = await prisma.repoSync.findMany({
        where: { repoFullName: { in: repoFullNames } },
        select: { repoFullName: true, status: true },
    });

    // build a map of repo full name to status
    const statusByRepo: Record<string, string> = {};

    // populate the map with the sync statuses
    for (const sync of syncs) {
        statusByRepo[sync.repoFullName] = sync.status;
    }

    return statusByRepo;
}

// trigger a repo sync by creating or updating the repo sync record in the db and sending an event to inngest
export async function triggerRepoSync(
    installationId: number,
    repoFullName: string,
    branch: string
) {
    // upsert the repo sync record in the db
    const repoSync = await prisma.repoSync.upsert({
        where: { repoFullName },
        create: { installationId, repoFullName, branch, status: "pending" },
        update: { installationId, branch, status: "pending" },
    });

    // send an event to inngest to trigger the sync
    await inngest.send({
        name: "repo/sync.requested",
        data: { repoSyncId: repoSync.id },
    });
}