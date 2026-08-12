# Evidence contract

Each run is stored under `evidence/runs/<run-id>` and contains:

- Full-page screenshots of public, registration, signed-out, sign-in, and authenticated states.
- Accessibility snapshots for semantic review.
- WebM recordings of credential registration and the sign-out/sign-in journey.
- A sanitized record of the Google authorization request and hosted-domain constraint.
- Browser console and page-error output.
- `manifest.json`, linking artifacts to specification acceptance criteria and recording SHA-256 checksums.

Generated runs are ignored by Git. CI uploads each run as an immutable workflow artifact; the PR links the workflow run rather than committing binary evidence to the source tree. Credential recordings use disposable evaluation identities. Interactive Google account selection and callback completion are not recorded by CI because they contain employee identity data.
