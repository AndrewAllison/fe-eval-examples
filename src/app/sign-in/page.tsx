import type { Metadata } from "next";
import React from "react";

import { AuthShell } from "@/components/auth-shell";
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
      description="Use your organisation Google account to review evaluation runs and release evidence."
    >
      <WorkspaceSignIn oauthError={Boolean(error)} />
    </AuthShell>
  );
}
