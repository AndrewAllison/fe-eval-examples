import { createTableRelationsHelpers } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "@/db/schema";

describe("authentication database schema", () => {
  it("defines the expected tables and indexes", () => {
    expect(getTableConfig(user).name).toBe("user");
    expect(getTableConfig(session).indexes).toHaveLength(1);
    expect(getTableConfig(account).indexes).toHaveLength(1);
    expect(getTableConfig(verification).indexes).toHaveLength(1);
  });

  it("generates fresh update timestamps", () => {
    const timestamps = [
      user.updatedAt.onUpdateFn?.(),
      session.updatedAt.onUpdateFn?.(),
      account.updatedAt.onUpdateFn?.(),
      verification.updatedAt.onUpdateFn?.(),
    ];

    expect(timestamps).toHaveLength(4);
    expect(timestamps.every((timestamp) => timestamp instanceof Date)).toBe(true);
  });

  it("maps user, session, and account relations", () => {
    const userConfig = userRelations.config(createTableRelationsHelpers(user));
    const sessionConfig = sessionRelations.config(createTableRelationsHelpers(session));
    const accountConfig = accountRelations.config(createTableRelationsHelpers(account));

    expect(Object.keys(userConfig)).toEqual(["sessions", "accounts"]);
    expect(sessionConfig.user.referencedTable).toBe(user);
    expect(accountConfig.user.referencedTable).toBe(user);
  });
});
