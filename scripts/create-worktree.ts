import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, constants, copyFileSync, existsSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { createWorktreeConfig } from "./worktree-config.ts";

function capture(command: string, args: string[], cwd: string): string {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
}

function run(command: string, args: string[], cwd: string): void {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

async function assertPortAvailable(port: number): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const server = createServer();
    server.once("error", () => {
      reject(new Error(`Port ${port} is already in use.`));
    });
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolvePromise());
    });
  });
}

const [separator, name, ...additionalArguments] = process.argv.slice(2);
if (separator !== "--" || !name || additionalArguments.length > 0) {
  throw new Error("Usage: pnpm worktree:create -- <name>");
}

const repositoryRoot = capture("git", ["rev-parse", "--show-toplevel"], process.cwd());
const branch = capture("git", ["branch", "--show-current"], repositoryRoot);
if (branch !== "main") {
  throw new Error("Worktrees must be created from the main branch.");
}

if (capture("git", ["status", "--porcelain"], repositoryRoot)) {
  throw new Error("The main worktree must be clean before creating a worktree.");
}

const sourceEnvironment = resolve(repositoryRoot, ".env.local");
if (!existsSync(sourceEnvironment)) {
  throw new Error(".env.local must exist before creating a runnable worktree.");
}

const config = createWorktreeConfig(repositoryRoot, name);
if (existsSync(config.directory)) {
  throw new Error(`Worktree directory already exists: ${config.directory}`);
}

const branchCheck = spawnSync(
  "git",
  ["show-ref", "--verify", "--quiet", `refs/heads/${config.branch}`],
  { cwd: repositoryRoot, stdio: "ignore" },
);
if (branchCheck.status === 0) {
  throw new Error(`Worktree branch already exists: ${config.branch}`);
}
if (branchCheck.status !== 1) {
  throw new Error("Unable to determine whether the worktree branch exists.");
}

await assertPortAvailable(config.appPort);
await assertPortAvailable(config.databasePort);

run("git", ["worktree", "add", "-b", config.branch, config.directory, "main"], repositoryRoot);
copyFileSync(sourceEnvironment, resolve(config.directory, ".env.local"), constants.COPYFILE_EXCL);
chmodSync(resolve(config.directory, ".env.local"), 0o600);
writeFileSync(resolve(config.directory, ".worktree.json"), `${JSON.stringify(config, null, 2)}\n`, {
  encoding: "utf8",
  flag: "wx",
  mode: 0o600,
});
run("pnpm", ["install", "--frozen-lockfile"], config.directory);

process.stdout.write(
  [
    "Created isolated runnable worktree.",
    `Directory: ${config.directory}`,
    `Branch: ${config.branch}`,
    `Application: https://localhost:${config.appPort}`,
    `PostgreSQL: localhost:${config.databasePort}`,
    `Start: cd ${config.directory} && pnpm worktree:dev`,
    "",
  ].join("\n"),
);
