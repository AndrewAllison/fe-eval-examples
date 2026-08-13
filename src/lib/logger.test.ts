import { beforeEach, describe, expect, it, vi } from "vitest";

interface LoggerOptions {
  level: string;
  redact: { censor: string; paths: string[] };
}

const mocks = vi.hoisted(() => ({
  environment: { LOG_LEVEL: "debug" },
  pino: vi.fn<(options: LoggerOptions) => { kind: string }>(),
}));

vi.mock("pino", () => ({ default: mocks.pino }));
vi.mock("@/config/env", () => ({ readServerEnvironment: () => mocks.environment }));

describe("structured logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.pino.mockReturnValue({ kind: "logger" });
  });

  it("redacts credentials", async () => {
    const { logger } = await import("@/lib/logger");
    const options = mocks.pino.mock.calls.at(0)?.[0];

    expect(logger).toEqual({ kind: "logger" });
    expect(options?.level).toBe("debug");
    expect(options?.redact.censor).toBe("[REDACTED]");
    expect(options?.redact.paths).toEqual(
      expect.arrayContaining(["password", "req.headers.authorization", "*.secret"]),
    );
  });
});
