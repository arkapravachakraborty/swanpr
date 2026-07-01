import React from "react";

export default async function AuthLayout({
    children
}: {
    children: React.ReactNode
}
) {
    return (
        <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    )
}