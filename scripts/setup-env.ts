import { randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { access, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const target = resolve(process.cwd(), ".env.local");

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
  "LOG_LEVEL=info",
  "",
].join("\n");

await writeFile(target, contents, { encoding: "utf8", mode: 0o600, flag: "wx" });
process.stdout.write("Created .env.local with a generated authentication secret.\n");
