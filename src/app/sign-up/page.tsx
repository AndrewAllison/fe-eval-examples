import type { Metadata } from "next";
import React from "react";

import { AuthShell } from "@/components/auth-shell";
import { CredentialAuthForm } from "@/features/auth/credential-auth-form";

export const metadata: Metadata = { title: "Create evaluation account" };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create an evaluation account"
      description="Use a disposable credential identity for deterministic browser evaluation."
      alternateHref="/sign-in"
      alternateLabel="Already have an account? Sign in"
    >
      <CredentialAuthForm mode="sign-up" />
    </AuthShell>
  );
}
