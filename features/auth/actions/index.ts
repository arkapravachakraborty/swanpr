"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_AUTH_CALLBACK, getSafeCallbackPath, SIGN_IN_PATH } from "../utils";

// this function start the github oauth sign-in and redirect the browser to github connect screen
// it wiil take an input form data
export async function signInWithGithub(formData: FormData) {
    // we need this formdata from the form so that we can get the callbackUrl value
    const callback = formData.get("callbackUrl");

    // sanitize the callback path and sends it
    const redirectTo = getSafeCallbackPath(
        typeof callback === "string" ? callback : null
    )
    const result = await auth.api.signInSocial({
        body: {
            provider: "github",
            callbackURL: redirectTo,
        },
        headers: await headers(),
    })

    if (result.url) {
        redirect(result.url);
    }
}

// server side current loggedin user data in a session
export async function getServerSession() {
    return auth.api.getSession({
        headers: await headers(),
    })
}

// a function when user is not loggedin and redirect to sign in
export async function requiredAuth(redirectTo = SIGN_IN_PATH) {
    // get the session
    const session = await getServerSession();

    // if no sesion then go to sign in
    if (!session) {
        redirect(redirectTo);
    }

    return session;
}

export async function requiredUnauth(redirectTo = DEFAULT_AUTH_CALLBACK) {
    // get the session
    const session = await getServerSession();

    // if sesion & go to sign in then it redirect to dashboard
    if (session) {
        redirect(redirectTo);
    }

}

