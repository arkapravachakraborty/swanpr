import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { saveInstallation } from "@/features/github/server/installation";
import { getServerSession } from "@/features/auth/actions";
import { redirect } from "next/navigation";


function buildSignInCallbackUrl(installationId: string | null): string {
    if (installationId) {
        return `/api/github/callback?installation_id=${installationId}`;
    }
    return DASHBOARD_ROUTES.github;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const installationId = searchParams.get("installation_id");
    const session = await getServerSession();

    if (!session) {
        // tell user to go to sign in page and then redirect back to this page with the installation_id
        const callbackUrl = buildSignInCallbackUrl(installationId);
        // redirect to sign in page with callback url
        redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }

    if (installationId) {
        // save the installation id to the user's account
        await saveInstallation(session.user.id, Number(installationId));
    }

    // redirect to the dashboard/github
    redirect(DASHBOARD_ROUTES.github);
}