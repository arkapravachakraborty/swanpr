import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { nextCookies } from "better-auth/next-js";

const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const auth = betterAuth({
    baseURL: baseUrl,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,

            //FORCE Better Auth to send the absolute URI to GitHub
            redirectURI: `${baseUrl.replace(/\/$/, "")}/api/auth/callback/github`,

            mapProfileToUser: async (profile) => ({
                email: profile.email ?? `${profile.id}@users.noreply.github.com`,
                name: profile.name ?? profile.login,
            })
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    plugins: [nextCookies()]
});