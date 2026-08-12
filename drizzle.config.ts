import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

import { readServerEnvironment } from "./src/config/env";

loadEnvConfig(process.cwd());
const environment = readServerEnvironment();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: environment.DATABASE_URL },
  strict: true,
  verbose: true,
});
