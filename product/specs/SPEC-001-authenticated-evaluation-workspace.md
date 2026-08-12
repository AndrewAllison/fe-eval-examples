# SPEC-001: Authenticated evaluation workspace

Source idea: `IDEA-001`

## Scope

Deliver a responsive Next.js reference application with organisation-restricted Google Workspace authentication, deterministic credential authentication, a protected dashboard, sign-out, PostgreSQL persistence, and an evidence-producing verification workflow.

## Acceptance criteria

### AC-001: Dual-path authentication

Given PostgreSQL is healthy and migrated, when an employee authenticates with Google, then Better Auth verifies the signed hosted-domain claim against the configured Workspace domain. When an evaluator registers or signs in with valid credentials, Better Auth creates a database-backed session and navigates to `/dashboard`.

Evidence: automated Google authorization-request inspection, credential registration and sign-in videos, authenticated screenshots, accessibility snapshots, migration verification, and manual employee callback acceptance.

### AC-002: Protected access

Given no valid session, when a visitor requests `/dashboard`, then the server redirects the visitor to `/sign-in` without rendering protected data.

Evidence: production build, browser navigation result.

### AC-003: Secure development transport and telemetry

Given the local development command is running, when a browser connects, then the application is served over HTTPS. Structured application and query logs redact credentials, cookies, tokens, and secrets, and never include query parameter values.

Evidence: HTTPS browser URL, logger unit/static inspection, browser diagnostics.

### AC-004: Deterministic evaluation

Given a proposed code change, when `pnpm verify` runs, then formatting, linting, type checks, dependency rules, dead-code checks, tests, migration checks, and the production build must all pass before evidence is accepted.

Evidence: CI job conclusion, coverage artifact, browser evidence manifest.

## Quality attributes

- Server components own protected data access.
- Client components receive only fields required to render or mutate UI.
- Modules under `src/components` and `src/features` cannot import database, environment, server-auth, or logger modules.
- Test coverage thresholds are 80% for statements, branches, functions, and lines.
- Evidence artifacts are immutable within a run and addressed by SHA-256 checksums.

## Non-goals

- Email verification and password reset.
- Multi-tenant authorization and role-based access control.
- Pactum or contract-level BDD; this follows after the initial HTTP API surface is defined.
- A hosted preview provider; CI and release hooks are provider-neutral until access is connected.
