import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseRuntimeWorktreeConfig } from "./worktree-config.ts";

const command = process.argv[2];
if (command !== "dev" && command !== "down") {
  throw new Error("Usage: node scripts/worktree-runtime.ts <dev|down>");
}

const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const configPath = resolve(root, ".worktree.json");
const config = parseRuntimeWorktreeConfig(root, JSON.parse(readFileSync(configPath, "utf8")));

const runtimeEnvironment = {
  ...process.env,
  BETTER_AUTH_URL: `https://localhost:${config.appPort}`,
  DATABASE_URL: `postgresql://postgres:postgres@localhost:${config.databasePort}/aisdlc`,
  POSTGRES_PORT: String(config.databasePort),
};
const composeArgs = ["compose", "--project-name", config.composeProject];

if (command === "down") {
  execFileSync("docker", [...composeArgs, "down"], {
    cwd: root,
    env: runtimeEnvironment,
    stdio: "inherit",
  });
  process.exit(0);
}

execFileSync("docker", [...composeArgs, "up", "-d", "--wait", "database"], {
  cwd: root,
  env: runtimeEnvironment,
  stdio: "inherit",
});
execFileSync("pnpm", ["db:migrate"], {
  cwd: root,
  env: runtimeEnvironment,
  stdio: "inherit",
});

const result = spawnSync("pnpm", ["dev", "--", "--port", String(config.appPort)], {
  cwd: root,
  env: runtimeEnvironment,
  stdio: "inherit",
});
if (result.status === null) {
  throw new Error("Development server terminated without an exit status.");
}
process.exit(result.status);
