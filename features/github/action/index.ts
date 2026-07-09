"use server";

import { getServerSession } from "@/features/auth/actions";
import { deleteInstallation } from "../server/installation";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";

export async function disconnectGithubApp() {
    // get the user session
    const session = await getServerSession();

    if (!session) {
        redirect("/sign-in");
    }

    await deleteInstallation(session.user.id);
    redirect(DASHBOARD_ROUTES.github);
}