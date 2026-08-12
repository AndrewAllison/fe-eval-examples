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
    void authClient.signOut().then(() => {
      router.push("/");
      router.refresh();
    });
  }, [router]);

  return (
    <Button variant="outline" onClick={signOut} disabled={pending}>
      <LogOut aria-hidden="true" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
