import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema } from "@/features/auth/credentials";

describe("credential validation", () => {
  it("normalizes a valid registration", () => {
    const result = signUpSchema.parse({
      name: "  Evidence Agent  ",
      email: "  AGENT@EXAMPLE.TEST ",
      password: "a-secure-password",
    });

    expect(result).toEqual({
      name: "Evidence Agent",
      email: "agent@example.test",
      password: "a-secure-password",
    });
  });

  it("rejects short passwords", () => {
    const result = signInSchema.safeParse({
      email: "agent@example.test",
      password: "too-short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects malformed email addresses", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "a-secure-password",
    });

    expect(result.success).toBe(false);
  });
});
