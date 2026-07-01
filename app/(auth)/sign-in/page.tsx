import React from 'react';

import Image from 'next/image';
import type { Metadata } from 'next';

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from "@/components/ui/card";

import { FieldDescription } from "@/components/ui/field";
import { GithubSignInForm } from '@/features/auth/components/github-sign-in-form';


export const metadata: Metadata = {
    title: "Sign-in",
    description: "Sign in to SwanPr with your Github account",
};

type SignInPageProps = {
    searchParams: Promise<{ callbackUrl: string }>;
}

const SignInPage = async ({ searchParams }: SignInPageProps) => {
    const { callbackUrl } = await searchParams;
    return (
        <Card className="w-full border-border/80 bg-background/95 shadow-sm">
            <CardHeader className="items-center gap-3 px-6 pt-8 text-center sm:px-8">
                <div className="flex justify-center pt-2">
                    <Image
                        src="/logo2.png"
                        alt="Swan Pr Code Reviewer"
                        width={172}
                        height={172}
                        priority
                        className="text-foreground"
                    />
                </div>
                <div className="space-y-2">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Sign in with GitHub to review and manage your code.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 px-6 pb-8 sm:px-8">
                <div className="bg-red-700 rounded-2xl">
                    <GithubSignInForm callbackUrl={callbackUrl} />
                </div>
                <FieldDescription className="mx-auto max-w-sm text-center text-xs text-muted-foreground balance-text">
                    We only request the permissions needed to identify your
                    account. You can revoke access anytime from GitHub settings.
                </FieldDescription>
            </CardContent>
        </Card>
    )
}

export default SignInPage