import { beforeEach, describe, expect, it, vi } from "vitest";

interface AuthOptions {
  account: { accountLinking: { enabled: boolean }; encryptOAuthTokens: boolean };
  baseURL: string;
  emailAndPassword: { enabled: boolean; minPasswordLength: number };
  socialProviders: { google: { hd: string; prompt: string } };
}

interface DrizzleOptions {
  logger: { logQuery: (query: string, parameters: unknown[]) => void };
}

const mocks = vi.hoisted(() => ({
  authClient: { kind: "client" },
  betterAuth: vi.fn<(options: AuthOptions) => { options: AuthOptions }>(),
  createAuthClient: vi.fn<() => { kind: string }>(),
  drizzle: vi.fn<(pool: unknown, options: DrizzleOptions) => { kind: string }>(),
  drizzleAdapter: vi.fn<(database: unknown, options: unknown) => { kind: string }>(),
  environment: {
    BETTER_AUTH_SECRET: "a-secure-test-secret-with-32-characters",
    BETTER_AUTH_URL: "https://auth.example.test",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    GOOGLE_CLIENT_ID: "123456-test.apps.googleusercontent.com",
    GOOGLE_CLIENT_SECRET: "test-client-secret",
    GOOGLE_WORKSPACE_DOMAIN: "example.test",
    LOG_LEVEL: "debug",
  },
  logger: {
    debug: vi.fn<(context: { parameterCount: number; query: string }, message: string) => void>(),
  },
  poolConstructor: vi.fn<() => { kind: string }>(),
}));

vi.mock("better-auth/react", () => ({ createAuthClient: mocks.createAuthClient }));
vi.mock("better-auth", () => ({ betterAuth: mocks.betterAuth }));
vi.mock("@better-auth/drizzle-adapter", () => ({ drizzleAdapter: mocks.drizzleAdapter }));
vi.mock("@/config/env", () => ({ readServerEnvironment: () => mocks.environment }));
vi.mock("@/lib/logger", () => ({ logger: mocks.logger }));
vi.mock("@/db/schema", () => ({ schemaMarker: true }));
vi.mock("pg", () => ({ Pool: mocks.poolConstructor }));
vi.mock("drizzle-orm/node-postgres", () => ({ drizzle: mocks.drizzle }));

describe("runtime module configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    Reflect.set(globalThis, "databasePool", undefined);
    mocks.createAuthClient.mockReturnValue(mocks.authClient);
    mocks.betterAuth.mockImplementation((options) => ({ options }));
    mocks.drizzleAdapter.mockReturnValue({ kind: "adapter" });
    mocks.poolConstructor.mockImplementation(function Pool() {
      return { kind: "pool" };
    });
    mocks.drizzle.mockImplementation((_pool, options) => {
      options.logger.logQuery("select 1", ["parameter"]);
      return { kind: "database" };
    });
  });

  it("creates the browser auth client", async () => {
    const { authClient } = await import("@/lib/auth-client");

    expect(authClient).toBe(mocks.authClient);
    expect(mocks.createAuthClient).toHaveBeenCalledOnce();
  });

  it("configures secure authentication defaults", async () => {
    const { auth } = await import("@/lib/auth");

    expect(auth.options).toMatchObject({
      account: { accountLinking: { enabled: false }, encryptOAuthTokens: true },
      baseURL: "https://auth.example.test",
      emailAndPassword: { enabled: true, minPasswordLength: 12 },
      socialProviders: { google: { hd: "example.test", prompt: "select_account" } },
    });
    expect(mocks.drizzleAdapter).toHaveBeenCalledOnce();
  });

  it("creates and reuses a development database pool with query logging", async () => {
    const originalEnvironment = process.env.NODE_ENV;
    vi.stubEnv("NODE_ENV", "development");

    const { db } = await import("@/db/client");

    expect(db).toEqual({ kind: "database" });
    expect(Reflect.get(globalThis, "databasePool")).toEqual({ kind: "pool" });
    expect(mocks.logger.debug).toHaveBeenCalledWith(
      { parameterCount: 1, query: "select 1" },
      "database query executed",
    );

    vi.resetModules();
    await import("@/db/client");
    expect(mocks.poolConstructor).toHaveBeenCalledOnce();
    vi.unstubAllEnvs();
    expect(process.env.NODE_ENV).toBe(originalEnvironment);
  });
});
