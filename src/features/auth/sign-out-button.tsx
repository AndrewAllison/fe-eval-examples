"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = useCallback(() => {
    setPending(true);

    const completeSignOut = async () => {
      try {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      } catch {
        setPending(false);
      }
    };

    void completeSignOut();
  }, [router]);

  return (
    <Button variant="outline" onClick={signOut} disabled={pending}>
      <LogOut aria-hidden="true" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
