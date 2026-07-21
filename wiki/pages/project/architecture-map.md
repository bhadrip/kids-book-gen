# Architecture map

## Dependency direction

```text
UI and route handlers
  -> application services
    -> domain schemas and rules
    -> adapters (repository, providers, jobs, images, PDF)
```

UI and API routes must not call filesystem APIs or provider SDKs directly.
Application services coordinate the workflow. Domain rules and Zod schemas stay
independent of Next.js and React. Adapters contain filesystem and provider
details. Provider calls, filesystem access, clocks, and ID generation should be
injectable for tests.

Canonical source: [`ARCHITECTURE.md`](../../../ARCHITECTURE.md).

## Implemented structure

| Area                   | Location                                       | Responsibility                                                    |
| ---------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| Pages and API routes   | `src/app/`                                     | Parent-visible journeys and HTTP boundaries                       |
| Shared UI              | `src/components/`                              | Project journey and accessible pending forms                      |
| Domain schemas         | `src/lib/projects/project.ts`                  | Versioned project, story, evaluation, decision, and job contracts |
| Persistence adapter    | `src/lib/projects/file-project-repository.ts`  | Validated reads and atomic local JSON writes                      |
| Workflow service       | `src/lib/directions/story-workflow-service.ts` | Direction/story generation, revisions, decisions, and job state   |
| Provider boundary      | `src/lib/directions/text-provider.ts`          | Text generation and evaluation interface                          |
| Provider adapters      | `src/lib/directions/*-text-provider.ts`        | OpenAI production adapter and deterministic fixture adapter       |
| Configuration          | `src/lib/config/app-config.ts`                 | Validated server-side environment configuration                   |
| Unit/integration tests | `src/lib/**/*.test.ts`                         | Domain, repository, config, progress, and workflow behavior       |
| Browser tests          | `e2e/home.spec.ts`                             | Complete fixture-only parent journeys                             |

## Persistence flow

Each project is stored under `data/projects/<uuid>/`. The repository validates
the UUID, prevents paths outside the configured root, parses JSON through Zod,
and writes through a temporary file followed by an atomic rename. Current and
numbered revision artifacts coexist so history is retained.

Representative artifacts include `project.json`, `brief.json`,
`directions-01.json`, `directions.json`, `selected-direction.json`,
`story-01.json`, `story.json`, `story-decision.json`, and
`text-generation-job.json`. Quality checks add
`story-evaluation-<revision>.json` and the current `story-evaluation.json`;
the current artifact is rendered only when a parent expands its disclosure.

## Story-quality gate

After each provider-generated manuscript, `StoryWorkflowService` evaluates five
explicit dimensions: idea fidelity, causal structure, age fit, oral flow, and
safety. Outcomes are `pass`, `revision_required`, or `escalation_required`; the
schema derives the overall outcome from the dimension outcomes instead of
inventing an uncalibrated numeric threshold.

A repairable result supplies bounded instructions and named strengths to
preserve. The service creates at most one numbered successor, re-evaluates it,
and then stops. An unresolved or escalated result preserves the latest story and
records a failed job whose safe artifact is `story.json`.

## Provider and test isolation

`KIDS_BOOK_TEXT_PROVIDER` chooses the OpenAI or fixture adapter. The OpenAI API
key stays server-only. Playwright runs a fixture-provider server on port 3100
with test-only build and project directories. Normal verification must never
call paid providers or write into a parent's local project library.

## When architecture documentation must change

Every pull request includes an architecture-impact assessment:

- **None:** explain why the change stays within documented boundaries.
- **Updated:** update `ARCHITECTURE.md` and affected canonical detail.

An update is required for changes to user journeys, feature/domain ownership,
dependency direction, interfaces, data models or lifecycle, external
integrations, trust boundaries, runtime behavior, or operational constraints.
