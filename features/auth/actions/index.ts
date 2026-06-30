"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// this function start the github oauth sign-in and redirect the browser to github connect screen
// it wiil take an input form data
export async function signInWithGithub(formData: FormData) {
    // we need this formdata from the form so that we can get the callbackUrl value
    const callback = formData.get("callbackUrl");

    // to do fix the call back later 
    const result = await auth.api.signInSocial({
        body: {
            provider: "github",
            callbackURL: "/dashboard",
        },
        headers: await headers(),
    })

    if (result.url) {
        redirect(result.url);
    }
}