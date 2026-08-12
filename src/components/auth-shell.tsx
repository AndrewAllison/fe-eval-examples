import Link from "next/link";
import React, { type ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthShellProps {
  children: ReactNode;
  description: string;
  title: string;
}

export function AuthShell({ children, description, title }: AuthShellProps) {
  return (
    <main className="auth-grid grid min-h-screen place-items-center bg-[#07110e] px-5 py-12 text-white">
      <div className="w-full max-w-md">
        <Link className="mb-8 flex items-center gap-3 font-semibold" href="/">
          <span className="grid size-8 place-items-center rounded-lg bg-emerald-300 text-sm font-black text-emerald-950">
            A
          </span>
          AISDLC / Frontend
        </Link>
        <Card className="border-white/10 bg-[#0d1915]/95 text-white shadow-2xl shadow-black/35">
          <CardHeader className="gap-3 pb-2">
            <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
            <p className="leading-6 text-white/55">{description}</p>
          </CardHeader>
          <CardContent className="pt-5">{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
