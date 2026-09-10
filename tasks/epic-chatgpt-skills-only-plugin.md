# Epic: Publish the children's-book workflows as a skills-only plugin

## Status

Proposed. This epic defines an independently shippable first release. It does
not introduce hosted storage, an MCP server, user accounts, billing, or a
provider-controlled image-generation pipeline.

## Outcome and user

As a parent, educator, author, or book reviewer, I can install one Children's
Book Studio plugin and use its specialist skills in ChatGPT or Codex so that I
can create and review a high-quality children's-book package without learning
the repository's internal workflow or prompt conventions.

## Product hypothesis

The current skills contain enough reusable reasoning, rubrics, references, and
output contracts to deliver meaningful value without a hosted backend. A
skills-only release can validate whether users understand and value the guided
workflow before the project takes on hosted infrastructure and operational
cost.

The release succeeds when users can complete text and planning workflows from
inline inputs or uploaded files and can understand which outputs they must
download or carry into a later conversation.

## In scope

- Package the related repository skills as one portable Agent Plugins package.
- Preserve one focused `SKILL.md` per recognizable user goal.
- Make every skill portable outside this repository:
  - accept inline text, uploaded files, or host-provided file references;
  - avoid requiring repository-specific absolute paths;
  - bundle every required reference, schema, script, and template;
  - explain prerequisites and missing-input behavior;
  - produce portable, named artifacts that a user can download or reuse.
- Include the creation, planning, illustration-direction, review, and
  revision-brief skills that pass the release-readiness audit.
- Define starter prompts that demonstrate the primary user journeys.
- Add positive, negative, routing, schema, and regression test cases.
- Add a canonical, version-controlled skills workflow diagram and maintenance
  instructions for future agents.
- Test installation from a repository-local marketplace before submission.
- Prepare a skills-only public submission package and listing materials.

## Out of scope

- Persistent projects across chats.
- Server-owned approval or revision state.
- Guaranteed image generation or a guaranteed image-model version.
- Provider-controlled image costs, retries, or long-running generation jobs.
- Hosted PDF rendering or binary-asset storage.
- Authentication, subscriptions, billing, or multi-user authorization.
- Exposing the developer laptop's `data/` or `output/` directories.

## User journeys

### Journey 1 — Create a behavior story

1. The user describes a desired behavior, reader age, reading mode, and
   optional interests or must-keep details.
2. The plugin selects `preschool-behavior-story`.
3. The skill produces a developmentally appropriate story package with a
   complete manuscript and spread plan.
4. The user can download or copy the structured result.

### Journey 2 — Evaluate a manuscript

1. The user supplies `story.json`, a reader age, and a reading mode.
2. The plugin selects `evaluate-story-quality` rather than an illustration or
   production reviewer.
3. The skill validates its inputs, applies the versioned rubric, and returns
   machine-readable and reader-readable results.
4. The evaluation does not silently rewrite the manuscript.

### Journey 3 — Prepare visual production

1. The user supplies an approved story and required planning inputs.
2. The plugin produces a character-performance plan and then a Visual Bible.
3. Each artifact identifies its source inputs and unresolved prerequisites.
4. An illustration request produces an illustration-ready brief and uses a
   host image capability only when one is available and authorized.

### Journey 4 — Review an illustrated book

1. The user uploads an ordered page set or PDF and, when available, its
   planning artifacts.
2. The plugin selects the appropriate specialist reviewer or reviewers.
3. Findings cite page-level visual evidence and distinguish planning problems
   from image-execution problems.
4. `build-book-revision-brief` consolidates selected findings without changing
   the approved book or claiming that a revision was performed.

## Skill inventory and release classification

| Skill | Skills-only role | Release requirement |
| --- | --- | --- |
| `preschool-behavior-story` | Create the story package | Accept conversational inputs and portable output destinations. |
| `evaluate-story-quality` | Evaluate manuscript text | Make validation scripts and schemas portable in the supported host. |
| `build-character-performance-plan` | Create EmotionalArc and performance plan | Accept uploaded or inline approved-story artifacts. |
| `build-visual-bible` | Create visual locks and continuity references | Remove assumptions about Studio-local preset or asset lookup. |
| `illustrate-preschool-story` | Create prompts and optionally request host image generation | Clearly distinguish an illustration brief from a generated image. |
| `build-book-continuity-proof` | Plan a low-cost proof and optionally use host image generation | Return a useful proof manifest even when image generation is unavailable. |
| `review-book-emotional-arc` | Review emotional continuity | Support proof-only mode when planning artifacts are absent. |
| `review-book-environment-prop-continuity` | Review environment and prop continuity | Support proof-only and planning-only modes. |
| `review-book-text-image-production` | Review cross-modal and production accessibility | Require an ordered rendered page set, not extracted text alone. |
| `build-book-revision-brief` | Consolidate findings into bounded revision work | Preserve approval state and identify required reruns. |

