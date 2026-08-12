import { sql } from "drizzle-orm";

import { db } from "@/db/client";

export async function GET() {
  await db.execute(sql`select 1`);

  return Response.json({ status: "ok" });
}
