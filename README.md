# Frontend AISDLC reference

A runnable reference for taking a frontend idea through specification, implementation, evaluation, pull request, and release with machine-verifiable evidence.

## Prerequisites

- Node.js 24
- pnpm 11
- Docker
- `mkcert` for locally trusted HTTPS certificates
- A Google Cloud OAuth web client owned by the Google Workspace organisation

## Run locally

```bash
pnpm install --frozen-lockfile
# Export GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_WORKSPACE_DOMAIN
# from your secret manager before running this command.
pnpm env:setup
pnpm db:up
pnpm db:migrate
pnpm dev
```

Open [https://localhost:3000](https://localhost:3000). Next.js creates a local certificate for the HTTPS development server.

## Verify a change

```bash
pnpm verify
```

This runs the AI SDLC RAG audit, formatting, type-aware linting, TypeScript, dependency guardrails, dead-code analysis, unit tests with coverage, migration validation, and a production build.

## Generate the AI SDLC audit

Run the commit-pinned [frontend SDLC audit](https://github.com/AndrewAllison/frontend-sdlc-audit):

```bash
pnpm ai-sdlc:audit
```

Open `.artifacts/ai-sdlc-audit/ai-sdlc-audit.html` for the RAG report or consume `ai-sdlc-audit.json` in automation. Pull requests upload both files as a retained workflow artifact. The baseline audit publishes evidence without blocking merges; `pnpm ai-sdlc:audit:strict` is available once the reported red controls have been resolved.

## Capture browser evidence

Start the application and provide a unique run identifier plus a disposable test password:

```bash
EVIDENCE_RUN_ID=local-001 EVIDENCE_PASSWORD='test-only-password' pnpm evidence:capture
```

The ignored `evidence/runs/<run-id>` directory contains videos and screenshots of credential registration, sign-out, and sign-in; accessibility snapshots; a sanitized Google authorization record; browser diagnostics; and a checksum manifest. The disposable password is never written to the evidence pack. Completing the employee-owned Google callback is a manual acceptance check and is never recorded by CI.

Configure the Google OAuth client with `https://localhost:3000` as an authorized JavaScript origin and `https://localhost:3000/api/auth/callback/google` as an authorized redirect URI. Set the app audience to **Internal** in a Google Cloud project owned by the Workspace organisation.

## Database workflow

Edit `src/db/schema.ts`, then generate and apply a versioned migration:

```bash
pnpm db:generate
pnpm db:migrate
```

Use `pnpm db:down` to stop PostgreSQL. The named volume retains local data.

## Work in an isolated worktree

From a clean `main` worktree, create a named sibling worktree:

```bash
pnpm worktree:create -- my-task
cd ../fe-eval-examples-my-task
pnpm worktree:dev
```

The creation command branches from the current local `main`, copies the ignored local authentication environment without displaying it, installs locked dependencies, and assigns deterministic application and PostgreSQL ports. Docker resources and database data are scoped to the worktree. The command fails if either assigned port is already in use.

Use `pnpm worktree:down` inside the generated worktree to stop its PostgreSQL container. Its named volume retains the isolated database data.

Credential authentication works on every generated port. To use Google authentication, add the generated application origin and callback URL to the Google OAuth client.