## Workstreams

### SKP-1 — Use cases and workflow map

- Define one user-facing use case for every included skill.
- Record required inputs, outputs, prerequisites, stopping conditions, and
  downstream consumers.
- Add the canonical Mermaid workflow to a repository documentation page.
- Add an instruction requiring agents to update that workflow whenever a skill
  is added, removed, renamed, or changes its dependencies or handoff.

### SKP-2 — Portability audit

- Inspect every `SKILL.md` and every transitively required file.
- Replace absolute and repository-only paths with portable input contracts.
- Ensure required scripts do not rely on unbundled packages or mutable local
  state.
- Ensure every skill can produce a useful result when no MCP server exists.
- Mark host-dependent features such as image generation explicitly.

### SKP-3 — Plugin packaging

- Add a root `plugin.json` using the portable Agent Plugins schema.
- Place the distributable skill directories under the plugin's `skills/`
  directory.
- Add customer-facing name, description, category, and starter prompts.
- Add a repository-local marketplace entry for installation testing.
- Keep package identity and version stable across rebuilds.

### SKP-4 — Evaluation harness

- Add routing tests that demonstrate correct skill selection.
- Add at least five realistic positive end-to-end cases.
- Add at least three negative cases covering missing or contradictory inputs.
- Validate structured artifacts against their bundled schemas.
- Include regression fixtures derived from Tavi and the Turnip without making
  generated binary outputs part of the plugin contract.

### SKP-5 — Submission readiness

- Prepare the plugin listing, logo, website, support, privacy, and terms URLs.
- Complete publisher identity and organizational permission prerequisites.
- Document which data remains in the ChatGPT conversation and which files the
  user must explicitly provide.
- Submit as **Skills only** after local installation and evaluation pass.

## Acceptance scenarios

1. Given a fresh supported ChatGPT or Codex environment with the plugin
   installed, when a user requests a preschool behavior story, then the correct
   skill produces a complete, age-appropriate story package without an MCP
   connection.
2. Given a valid manuscript, age, and reading mode, when the user requests a
   text evaluation, then the plugin selects the text-only evaluator and returns
   schema-valid results without modifying the source.
3. Given an approved story and complete prerequisites, when the user requests
   production planning, then the performance plan and Visual Bible preserve
   source lineage and do not invent missing approvals.
4. Given only a PDF or ordered pages, when the user requests a continuity
   review, then the plugin uses proof-only mode and does not claim fidelity to
   unavailable plans.
5. Given a request for final images when no image-generation capability is
   available, then the plugin returns an illustration-ready brief and clearly
   explains that no image was generated.
6. Given stale, contradictory, or incomplete prerequisites, then the affected
   skill reports the exact problem instead of silently manufacturing a valid
   lineage.
7. Given unrelated writing or image requests, then specialist skills do not
   activate merely because a child or picture is mentioned.
8. Given an added, removed, renamed, or dependency-changed skill, then the same
   change updates the canonical workflow diagram and its skill inventory.

## Verification and evidence

- Plugin manifest and package validation pass.
- Every bundled skill resolves all required local references.
- All structured outputs pass their schema validators.
- Routing, five positive, and three negative submission cases pass repeatedly.
- The plugin installs from the repository marketplace and works in a fresh
  conversation.
- The release notes identify host-dependent capabilities and known limitations.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Host file or script support differs by surface | Test each supported surface and make fallback behavior explicit. |
| Users assume the plugin stores projects | State the skills-only persistence boundary in onboarding and outputs. |
| Image generation is unavailable or selects an unknown model | Treat generated images as optional; always return the reusable brief and provenance available from the host. |
| Too many overlapping skills cause poor routing | Tighten descriptions, add negative triggers, and maintain routing evals. |
| Bundled skills drift from repository skills | Define one packaging source and automate or check synchronization. |

## Dependencies

- Release-ready descriptions and complete instructions for every included
  skill.
- Stable artifact schemas and validation scripts.
- A decision about whether the plugin package copies skills or is generated
  from `.agents/skills/`.
- OpenAI Platform permissions and verified publisher identity for public
  submission.

## Exit criteria for the MCP epic

Epic 2 may begin implementation after:

- users successfully complete the skills-only story and review journeys;
- routing and schema evals are stable;
- the team identifies which persistence and provider operations users actually
  need;
- privacy, hosting, identity, cost, and retention decisions have owners.

## Architecture impact

**None for the V0 runtime, if packaging is kept separate.** This epic packages
existing workflow knowledge and adds tests and documentation without changing
the local application's runtime boundaries. Update `ARCHITECTURE.md` if plugin
packaging becomes part of the application build or distribution path.
