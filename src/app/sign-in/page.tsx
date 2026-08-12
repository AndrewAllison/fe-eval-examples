import type { Metadata } from "next";
import React from "react";

import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to review the latest evaluation run and its release evidence."
      alternateHref="/sign-up"
      alternateLabel="Need a workspace? Create one"
    >
      <AuthForm mode="sign-in" />
    </AuthShell>
  );
}
