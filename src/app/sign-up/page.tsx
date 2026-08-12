import type { Metadata } from "next";
import React from "react";

import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = { title: "Create workspace" };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create the reference workspace"
      description="This account is persisted in PostgreSQL and protected by a database-backed session."
      alternateHref="/sign-in"
      alternateLabel="Already have a workspace? Sign in"
    >
      <AuthForm mode="sign-up" />
    </AuthShell>
  );
}
