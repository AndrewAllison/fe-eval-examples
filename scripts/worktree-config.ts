import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";
import { z } from "zod";

const WORKTREE_NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
const PORT_SLOTS = 700;
const worktreeConfigSchema = z.object({
  appPort: z.int(),
  branch: z.string().min(1),
  composeProject: z.string().min(1),
  databasePort: z.int(),
  directory: z.string().min(1),
  name: z.string().min(1),
});

export interface WorktreeConfig {
  appPort: number;
  branch: string;
  composeProject: string;
  databasePort: number;
  directory: string;
  name: string;
}

export function assertWorktreeName(name: string): void {
  if (!WORKTREE_NAME_PATTERN.test(name)) {
    throw new Error(
      "Worktree name must be 1-40 lowercase letters, numbers, or hyphens and cannot start or end with a hyphen.",
    );
  }
}

export function createWorktreeConfig(repositoryRoot: string, name: string): WorktreeConfig {
  assertWorktreeName(name);

  const repositoryName = basename(repositoryRoot);
  const { appPort, databasePort } = createWorktreePorts(name);
  const directory = resolve(repositoryRoot, "..", `${repositoryName}-${name}`);

  return {
    appPort,
    branch: `worktree/${name}`,
    composeProject: basename(directory),
    databasePort,
    directory,
    name,
  };
}

export function parseRuntimeWorktreeConfig(repositoryRoot: string, value: unknown): WorktreeConfig {
  const config = parseWorktreeConfig(value);
  const ports = createWorktreePorts(config.name);
  const valid =
    config.appPort === ports.appPort &&
    config.branch === `worktree/${config.name}` &&
    config.composeProject === basename(repositoryRoot) &&
    config.databasePort === ports.databasePort &&
    resolve(config.directory) === resolve(repositoryRoot);

  if (!valid) {
    throw new Error("Worktree configuration does not belong to this directory.");
  }

  return config;
}

export function parseWorktreeConfig(value: unknown): WorktreeConfig {
  const result = worktreeConfigSchema.safeParse(value);
  if (!result.success) {
    throw new Error(".worktree.json does not contain a valid worktree configuration.");
  }

  assertWorktreeName(result.data.name);
  return result.data;
}

function createWorktreePorts(name: string): {
  appPort: number;
  databasePort: number;
} {
  const digest = createHash("sha256").update(name).digest();
  const slot = digest.readUInt32BE(0) % PORT_SLOTS;
  return { appPort: 3100 + slot, databasePort: 5600 + slot };
}
