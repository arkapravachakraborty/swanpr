import { getServerSession } from "@/features/auth/actions";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { GithubInstallationStatus } from "@/features/dashboard/lib/types";
import { getGithubApp } from "@/features/github/utils/github-app";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

function getAccountLogin(
    account: { login?: string, slug?: string } | null | undefined
): string | null {

    if (!account) {
        return null;
    }

    if ("login" in account && account.login) {
        return account.login;
    }

    if (account.slug) {
        return account.slug;
    }

    return null;
}

function buildDisconnectedStatus(): GithubInstallationStatus {
    return { connected: false, accountLogin: null, installedAt: null };
}

export async function getInstallationStatus(userId: string) {
    // go to github so that any installation present or not
    const installation = await prisma.githubInstallation.findUnique({
        where: {
            userId
        }
    });

    // if we dont have an installation id then return disconnect status
    if (!installation) {
        return buildDisconnectedStatus();
    }

    // return connected status
    return {
        connected: true,
        accountLogin: installation.accountLogin,
        installedAt: installation.createdAt.toISOString(),
    }

}

// a function save installation
// go to db and run an absert query
export async function saveInstallation(userId: string, installationId: number) {
    // get the github app
    const app = getGithubApp();
    // hit a req in octokit
    const { data } = await app.octokit.request(
        // first the method as GET; get the app by installation id
        "GET /app/installations/{installation_id}",
        { installation_id: installationId }
    );

    const accountLogin = getAccountLogin(data.account);

    // now performa an absert query
    await prisma.githubInstallation.upsert({
        where: { userId },
        create: {
            userId,
            installationId,
            accountLogin,
            accountType: data.target_type ?? null,
        },
        update: {
            installationId,
            accountLogin,
            accountType: data.target_type ?? null,
        }
    })
}


export async function deleteInstallation(userId: string) {
    await prisma.githubInstallation.delete({ where: { userId } });
}

// a function to get the userId by Github InstallationId
export async function getUserIdByInstallationId(installationId: number) {
    // go to the githubInstallation table & get the first row with the installationId and return the userId of the row
    const installation = await prisma.githubInstallation.findFirst({
        where: { installationId },
        select: { userId: true }
    });

    if (!installation) return null;

    return installation.userId;
}

// a function to get userInstallation Id 
export async function getUserInstallationId(userId: string) {
    // find the github installationID of the user
    const installation = await prisma.githubInstallation.findUnique({
        where: { userId },
        select: { installationId: true },
    });

    if (!installation) {
        return null;
    }

    return installation.installationId;
}

