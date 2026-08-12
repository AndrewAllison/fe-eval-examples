# Frontend AISDLC reference

A runnable reference for taking a frontend idea through specification, implementation, evaluation, pull request, and release with machine-verifiable evidence.

## Prerequisites

- Node.js 24
- pnpm 11
- Docker
- `mkcert` for locally trusted HTTPS certificates

## Run locally

```bash
pnpm install --frozen-lockfile
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

Start the application and provide a unique run identifier plus a test-only password:

```bash
EVIDENCE_RUN_ID=local-001 EVIDENCE_PASSWORD='test-only-password' pnpm evidence:capture
```

The ignored `evidence/runs/<run-id>` directory contains screenshots, accessibility snapshots, a video, browser diagnostics, and a checksum manifest.

## Database workflow

Edit `src/db/schema.ts`, then generate and apply a versioned migration:

```bash
pnpm db:generate
pnpm db:migrate
```

Use `docker compose down` to stop PostgreSQL. The named volume retains local data.
