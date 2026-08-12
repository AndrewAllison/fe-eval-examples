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
docker compose up -d --wait database
pnpm db:migrate
pnpm dev
```

Open [https://localhost:3000](https://localhost:3000). Next.js creates a local certificate for the HTTPS development server.

## Verify a change

```bash
pnpm verify
```

This runs formatting, type-aware linting, TypeScript, dependency guardrails, dead-code analysis, unit tests with coverage, migration validation, and a production build.

## Capture browser evidence

Start the application and provide a unique run identifier:

```bash
EVIDENCE_RUN_ID=local-001 pnpm evidence:capture
```

The ignored `evidence/runs/<run-id>` directory contains screenshots, accessibility snapshots, a sanitized Google authorization record, browser diagnostics, and a checksum manifest. Completing the employee-owned Google callback is a manual acceptance check and is never recorded by automation.

Configure the Google OAuth client with `https://localhost:3000` as an authorized JavaScript origin and `https://localhost:3000/api/auth/callback/google` as an authorized redirect URI. Set the app audience to **Internal** in a Google Cloud project owned by the Workspace organisation.

## Database workflow

Edit `src/db/schema.ts`, then generate and apply a versioned migration:

```bash
pnpm db:generate
pnpm db:migrate
```

Use `docker compose down` to stop PostgreSQL. The named volume retains local data.
