import { auth } from "@/lib/auth";
import { getSafeCallbackPath, SIGN_IN_PATH } from ".";
import { NextRequest, NextResponse } from "next/server";

// make a function redirect to signin
function redirectToSignIn(request: NextRequest, pathname: string) {
    const signInUrl = new URL(SIGN_IN_PATH, request.url);

    // Include query string so filters/search params survive the round-trip through sign-in.
    signInUrl.searchParams.set(
        "callbackUrl",
        `${pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(signInUrl);
}

function getPostAuthRedirectPath(request: NextRequest): string {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    return getSafeCallbackPath(callbackUrl);
}


// "/sign-in": logged-in user not get this, they redirect & guest proced
export async function handleAuthProxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === "/") {
        return NextResponse.next();
    }

    const session = await auth.api.getSession({
        headers: request.headers
    })

    if (pathname === SIGN_IN_PATH) {
        if (session) {
            const redirectPath = getPostAuthRedirectPath(request);
            return NextResponse.redirect(new URL(redirectPath, request.url));
        }
        return NextResponse.next();
    }

    if (!session) {
        return redirectToSignIn(request, pathname);
    }

    return NextResponse.next();
}