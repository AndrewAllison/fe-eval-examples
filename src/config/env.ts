import { z } from "zod";

const googleClientId = /^[0-9]+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i;
const workspaceDomain = /^(?!-)(?:[a-z0-9-]+\.)+[a-z]{2,}$/i;

const serverEnvironmentSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().regex(googleClientId),
  GOOGLE_CLIENT_SECRET: z.string().min(16),
  GOOGLE_WORKSPACE_DOMAIN: z.string().trim().toLowerCase().regex(workspaceDomain),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function readServerEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): ServerEnvironment {
  return serverEnvironmentSchema.parse(environment);
}
