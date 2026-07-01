import { NextRequest } from "next/server";
import { handleAuthProxy } from "./features/auth/utils/auth-proxy";

export async function proxy(request: NextRequest) {
    return handleAuthProxy(request);
}

// only on this path the middleware will run
export const config = {
    matcher: ["/sign-in", "/dashboard", "/dashboard/:path*"]
};