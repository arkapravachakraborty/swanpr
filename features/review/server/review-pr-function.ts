import { inngest } from "@/features/inngest/client";
import { prisma } from "@/lib/db";
import { getPullRequestFiles } from "./pr-files";
import { chunkPrFiles } from "../utils/chunk-code";
import { generateReview } from "./generate-review";

export const reviewPullRequest = inngest.createFunction(
    { id: "review-pull-request", triggers: { event: "github/pr.received" } },
    async ({ event, step }) => {
        // when we need to trigger the reviewPullRequest we just sends a pull req id
        const pullRequestId = event.data.pullRequestId;
        const pullRequest = await step.run("mark-processing", async () => {
            return prisma.pullRequest.update({
                where: {
                    id: pullRequestId
                },
                data: {
                    status: "processing"
                }
            })
        });

        const chunk = await step.run("breakdown-code", async () => {
            const files = await getPullRequestFiles(
                pullRequest.installationId,
                pullRequest.repoFullName,
                pullRequest.prNumber
            );

            // going forward pinecode will upsert it and later used in symentaic similarity
            return chunkPrFiles(pullRequest.prNumber, files);
        });

        if (chunk.length === 0) {
            await step.run("mark-reviewed-no-code", async () => {
                await prisma.pullRequest.update({
                    where: { id: pullRequestId },
                    data: { status: "reviewed" },
                });
            });

            return { pullRequestId, status: "reviewed", reason: "no code to review" };
        }
        // TODO: PR namespace isolates this diff from other PRs and from repo-wide sync data (add for pinecone db)

        await step.sleep("wait-for-vectors-to-index", "10s")

        // repo context Snippet

        const review = await step.run("generate-ai-review", async () => {
            return generateReview({
                repoFullName: pullRequest.repoFullName,
                title: pullRequest.title,
            })
        });

        await step.run("post-pr-comment", async () => {
            await postPrComment(
                pullRequest.installationId,
                pullRequest.repoFullName,
                pullRequest.prNumber,
                review,
            );
        })

        await step.run("mark-reviewed", async () => {
            await prisma.pullRequest.update({
                where: { id: pullRequestId },
                data: {
                    status: "reviewed",
                    reviewComment: review,
                    reviewedAt: new Date(),
                },
            });
        });

        return { pullRequestId, status: "reviewed" };
    }
)