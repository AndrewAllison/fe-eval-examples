import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertWorktreeName,
  createWorktreeConfig,
  parseWorktreeConfig,
  parseRuntimeWorktreeConfig,
} from "./worktree-config.ts";

describe("worktree configuration", () => {
  it("creates stable isolated identifiers and ports", () => {
    const root = resolve("/workspace/fe-eval-examples");

    expect(createWorktreeConfig(root, "auth-eval")).toEqual({
      appPort: 3757,
      branch: "worktree/auth-eval",
      composeProject: "fe-eval-examples-auth-eval",
      databasePort: 6257,
      directory: resolve("/workspace/fe-eval-examples-auth-eval"),
      name: "auth-eval",
    });
  });

  it.each(["Auth", "-auth", "auth-", "auth_eval", "a".repeat(41)])(
    "rejects invalid name %s",
    (name) => {
      expect(() => assertWorktreeName(name)).toThrow();
    },
  );

  it("rejects an incomplete descriptor", () => {
    expect(() => parseWorktreeConfig({ name: "auth-eval" })).toThrow();
  });

  it("rejects a descriptor moved to another directory", () => {
    const root = resolve("/workspace/fe-eval-examples");
    const config = createWorktreeConfig(root, "auth-eval");

    expect(() => parseRuntimeWorktreeConfig(root, config)).toThrow();
  });

  it("accepts the descriptor in its generated directory", () => {
    const root = resolve("/workspace/fe-eval-examples");
    const config = createWorktreeConfig(root, "auth-eval");

    expect(parseRuntimeWorktreeConfig(config.directory, config)).toEqual(config);
  });
});
