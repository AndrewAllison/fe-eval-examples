import type { Metadata } from "next";
import React from "react";

import { AuthShell } from "@/components/auth-shell";
import { Separator } from "@/components/ui/separator";
import { CredentialAuthForm } from "@/features/auth/credential-auth-form";
import { WorkspaceSignIn } from "@/features/auth/workspace-sign-in";

export const metadata: Metadata = { title: "Sign in" };

interface SignInPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Continue to the workspace"
      description="Use your organisation account or deterministic evaluation credentials."
      alternateHref="/sign-up"
      alternateLabel="Create an evaluation account"
    >
      <div className="grid gap-6">
        <WorkspaceSignIn oauthError={Boolean(error)} />
        <div className="relative">
          <Separator className="bg-white/10" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0d1915] px-3 text-xs uppercase tracking-wider text-white/35">
            Evaluation credentials
          </span>
        </div>
        <CredentialAuthForm mode="sign-in" />
      </div>
    </AuthShell>
  );
}
