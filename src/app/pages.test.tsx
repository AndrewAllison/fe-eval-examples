import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-sans" }),
  Geist_Mono: () => ({ variable: "font-mono" }),
}));

vi.mock("@/features/auth/credential-auth-form", () => ({
  CredentialAuthForm: ({ mode }: { mode: string }) => <div>credentials:{mode}</div>,
}));

vi.mock("@/features/auth/workspace-sign-in", () => ({
  WorkspaceSignIn: ({ oauthError }: { oauthError: boolean }) => (
    <div>workspace:{String(oauthError)}</div>
  ),
}));

import RootLayout, { metadata as rootMetadata } from "@/app/layout";
import Home from "@/app/page";
import SignInPage, { metadata as signInMetadata } from "@/app/sign-in/page";
import SignUpPage, { metadata as signUpMetadata } from "@/app/sign-up/page";
import { AuthShell } from "@/components/auth-shell";

describe("application pages", () => {
  it("renders the home workflow and navigation", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "From intent to release, with the receipts." }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
    expect(screen.getAllByText(/passed ·/)).toHaveLength(4);
    expect(screen.getByText("Specify")).toBeVisible();
    expect(screen.getByText("Evaluate")).toBeVisible();
    expect(screen.getByText("Release")).toBeVisible();
  });

  it("constructs the root document and metadata", () => {
    const layout = RootLayout({ children: <span>content</span> });

    expect(layout.props.lang).toBe("en");
    expect(layout.props.className).toContain("font-sans font-mono");
    expect(layout.props.children.props.children.props.children).toBe("content");
    expect(rootMetadata.title).toEqual({
      default: "Frontend AISDLC Reference",
      template: "%s · Frontend AISDLC Reference",
    });
  });

  it("renders sign-in state from resolved search parameters", async () => {
    render(await SignInPage({ searchParams: Promise.resolve({ error: "workspace-auth" }) }));

    expect(screen.getByText("workspace:true")).toBeVisible();
    expect(screen.getByText("credentials:sign-in")).toBeVisible();
    expect(screen.getByRole("link", { name: "Create an evaluation account" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
    expect(signInMetadata.title).toBe("Sign in");
  });

  it("renders the sign-up page", () => {
    render(<SignUpPage />);

    expect(screen.getByText("credentials:sign-up")).toBeVisible();
    expect(screen.getByRole("link", { name: "Already have an account? Sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
    expect(signUpMetadata.title).toBe("Create evaluation account");
  });

  it("renders an authentication shell without an alternate route", () => {
    render(
      <AuthShell title="Title" description="Description">
        Child
      </AuthShell>,
    );

    expect(screen.getByText("Child")).toBeVisible();
    expect(screen.queryByLabelText("alternate")).not.toBeInTheDocument();
  });
});
