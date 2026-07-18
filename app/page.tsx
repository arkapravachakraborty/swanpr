"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserMenuWithSession } from "@/features/auth/components/user-menu";

const highlights = [
  {
    title: "Review faster",
    description: "Keep your pull requests organized and easy to follow.",
  },
  {
    title: "Stay synced",
    description: "Connect your repositories and monitor updates from one place.",
  },
  {
    title: "Ship confidently",
    description: "Use clear summaries and actionable next steps before merge.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8 lg:px-12">
        <div className="text-lg font-semibold tracking-tight">SwanPr</div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenuWithSession variant="compact" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 py-12 text-center sm:px-8 lg:px-12 lg:py-20">
        <div className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          Simple review workflow for modern teams
        </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
          Keep your code reviews calm, clear, and moving.
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Bring your repositories, pull requests, and review notes together in one lightweight workspace.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-in"
            className={buttonVariants({ size: "lg", className: "rounded-full" })}
          >
            Get started
          </Link>
          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "rounded-full",
            })}
          >
            Open dashboard
          </Link>
        </div>

        <div className="mt-12 grid w-full gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
