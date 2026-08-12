import { drizzle } from "drizzle-orm/node-postgres";
import type { Logger } from "drizzle-orm/logger";
import { Pool } from "pg";

import { readServerEnvironment } from "@/config/env";
import * as schema from "@/db/schema";
import { logger } from "@/lib/logger";

class QueryLogger implements Logger {
  logQuery(query: string, parameters: unknown[]): void {
    logger.debug({ query, parameterCount: parameters.length }, "database query executed");
  }
}

const globalDatabase = globalThis as typeof globalThis & {
  databasePool?: Pool;
};

const pool =
  globalDatabase.databasePool ??
  new Pool({ connectionString: readServerEnvironment().DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  globalDatabase.databasePool = pool;
}

export const db = drizzle(pool, { logger: new QueryLogger(), schema });
