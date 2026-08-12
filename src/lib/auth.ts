import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";

import { readServerEnvironment } from "@/config/env";
import { db } from "@/db/client";
import * as schema from "@/db/schema";

const environment = readServerEnvironment();

export const auth = betterAuth({
  appName: "Frontend AISDLC Reference",
  baseURL: environment.BETTER_AUTH_URL,
  secret: environment.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: {
    google: {
      clientId: environment.GOOGLE_CLIENT_ID,
      clientSecret: environment.GOOGLE_CLIENT_SECRET,
      hd: environment.GOOGLE_WORKSPACE_DOMAIN,
      prompt: "select_account",
    },
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: false,
    },
  },
});
