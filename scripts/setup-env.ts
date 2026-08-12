import { randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { access, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const target = resolve(process.cwd(), ".env.local");

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be present in the process environment.`);
  }
  return value;
}

const googleClientId = requireEnvironment("GOOGLE_CLIENT_ID");
const googleClientSecret = requireEnvironment("GOOGLE_CLIENT_SECRET");
const googleWorkspaceDomain = requireEnvironment("GOOGLE_WORKSPACE_DOMAIN");

try {
  await access(target, constants.F_OK);
  throw new Error(".env.local already exists; refusing to overwrite it.");
} catch (error: unknown) {
  if (error instanceof Error && error.message.includes("refusing")) {
    throw error;
  }
}

const secret = randomBytes(32).toString("base64url");
const contents = [
  "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aisdlc",
  `BETTER_AUTH_SECRET=${secret}`,
  "BETTER_AUTH_URL=https://localhost:3000",
  `GOOGLE_CLIENT_ID=${googleClientId}`,
  `GOOGLE_CLIENT_SECRET=${googleClientSecret}`,
  `GOOGLE_WORKSPACE_DOMAIN=${googleWorkspaceDomain}`,
  "LOG_LEVEL=info",
  "",
].join("\n");

await writeFile(target, contents, { encoding: "utf8", mode: 0o600, flag: "wx" });
process.stdout.write("Created .env.local with generated and supplied authentication settings.\n");
