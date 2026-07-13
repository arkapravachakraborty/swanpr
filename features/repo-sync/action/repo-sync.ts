"use server";

import { getServerSession } from "@/features/auth/actions";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { getUserInstallationId } from "@/features/github/server/installation";
import { redirect } from "next/navigation";
import { triggerRepoSync } from "../server/repo-sync";

export async function syncRepoCodebase(repoFullName: string, branch: string) {
    // get the session from the serversession
    const session = await getServerSession();
    // no session redirect to signin
    if (!session) {
        redirect("/sign-in");
    }

    // get the installationID
    const installationId = await getUserInstallationId(session.user.id);

    // no installationId redirect to dashboard github page
    if (!installationId) {
        redirect(DASHBOARD_ROUTES.github);
    }

    // create a function to trigger
    await triggerRepoSync(installationId, repoFullName, branch);

}