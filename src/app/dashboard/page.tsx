import { Check, Database, ShieldCheck } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/features/auth/sign-out-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3 font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-950 text-sm font-black text-emerald-200">
              A
            </span>
            Evaluation workspace
          </div>
          <SignOutButton />
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <Badge variant="outline" className="mb-5 border-emerald-200 bg-emerald-50 text-emerald-800">
          Authenticated · database session
        </Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Good to see you, {session.user.name}.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
          The first reference slice is connected end to end. The next run can now attach
          implementation evidence to a real authenticated workflow.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>SPEC-001 coverage</CardTitle>
                <Badge className="bg-emerald-950 text-emerald-100">4 / 4 gates</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                "Email and password registration persists to PostgreSQL",
                "Protected route validates the server-side session",
                "Local development runs over HTTPS",
                "Quality and browser evidence are captured as artifacts",
              ].map((criterion) => (
                <div className="flex items-start gap-3" key={criterion}>
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-6 text-stone-700">{criterion}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-emerald-950 text-emerald-50">
            <CardHeader>
              <CardTitle>Runtime proof</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3">
                <Database className="size-5 text-emerald-300" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">PostgreSQL 18</p>
                  <p className="text-xs text-emerald-100/50">Drizzle migration applied</p>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-emerald-300" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Better Auth</p>
                  <p className="text-xs text-emerald-100/50">Session validated on server</p>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <p className="font-mono text-[11px] leading-5 text-emerald-100/45">
                user: {session.user.email}
                <br />
                session: {session.session.id.slice(0, 8)}…
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
