import { savePullRequest } from "@/features/review/server/save-pull-request";
import { getGithubApp } from "../utils/github-app";

const REVIEWABLE_ACTIONS = ["opened", "synchronize", "reopened"];


export type PullRequestWebhookPayload = {
    /** Webhook action, e.g. `opened`, `synchronize`, `reopened` */
    action: string;
    /** GitHub App installation that received the event */
    installation: { id: number };
    repository: { full_name: string };
    pull_request: {
        number: number;
        title: string;
        user: { login: string } | null;
        head: { sha: string };
        base: { ref: string };
    };
};

async function isSignatureValid(payload: string, signature: string | null) {
    if (!signature) {
        return false;
    }

    const app = getGithubApp();
    // verify the signature using the app's webhook secret
    // octokit wraps the github crypto and if forged payload then reject
    return app.webhooks.verify(payload, signature);
}

export async function handleGithubWebhook(request: Request) {
    // take the raw body as text, signature and event type
    // in text because it take the exact bytes to sign for verification
    const payload = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const eventName = request.headers.get("x-github-event");

    const isValid = await isSignatureValid(payload, signature);

    if (!isValid) {
        return new Response("Invalid signature", { status: 401 });
    }

    if (eventName !== "pull_request") {
        return Response.json({ received: true });
    }

    const event = JSON.parse(payload) as PullRequestWebhookPayload;
    console.log("event:", event);

    if (!REVIEWABLE_ACTIONS.includes(event.action)) {
        return Response.json({ received: true });
    }

    const pullRequest = await savePullRequest(event);

    // Todo: Map Github Installation Id 
    // Todo: Triggered Review job

    return Response.json({ received: true });
}