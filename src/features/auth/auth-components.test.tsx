import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn<(path: string) => void>(),
  refresh: vi.fn<() => void>(),
  signInEmail:
    vi.fn<
      (input: { email: string; password: string }) => Promise<{ error: null | { message: string } }>
    >(),
  signUpEmail:
    vi.fn<
      (input: {
        email: string;
        name: string;
        password: string;
      }) => Promise<{ error: null | { message: string } }>
    >(),
  social:
    vi.fn<
      (input: {
        callbackURL: string;
        errorCallbackURL: string;
        provider: string;
      }) => Promise<{ error: null | { message: string } }>
    >(),
  signOut: vi.fn<() => Promise<void>>(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: { email: mocks.signInEmail, social: mocks.social },
    signOut: mocks.signOut,
    signUp: { email: mocks.signUpEmail },
  },
}));

import { CredentialAuthForm } from "@/features/auth/credential-auth-form";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { WorkspaceSignIn } from "@/features/auth/workspace-sign-in";

async function completeCredentialForm(mode: "sign-in" | "sign-up") {
  const user = userEvent.setup();
  render(<CredentialAuthForm mode={mode} />);

  if (mode === "sign-up") {
    await user.type(screen.getByLabelText("Name"), "Evidence Agent");
  }
  await user.type(screen.getByLabelText("Evaluation email"), "AGENT@EXAMPLE.TEST");
  await user.type(screen.getByLabelText("Password"), "a-secure-password");
  await user.click(
    screen.getByRole("button", {
      name: mode === "sign-up" ? "Create evaluation account" : "Sign in with credentials",
    }),
  );
}

describe("credential authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signInEmail.mockResolvedValue({ error: null });
    mocks.signUpEmail.mockResolvedValue({ error: null });
  });

  it("signs in and routes to the protected workspace", async () => {
    await completeCredentialForm("sign-in");

    await waitFor(() =>
      expect(mocks.signInEmail).toHaveBeenCalledWith({
        email: "agent@example.test",
        password: "a-secure-password",
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/dashboard");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("creates an evaluation account", async () => {
    await completeCredentialForm("sign-up");

    await waitFor(() =>
      expect(mocks.signUpEmail).toHaveBeenCalledWith({
        email: "agent@example.test",
        name: "Evidence Agent",
        password: "a-secure-password",
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/dashboard");
  });

  it("reports invalid credentials before calling the auth service", async () => {
    const user = userEvent.setup();
    render(<CredentialAuthForm mode="sign-in" />);

    await user.type(screen.getByLabelText("Evaluation email"), "invalid");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Sign in with credentials" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Enter a valid email address.");
    expect(mocks.signInEmail).not.toHaveBeenCalled();
  });

  it("reports service errors and rejected requests", async () => {
    mocks.signInEmail.mockResolvedValueOnce({ error: { message: "Account is locked." } });
    await completeCredentialForm("sign-in");
    expect(await screen.findByRole("alert")).toHaveTextContent("Account is locked.");
    cleanup();

    mocks.signInEmail.mockRejectedValueOnce(new Error("network unavailable"));
    await completeCredentialForm("sign-in");
    expect(await screen.findByText("Authentication failed. Try again.")).toBeVisible();
  });
});

describe("workspace authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears an initial OAuth error after a successful retry", async () => {
    const user = userEvent.setup();
    mocks.social.mockResolvedValue({ error: null });
    render(<WorkspaceSignIn oauthError />);

    expect(screen.getByRole("alert")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(mocks.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/dashboard",
      errorCallbackURL: "/sign-in?error=workspace-auth",
    });
  });

  it("reports OAuth responses and rejected requests", async () => {
    const user = userEvent.setup();
    mocks.social.mockResolvedValueOnce({ error: { message: "denied" } });
    const { unmount } = render(<WorkspaceSignIn oauthError={false} />);
    await user.click(screen.getByRole("button", { name: "Continue with Google" }));
    expect(await screen.findByRole("alert")).toBeVisible();
    unmount();

    mocks.social.mockRejectedValueOnce(new Error("network unavailable"));
    render(<WorkspaceSignIn oauthError={false} />);
    await user.click(screen.getByRole("button", { name: "Continue with Google" }));
    expect(await screen.findByRole("alert")).toBeVisible();
  });
});

describe("sign out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signs out and routes home", async () => {
    const user = userEvent.setup();
    mocks.signOut.mockResolvedValue(undefined);
    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/"));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("allows a retry when sign out fails", async () => {
    const user = userEvent.setup();
    mocks.signOut.mockRejectedValue(new Error("network unavailable"));
    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled());
  });
});
