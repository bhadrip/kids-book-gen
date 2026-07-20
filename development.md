# Local development contract

This project is intentionally local-first for V0. It creates personalized books
on the developer's laptop, keeps project assets on that laptop, and does not
include staging, production hosting, accounts, or shared infrastructure.

The purpose of this document is to keep that constraint from becoming fragile as
features and agent-assisted development are added.

## Principles

- Build one complete vertical slice at a time. A slice must be runnable before
  starting the next one.
- Keep product rules independent of Next.js routes, React components, filesystem
  details, and OpenAI SDK calls.
- Validate all untrusted boundaries: form input, persisted JSON, environment
  configuration, and provider responses.
- Preserve approved work. A changed decision creates a successor artifact and
  marks dependent artifacts stale; it does not overwrite approved artifacts.
- Make every generation reproducible enough to diagnose: record schema version,
  input artifact IDs, prompt version, model, request settings, timestamp, and
  cost estimate.
- Tests and CI define correctness. Agents can implement and diagnose changes but
  must not substitute their judgment for automated checks or parent approval.

## Tooling baseline

Use a single, reproducible toolchain for humans and coding agents.

| Concern                | Choice                                                                   | Rule                                                               |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| JavaScript runtime     | Node.js, pinned in `.tool-versions` with asdf                            | Commit exact versions; do not rely on a global Node version.       |
| Package manager        | pnpm, pinned through `packageManager` and Corepack                       | Commit `pnpm-lock.yaml`; use frozen installs in verification.      |
| Task entry point       | `Justfile`                                                               | Prefer `just` recipes over one-off shell commands.                 |
| Formatting             | Prettier                                                                 | Formatting is automatic or checked before merge.                   |
| Linting                | ESLint with TypeScript, React Hooks, accessibility, and Playwright rules | Do not suppress a lint rule without a short local justification.   |
| Type safety            | TypeScript strict mode and Zod                                           | No `any`, unchecked parsed JSON, or ignored type errors.           |
| Unit/integration tests | Vitest                                                                   | Test domain, persistence, and provider adapters without a browser. |
| Browser tests          | Playwright (Chromium)                                                    | Test complete user-visible flows with isolated local project data. |
| Commit hook            | Husky + lint-staged                                                      | Keep hooks fast: format and lint staged files only.                |

Python and `uv` are not part of the application runtime. If a future local-only
helper needs a Python CLI (for example, visual analysis), run it in an isolated
environment with `uvx` and pin it in the recipe that calls it. Do not introduce
a Python service or a second persistence path without a product need.

## Required commands

The `Justfile` is the supported interface. Once it exists, it must provide:

```text
just setup       # install pinned dependencies and local browser requirements
just dev         # run the app locally
just check       # format check, lint, and typecheck
just test        # Vitest suite
just e2e         # Playwright suite
just build       # production build validation, still run locally
just ci          # check + test + e2e + build
just doctor      # explain missing runtime, browser, or required environment config
```

`just ci` is the merge-quality command. It must not call paid external model
APIs or alter tracked source files.

## Code boundaries

Keep these seams explicit from the first working slice:

```text
UI/routes -> application services -> domain + schemas -> adapters
                                                   -> ProjectRepository
                                                   -> ArtifactStore
                                                   -> JobRunner
                                                   -> TextProvider
                                                   -> ImageProvider
                                                   -> PdfRenderer
```

- React components and route handlers call application services, never OpenAI or
  filesystem APIs directly.
- Provider adapters are the only place that imports the OpenAI SDK.
- The local JSON/files implementation is an adapter, not an assumption spread
  through the codebase.
- Provider calls, filesystem access, clocks, and ID creation must be injectable
  in tests.
- Use Zod schemas for every artifact and persist a schema version with it.

This is deliberately more structure than a throwaway prototype, but it does not
require a database, queue service, Docker, or hosted storage.

## Local data and secrets

- Keep all generated projects under `data/projects/<project-id>/`.
- Ignore `data/`, `.env.local`, Playwright output, traces, screenshots, and PDF
  test output in Git.
- Commit `.env.example` with variable names and safe example values only.
- `OPENAI_API_KEY` stays server-only. Never expose it through a
  `NEXT_PUBLIC_` variable or log it.
- Impose the product's per-book generation budget locally and persist a cost
  estimate with each provider request.
- Write a successful job output atomically and persist progress after each
  spread, so app restarts do not lose completed work.

## Testing contract

### Unit and integration tests

Cover schemas, artifact lifecycle/staleness, project persistence, budget
accounting, prompt construction, and provider-error mapping. Use temporary
directories and deterministic fake IDs/clocks.

Provider tests use fixtures. Normal tests must never make a paid OpenAI request.
A manually invoked local smoke recipe may call the real API only when it has an
explicit hard budget and reports actual usage.

### Browser tests

Use user-visible Playwright locators (`getByRole`, labels, and text), web-first
assertions, and a fresh project directory per test. Retain a trace, screenshot,
and HTML report when an E2E test fails.

The first required E2E coverage is:

1. A parent's `must keep` details appear at every approval checkpoint.
2. An upstream edit stales only dependent artifacts.
3. An interrupted generation resumes after restart.
4. Regenerating one spread retains approved sibling spreads.
5. The finished proof has every required page, non-empty text, and no layout
   overflow.
6. Missing configuration and provider failures produce a clear, safe recovery
   state.

## Agent-assisted development

Agents should make small, reviewable changes and close their loop with evidence:

1. Read the relevant schema, existing tests, and local instructions first.
2. Make the smallest change that completes one behavior.
3. Add or update a test that demonstrates the behavior.
4. Run the narrowest relevant verification, then `just check` before handoff.
5. For UI work, run the focused Playwright test and inspect its trace or
   screenshot on failure.
6. Stop and report a blocker after a bounded number of targeted retries; do not
   make broad speculative rewrites.

Agents must not weaken tests, add `skip`/`only`, suppress type errors, bypass
the task recipes, or commit generated books/secrets merely to obtain a green
result.

## Deferred until deployment is in scope

Do not add staging environments, cloud credentials, hosted databases, Redis,
containers, background-worker infrastructure, analytics platforms, or deployment
workflows for V0 local development. The adapter seams above are enough to make
those deliberate future changes rather than a rewrite.
