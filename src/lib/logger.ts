import pino from "pino";

import { readServerEnvironment } from "@/config/env";

const environment = readServerEnvironment();

export const logger = pino({
  level: environment.LOG_LEVEL,
  base: { service: "frontend-aisdlc-reference" },
  redact: {
    paths: [
      "password",
      "token",
      "secret",
      "authorization",
      "cookie",
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.secret",
    ],
    censor: "[REDACTED]",
  },
});
