import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  execute: vi.fn<() => Promise<{ rows: never[] }>>(),
  getSession: vi.fn<
    () => Promise<{
      session: { id: string };
      user: { email: string; name: string };
    } | null>
  >(),
  headers: vi.fn<() => Promise<Headers>>(),
  redirect: vi.fn<(path: string) => never>(),
  routeGet: vi.fn<() => Response>(),
  routePost: vi.fn<() => Response>(),
  toNextJsHandler: vi.fn<(auth: unknown) => void>(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/db/client", () => ({ db: { execute: mocks.execute } }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: mocks.getSession } } }));
vi.mock("@/features/auth/sign-out-button", () => ({
  SignOutButton: () => <button type="button">Sign out</button>,
}));
vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: (...arguments_: unknown[]) => {
    mocks.toNextJsHandler(arguments_[0]);
    return { GET: mocks.routeGet, POST: mocks.routePost };
  },
}));

import { GET as authGet, POST as authPost } from "@/app/api/auth/[...all]/route";
import { GET as healthGet } from "@/app/api/health/route";
import DashboardPage from "@/app/dashboard/page";

describe("server routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.mockResolvedValue(new Headers({ "x-request-id": "test-request" }));
    mocks.execute.mockResolvedValue({ rows: [] });
  });

  it("exports both Better Auth route handlers", () => {
    expect(authGet).toBe(mocks.routeGet);
    expect(authPost).toBe(mocks.routePost);
  });

  it("reports health after the database responds", async () => {
    const response = await healthGet();

    expect(mocks.execute).toHaveBeenCalledOnce();
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it("renders the authenticated dashboard session", async () => {
    mocks.getSession.mockResolvedValue({
      session: { id: "session-123456789" },
      user: { email: "agent@example.test", name: "Evidence Agent" },
    });

    render(await DashboardPage());

    expect(screen.getByRole("heading", { name: "Good to see you, Evidence Agent." })).toBeVisible();
    expect(screen.getByText("4 / 4 gates")).toBeVisible();
    expect(screen.getByText(/user: agent@example\.test/)).toBeVisible();
    expect(screen.getByText(/session: session-/)).toBeVisible();
    expect(mocks.getSession).toHaveBeenCalledOnce();
  });

  it("redirects an unauthenticated request", async () => {
    mocks.getSession.mockResolvedValue(null);
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/sign-in");
  });
});
