"use client";

import React, { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface WorkspaceSignInProps {
  oauthError: boolean;
}

export function WorkspaceSignIn({ oauthError }: WorkspaceSignInProps) {
  const [error, setError] = useState(oauthError);
  const [pending, setPending] = useState(false);

  const signInWithGoogle = useCallback(() => {
    setError(false);
    setPending(true);

    void authClient.signIn
      .social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/sign-in?error=workspace-auth",
      })
      .then((result) => setError(Boolean(result.error)))
      .catch(() => setError(true))
      .finally(() => setPending(false));
  }, []);

  return (
    <div className="grid gap-3">
      {error ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          Sign-in failed. Use your organisation Google Workspace account and try again.
        </p>
      ) : null}
      <Button
        className="h-11 w-full bg-white text-stone-900 hover:bg-stone-100"
        type="button"
        disabled={pending}
        onClick={signInWithGoogle}
      >
        <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.39 13.87A6.02 6.02 0 0 1 6.07 12c0-.65.11-1.28.32-1.87V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.61Z"
          />
          <path
            fill="#EA4335"
            d="M12 6c1.47 0 2.8.51 3.84 1.5l2.87-2.88A9.66 9.66 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.61C7.18 7.76 9.39 6 12 6Z"
          />
        </svg>
        {pending ? "Connecting…" : "Continue with Google"}
      </Button>
      <p className="text-center text-xs leading-5 text-white/45">
        Google access requires the configured Workspace organisation.
      </p>
    </div>
  );
}
