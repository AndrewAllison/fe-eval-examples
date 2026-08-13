import { describe, expect, it } from "vitest";

import { readServerEnvironment } from "@/config/env";

const validEnvironment = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/aisdlc",
  BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-characters",
  BETTER_AUTH_URL: "https://localhost:3000",
  GOOGLE_CLIENT_ID: "123456789-test.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "test-client-secret",
  GOOGLE_WORKSPACE_DOMAIN: "example.com",
  LOG_LEVEL: "info",
} as const satisfies NodeJS.ProcessEnv;

describe("server environment", () => {
  it("normalizes the Workspace domain", () => {
    const environment = readServerEnvironment({
      ...validEnvironment,
      GOOGLE_WORKSPACE_DOMAIN: " Example.COM ",
    });

    expect(environment.GOOGLE_WORKSPACE_DOMAIN).toBe("example.com");
  });

  it("rejects a missing Google client secret", () => {
    const { GOOGLE_CLIENT_SECRET: _, ...environment } = validEnvironment;

    expect(() => readServerEnvironment(environment)).toThrow(/GOOGLE_CLIENT_SECRET/);
  });

  it("rejects an invalid Workspace domain", () => {
    expect(() =>
      readServerEnvironment({ ...validEnvironment, GOOGLE_WORKSPACE_DOMAIN: "not-a-domain" }),
    ).toThrow(/GOOGLE_WORKSPACE_DOMAIN/);
  });
});
