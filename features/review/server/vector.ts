import { getPineConeIndex } from "@/features/pinecone/client";
import { CodeChunk } from "../types/review";

// how many symmetically similar chunks put into the AI prompt
const CONTEXT_RESULTS = 10;

export function buildPrNamespace(repoFullName: string, prNumber: number) {
    return `${repoFullName.replace("/", "--")}--pr-${prNumber}`;
}

export async function saveChunksToPinecone(
    namespace: string,
    chunks: CodeChunk[]
) {
    const index = getPineConeIndex();

    const records = chunks.map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        filePath: chunk.filePath,
    }));

    // namespace() scopes vectors so this PR never mixes with repo-wide sync data
    await index.namespace(namespace).upsertRecords({ records });
}

// function working: symmentic search over the embedded pr that we have
// query the pr title and do a similar chunking for namespacse and feed into AI for better result
export async function searchPrContext(namespace: string, query: string) {
    const index = getPineConeIndex();

    const response = await index.namespace(namespace).searchRecords({
        query: { topK: CONTEXT_RESULTS, inputs: { text: query } },
    });

    const snippets: string[] = [];

    for (const hit of response.result.hits) {
        const fields = hit.fields as { text?: string; filePath?: string };
        if (!fields.text) {
            continue;
        }

        snippets.push(`File: ${fields.filePath}\n${fields.text}`);
    }

    return snippets;
}