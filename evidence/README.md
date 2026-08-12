# Evidence contract

Each run is stored under `evidence/runs/<run-id>` and contains:

- Full-page screenshots of the public and authenticated states.
- Accessibility snapshots for semantic review.
- A WebM recording of registration and protected navigation.
- Browser console and page-error output.
- `manifest.json`, linking artifacts to specification acceptance criteria and recording SHA-256 checksums.

Generated runs are ignored by Git. CI uploads each run as an immutable workflow artifact; the PR links the workflow run rather than committing binary evidence to the source tree.
