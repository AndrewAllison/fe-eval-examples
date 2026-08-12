"use client";

import { useRouter } from "next/navigation";
import React, { type FormEvent, useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInSchema, signUpSchema } from "@/features/auth/credentials";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

interface CredentialAuthFormProps {
  mode: AuthMode;
}

async function authenticate(form: HTMLFormElement, mode: AuthMode): Promise<string | null> {
  const data = new FormData(form);
  const common = {
    email: data.get("email"),
    password: data.get("password"),
  };

  if (mode === "sign-up") {
    const result = signUpSchema.safeParse({ ...common, name: data.get("name") });
    if (!result.success) {
      return result.error.issues[0]?.message ?? "Registration details are invalid.";
    }
    const response = await authClient.signUp.email(result.data);
    return response.error?.message ?? null;
  }

  const result = signInSchema.safeParse(common);
  if (!result.success) {
    return result.error.issues[0]?.message ?? "Sign-in details are invalid.";
  }
  const response = await authClient.signIn.email(result.data);
  return response.error?.message ?? null;
}

export function CredentialAuthForm({ mode }: CredentialAuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isSignUp = mode === "sign-up";

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setPending(true);
      const form = event.currentTarget;

      void authenticate(form, mode)
        .then((authenticationError) => {
          if (authenticationError) {
            setError(authenticationError);
            return;
          }
          router.push("/dashboard");
          router.refresh();
        })
        .catch(() => setError("Authentication failed. Try again."))
        .finally(() => setPending(false));
    },
    [mode, router],
  );

  return (
    <form className="grid gap-5" onSubmit={submit} noValidate>
      {isSignUp ? (
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" minLength={2} required />
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="email">Evaluation email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={12}
          required
        />
        {isSignUp ? (
          <p className="text-xs leading-5 text-white/45">Use at least 12 characters.</p>
        ) : null}
      </div>
      {error ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <Button className="h-10 w-full" type="submit" disabled={pending}>
        {pending ? "Working…" : isSignUp ? "Create evaluation account" : "Sign in with credentials"}
      </Button>
    </form>
  );
}
