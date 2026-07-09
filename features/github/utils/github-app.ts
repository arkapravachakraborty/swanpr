import { App } from "octokit";

let githubApp: App | null = null;

export function getGithubApp() {
    if (!githubApp) {
        githubApp = new App({
            appId: process.env.GITHUB_APP_ID!,
            privateKey: process.env.GITHUB_APP_PRIVET_KEY!.replace(/\\n/g, "\n"),
            webhooks: {
                secret: process.env.GITHUB_WEBHOOK_SECRET!
            }
        })
    }
    return githubApp;
}

export function getGithubInstallUrl(userId: string) {
    const appName = process.env.GITHUB_APP_NAME;
    // url is same as NEXT_PUBLIC_GITHUB_PUBLIC_LINK in .env
    const url = new URL(`https://github.com/apps/${appName}/installations/new`);
    // `state` round-trips through GitHub so we can link the installation to this user.
    url.searchParams.set("state", userId);
    return url.toString();
}