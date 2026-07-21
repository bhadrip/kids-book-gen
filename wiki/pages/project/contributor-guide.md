# Contributor guide

## Required reading

Read these in order before a non-trivial change:

1. [`AGENTS.md`](../../../AGENTS.md)
2. [`development.md`](../../../development.md)
3. [`agenticsdlc.md`](../../../agenticsdlc.md)
4. [`ARCHITECTURE.md`](../../../ARCHITECTURE.md)
5. The relevant document in [`spec/`](../../../spec/README.md)
6. The active task in [`tasks/mlp-v0.md`](../../../tasks/mlp-v0.md)
7. Adjacent schemas, source, and tests

For parent-facing UI changes, also read
[`spec/08-ux-guidelines.md`](../../../spec/08-ux-guidelines.md) and provide its
required screen-state and accessibility evidence.

## Local setup

Requirements are pinned to Node.js 25.9.0 and pnpm 10.17.0. The supported task
interface is `just`.

```sh
just doctor
just setup
cp .env.example .env.local
just dev
```

`just setup` installs frozen dependencies and Playwright Chromium. The app is
local-first. An OpenAI key is needed only for real text generation; normal tests
use fixtures. Never commit `.env.local`, `data/`, test artifacts, generated
books, or secrets.

## Everyday commands

| Command       | Purpose                                                       |
| ------------- | ------------------------------------------------------------- |
| `just doctor` | Diagnose runtime, package manager, browser, and configuration |
| `just dev`    | Run the local Next.js app                                     |
| `just check`  | Check formatting, ESLint, and strict TypeScript               |
| `just test`   | Run Vitest unit/integration tests                             |
| `just e2e`    | Run Playwright browser tests                                  |
| `just build`  | Validate the local production build                           |
| `just ci`     | Required merge-quality gate: all checks above                 |

## Change workflow

1. Choose one bounded vertical slice from the task board or write a task with a
   user outcome, scope, non-goals, rules, acceptance scenarios, open questions,
   and required evidence.
2. Read the relevant spec, architecture section, schemas, neighboring code, and
   tests. Do not invent unresolved product policy.
3. Implement the smallest complete, parent-discoverable behavior. An endpoint or
   persisted file alone is not a completed vertical slice.
4. Add or update tests for every acceptance scenario. Prefer Vitest for domain,
   persistence, and provider adapters; use Playwright for parent-visible flows.
5. Run focused checks while working, then `just check`; run `just ci` before
   merge or handoff.
6. Report behavior, changed files, commands/results, manual verification,
   configuration or migration needs, limitations, and architecture impact.

## Non-negotiable engineering rules

- Validate user input, environment configuration, persisted JSON, and provider
  output. Persist a schema version with every artifact.
- Keep domain rules independent of Next.js, React, filesystem details, and
  provider SDKs.
- Preserve approved artifacts; create successors and explicitly stale
  dependents when upstream decisions change.
- Inject filesystem/provider effects, clocks, and IDs where needed for tests.
- Never weaken tests, add `skip` or `only`, suppress type errors, introduce
  unchecked `any`, bypass `just`, or expose/log secrets to obtain a green run.
- Do not introduce hosted infrastructure, databases, queues, containers,
  analytics, or deployment workflows during local-only V0 without an explicit
  product decision.

## Pull-request checklist

- The change maps to a bounded task and acceptance scenarios.
- Relevant unit/integration tests pass.
- Parent-visible changes have focused Playwright coverage and accessibility
  evidence.
- `just ci` passes without paid model calls or tracked-file mutations.
- No local data, generated output, test artifacts, or secrets are committed.
- Architecture impact is declared **None** with rationale or **Updated** with
  the necessary documentation changes.
- The task/spec is updated only when durable behavior or a decision changed.

## Good first contribution targets

The current planned product priority is `VIS-01`: define the six structured,
curated art presets for the visual identity phase. Smaller useful contributions
can complete missing artifact lifecycle/staleness tests
(`DOM-02`/`TST-01`/`TST-02`) or improve documentation and fixture-backed
verification. Confirm scope against the task board before implementation because
status can change.
