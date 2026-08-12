import { ArrowRight, Check, GitPullRequestArrow, Rocket, ScanSearch } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const stages = [
  {
    title: "Specify",
    detail: "Turn an idea into testable acceptance criteria and an evidence plan.",
    icon: ScanSearch,
  },
  {
    title: "Evaluate",
    detail: "Run deterministic quality gates and capture the browser journey.",
    icon: GitPullRequestArrow,
  },
  {
    title: "Release",
    detail: "Ship a traceable PR with a preview, proof, and release provenance.",
    icon: Rocket,
  },
] as const;

export default function Home() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#07110e] text-white">
      <div className="hero-grid absolute inset-0 -z-20" />
      <div className="absolute -top-64 left-1/2 -z-10 size-[42rem] -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link className="flex items-center gap-3 font-semibold tracking-tight" href="/">
          <span className="grid size-8 place-items-center rounded-lg bg-emerald-300 text-sm font-black text-emerald-950">
            A
          </span>
          AISDLC / Frontend
        </Link>
        <Link
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white",
          )}
          href="/sign-in"
        >
          Sign in
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:pb-28 lg:pt-24">
        <div className="max-w-3xl">
          <Badge className="mb-7 border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
            Reference workflow · SPEC-001
          </Badge>
          <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            From intent to release, with the receipts.
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-white/65 sm:text-xl">
            A working reference for agent-led frontend delivery where every decision, check, browser
            interaction, and release is connected to a specification.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 bg-emerald-300 px-5 text-emerald-950 hover:bg-emerald-200",
              )}
              href="/sign-up"
            >
              Start the reference flow
              <ArrowRight aria-hidden="true" />
            </Link>
            <a
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "h-11 px-5 text-white/75 hover:bg-white/10 hover:text-white",
              )}
              href="#workflow"
            >
              Inspect the workflow
            </a>
          </div>
          <ul className="mt-10 grid gap-3 text-sm text-white/55 sm:grid-cols-3">
            {["PostgreSQL backed", "HTTPS locally", "Evidence as an artifact"].map((item) => (
              <li className="flex items-center gap-2" key={item}>
                <Check className="size-4 text-emerald-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative self-end lg:pl-8">
          <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-emerald-300/5 blur-xl" />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1713]/90 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="size-2 rounded-full bg-white/20" />
                <span className="size-2 rounded-full bg-white/20" />
                <span className="size-2 rounded-full bg-emerald-300" />
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
                evaluation run #001
              </span>
            </div>
            <div className="space-y-5 p-6 font-mono text-sm">
              <p className="text-white/35">$ pnpm verify</p>
              {[
                ["format", "passed", "0.3s"],
                ["static analysis", "passed", "1.1s"],
                ["unit tests", "passed", "0.8s"],
                ["production build", "passed", "4.2s"],
                ["browser evidence", "captured", "3 artifacts"],
              ].map(([label, result, time]) => (
                <div className="grid grid-cols-[1fr_auto] items-center gap-4" key={label}>
                  <div className="flex items-center gap-3">
                    <span className="grid size-5 place-items-center rounded-full bg-emerald-300/15 text-emerald-300">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    <span className="text-white/75">{label}</span>
                  </div>
                  <span className="text-right text-xs text-white/35">
                    {result} · {time}
                  </span>
                </div>
              ))}
              <div className="rounded-lg border border-emerald-300/15 bg-emerald-300/5 p-4 text-xs leading-6 text-emerald-100/70">
                Evidence manifest linked to IDEA-001 → SPEC-001 → commit → PR → release.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-7xl border-t border-white/10 px-6 py-20 lg:px-10"
        id="workflow"
      >
        <div className="mb-10 flex max-w-2xl flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">
            The proof loop
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Evidence is designed before code is written.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {stages.map(({ title, detail, icon: Icon }, index) => (
            <Card className="border-white/10 bg-white/[0.035] text-white" key={title}>
              <CardHeader>
                <div className="mb-8 flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/[0.06] text-emerald-300">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs text-white/30">0{index + 1}</span>
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent className="leading-7 text-white/55">{detail}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
