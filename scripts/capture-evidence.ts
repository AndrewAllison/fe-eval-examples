import nextEnvironment from "@next/env";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";

const authorizationSchema = z.object({
  origin: z.literal("https://accounts.google.com"),
  pathname: z.string().min(1),
  hostedDomain: z.string(),
  redirectUri: z.url(),
  responseType: z.literal("code"),
  scopes: z.array(z.string()).min(1),
});

const { loadEnvConfig } = nextEnvironment;
loadEnvConfig(process.cwd());

const runId = process.env.EVIDENCE_RUN_ID;
const password = process.env.EVIDENCE_PASSWORD;
const workspaceDomain = process.env.GOOGLE_WORKSPACE_DOMAIN;

if (!runId || !/^[a-z0-9-]+$/.test(runId)) {
  throw new Error("EVIDENCE_RUN_ID must contain lowercase letters, numbers, or hyphens.");
}

if (!workspaceDomain) {
  throw new Error("GOOGLE_WORKSPACE_DOMAIN must be present.");
}

if (!password || password.length < 12) {
  throw new Error("EVIDENCE_PASSWORD must contain at least 12 characters.");
}

const baseUrl = "https://localhost:3000";
const email = `evidence+${runId}@example.test`;
const runsDirectory = resolve("evidence", "runs");
const outputDirectory = resolve(runsDirectory, runId);
const session = `evidence-${runId}`;

function browser(...arguments_: string[]): string {
  const result = spawnSync(
    "pnpm",
    ["exec", "agent-browser", "--session", session, "--ignore-https-errors", ...arguments_],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    throw new Error(`agent-browser failed: ${result.stderr || result.stdout}`);
  }

  return result.stdout;
}

function git(...arguments_: string[]): string {
  const result = spawnSync("git", arguments_, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

if (git("status", "--porcelain")) {
  throw new Error("Evidence capture requires a clean Git worktree.");
}
const revision = git("rev-parse", "HEAD");

await mkdir(runsDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: false });

browser("open", `${baseUrl}/dashboard`);
browser("wait", "--url", "**/sign-in");
browser("wait", "--fn", 'document.body.innerText.includes("Continue to the workspace")');
browser("screenshot", resolve(outputDirectory, "00-protected-redirect.png"), "--full");
browser("open", baseUrl);
browser("wait", "--fn", 'document.body.innerText.includes("From intent to release")');
browser("screenshot", resolve(outputDirectory, "01-home.png"), "--full");
await writeFile(resolve(outputDirectory, "01-home.snapshot.txt"), browser("snapshot", "-i"));

browser("open", `${baseUrl}/sign-in`);
browser("wait", "--fn", 'document.body.innerText.includes("Continue with Google")');
await writeFile(resolve(outputDirectory, "02-sign-in.snapshot.txt"), browser("snapshot", "-i"));
const serializedAuthorization = browser(
  "eval",
  `(async () => {
    const response = await fetch("/api/auth/sign-in/social", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider: "google", callbackURL: "/dashboard" })
    });
    const payload = await response.json();
    const url = new URL(payload.url);
    return JSON.stringify({
      origin: url.origin,
      pathname: url.pathname,
      hostedDomain: url.searchParams.get("hd"),
      redirectUri: url.searchParams.get("redirect_uri"),
      responseType: url.searchParams.get("response_type"),
      scopes: url.searchParams.get("scope")?.split(" ").toSorted()
    });
  })()`,
);
const encodedAuthorization = z.string().parse(JSON.parse(serializedAuthorization) as unknown);
const authorization = authorizationSchema.parse(JSON.parse(encodedAuthorization) as unknown);

if (authorization.hostedDomain !== workspaceDomain) {
  throw new Error("OAuth authorization did not contain the configured Workspace domain.");
}

await writeFile(
  resolve(outputDirectory, "03-google-authorization.json"),
  `${JSON.stringify(authorization, null, 2)}\n`,
);

browser("record", "start", resolve(outputDirectory, "04-registration.webm"), `${baseUrl}/sign-up`);
browser("wait", "--fn", 'document.body.innerText.includes("Create an evaluation account")');
browser("find", "label", "Name", "fill", "Evidence Agent");
browser("find", "label", "Evaluation email", "fill", email);
browser("find", "label", "Password", "fill", password);
browser("screenshot", resolve(outputDirectory, "04-registration-ready.png"), "--full");
browser("find", "role", "button", "click", "--name", "Create evaluation account");
browser("wait", "--url", "**/dashboard");
browser("wait", "--fn", 'document.body.innerText.includes("Good to see you, Evidence Agent")');
browser("wait", "750");
browser("record", "stop");
browser("screenshot", resolve(outputDirectory, "05-dashboard-after-registration.png"), "--full");
await writeFile(
  resolve(outputDirectory, "05-dashboard-after-registration.snapshot.txt"),
  browser("snapshot", "-i"),
);

browser("record", "start", resolve(outputDirectory, "06-sign-out-and-in.webm"));
browser("wait", "500");
browser("find", "role", "button", "click", "--name", "Sign out");
browser("wait", "--fn", 'location.pathname === "/"');
browser("open", baseUrl);
browser("wait", "--fn", 'document.body.innerText.includes("From intent to release")');
browser("screenshot", resolve(outputDirectory, "06-signed-out.png"), "--full");
browser("open", `${baseUrl}/sign-in`);
browser("wait", "--fn", 'document.body.innerText.includes("Sign in with credentials")');
browser("find", "label", "Evaluation email", "fill", email);
browser("find", "label", "Password", "fill", password);
browser("find", "role", "button", "click", "--name", "Sign in with credentials");
browser("wait", "--url", "**/dashboard");
browser("wait", "--fn", 'document.body.innerText.includes("Good to see you, Evidence Agent")');
browser("wait", "750");
browser("record", "stop");
browser("screenshot", resolve(outputDirectory, "07-dashboard-after-sign-in.png"), "--full");
await writeFile(
  resolve(outputDirectory, "07-dashboard-after-sign-in.snapshot.txt"),
  browser("snapshot", "-i"),
);
const browserErrors = browser("errors");
await writeFile(resolve(outputDirectory, "browser-errors.txt"), browserErrors);
await writeFile(resolve(outputDirectory, "browser-console.txt"), browser("console"));
browser("close");

if (browserErrors.trim()) {
  throw new Error("Browser errors were captured; evidence is not valid.");
}

const artifactNames = [
  "00-protected-redirect.png",
  "01-home.png",
  "01-home.snapshot.txt",
  "02-sign-in.snapshot.txt",
  "03-google-authorization.json",
  "04-registration.webm",
  "04-registration-ready.png",
  "05-dashboard-after-registration.png",
  "05-dashboard-after-registration.snapshot.txt",
  "06-sign-out-and-in.webm",
  "06-signed-out.png",
  "07-dashboard-after-sign-in.png",
  "07-dashboard-after-sign-in.snapshot.txt",
  "browser-errors.txt",
  "browser-console.txt",
];
const artifacts = await Promise.all(
  artifactNames.map(async (name) => {
    const contents = await readFile(resolve(outputDirectory, name));
    return {
      name,
      sha256: createHash("sha256").update(contents).digest("hex"),
    };
  }),
);

await writeFile(
  resolve(outputDirectory, "manifest.json"),
  `${JSON.stringify(
    {
      runId,
      revision,
      specification: "SPEC-001",
      requirements: ["AC-001", "AC-002", "AC-003", "AC-004"],
      baseUrl,
      artifacts,
    },
    null,
    2,
  )}\n`,
);

process.stdout.write(`Evidence captured in evidence/runs/${runId}.\n`);
