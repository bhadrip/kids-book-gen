# MLP V0 task board

This is the local task tracker for `mlp-v0`. Statuses: **done**, **in progress**, **blocked**, or **not started**.

## Delivery snapshot

- **Last verified:** 2026-07-21 on the working tree based at commit `8f49976`.
- **Current runnable outcome:** a parent can create and reopen a project, shape
  an idea, generate and revise directions, select one with steering, generate
  and revise a quality-checked 13-spread text story, approve it, choose one of
  six art presets, compare or regenerate three character designs, save a
  character reference, edit and approve one illustrated sample spread, and
  resume from persisted checkpoint and generation-job state.
- **Quality evidence:** `just ci` passes with formatting, lint, strict
  TypeScript, 20 Vitest tests, 7 fixture-only Playwright scenarios, and the
  production build. Automated tests use no paid model calls and write projects
  only below `test-results/`.
- **Next incomplete product task:** `GEN-01`, cost estimation and confirmation,
  before beginning full-book illustration production.

## Phase 1 — Foundation and local setup

| ID     | Task                                                                             | Status   | Evidence / notes                                                            |
| ------ | -------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| FND-01 | Pin Node and pnpm; provide reproducible local setup commands.                    | **done** | `.tool-versions`, `packageManager`, `Justfile`, and `pnpm-lock.yaml` added. |
| FND-02 | Configure formatting, linting, strict TypeScript, unit tests, and browser tests. | **done** | Prettier, ESLint, Vitest, Playwright, and `just ci` are configured.         |
| FND-03 | Protect local data, generated output, and secrets from Git.                      | **done** | `.gitignore`, `.env.example`, and `just doctor` added.                      |
| FND-04 | Provide a runnable local app and visible setup state.                            | **done** | Storytime Studio home page reports local generation readiness.              |
| FND-05 | Verify the foundation quality gate.                                              | **done** | `just ci` passed: check, unit tests, Chromium E2E, and production build.    |

## Phase 2 — Domain model and local project storage

### Completed vertical slice — Create and reopen a local story project

**Use case.** As a parent, I can start a local story project and reopen it
from my project list so that my family's book has a durable place to continue.

**Acceptance scenarios.**

1. Given the local app is open, when I enter a title and choose **Create local
   project**, then I see the project title and a persistent project ID.
2. Given a project was just created, when I return to the project list and
   choose its title, then its title and ID are still shown.
3. Given the project storage contains malformed JSON, when it is loaded, then
   the repository rejects it rather than returning unchecked data.

**Evidence required.** Vitest covers creation, validated loading, and malformed
data; Playwright covers create-and-reload using an isolated project directory.

| ID     | Task                                                                                                                               | Status          | Evidence / notes                                                                                                                                              |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOM-01 | Define versioned Zod schemas for projects, briefs, directions, story packages, visual bibles, spreads, proofs, jobs, and feedback. | **in progress** | Text and visual workflow artifacts, decisions, and jobs are versioned; full-production spreads, proof, and feedback schemas remain.                           |
| DOM-02 | Define artifact lifecycle states, approval rules, provenance metadata, and dependent-artifact staleness rules.                     | **not started** |                                                                                                                                                               |
| DOM-03 | Implement injectable clocks and ID generation for deterministic tests.                                                             | **done**        | Project creation, workflow services, providers, repositories, and tests use injected clocks/IDs where nondeterminism exists.                                  |
| STO-01 | Implement a file-backed project repository at `data/projects/<project-id>/`.                                                       | **done**        | The repository creates, lists, loads, and stores all current JSON artifacts below the project directory.                                                      |
| STO-02 | Implement atomic JSON/artifact writes and validated reads.                                                                         | **done**        | JSON and binary image artifacts use project-scoped atomic replacement; persisted JSON uses schema-validated reads.                                            |
| STO-03 | Implement project creation, loading, and restart-resume behavior.                                                                  | **in progress** | Create/reopen and truthful interrupted-job recovery are implemented; automatic per-unit resume remains with `JOB-01`/`GEN-04`.                                |
| JOB-01 | Implement a file-backed local job runner with persisted progress and safe recovery.                                                | **in progress** | Text and visual generation persist in-progress/completed/failed jobs; per-unit resume and stop controls remain.                                               |
| TST-01 | Test schema validation, lifecycle/staleness, persistence, and restart-resume behavior.                                             | **in progress** | Creation, atomic JSON, malformed-data rejection, persisted job status, failure recovery, and browser reopen are covered; general lifecycle/staleness remains. |

## Phase 3 — Idea, directions, and story approval

### Completed vertical slice — Approve a text-only story

**Use case.** As a parent, I can capture an idea, iterate on three distinct
directions with freeform steering, select one, revise its generated manuscript,
and approve the story so that I can safely resume at the visual stage later.

**Acceptance scenarios.**

1. Optional intake fields may be left blank; the original idea remains required.
2. Every direction generation returns exactly three distinct titles and story
   engines, and each revision is preserved alongside the current directions.
3. Selecting a direction persists the choice and steering before generating a
   versioned story with characters, an arc, and exactly 13 non-empty spreads.
4. A parent can request a story revision with feedback or approve the current
   revision, close the app, and reopen the saved story and approval state.
5. Missing/provider failures preserve the last valid brief, selection,
   directions, and story while presenting a safe recovery message.

**Evidence required.** Vitest exercises the fixture provider, versioned
workflow, revision history, story approval, and schemas. Playwright exercises
the complete parent-visible journey on an isolated fixture-only server, making
zero paid model requests.

### Completed UX hardening slice — Visible, resumable generation

**Use case.** As a parent, I can see where I am in the story workflow and get
immediate, accessible feedback while a draft is being generated so that I do
not submit twice, assume the app froze, or worry that my saved work was lost.

**Acceptance scenarios.**

1. Every idea, directions, and story page shows the project title, the ordered
   checkpoints with text statuses, and a **Save and exit** route to the project
   overview.
2. When a parent starts or revises generated work, the local form immediately
   becomes busy, prevents duplicate submission, keeps the action context in its
   label, and shows an indeterminate spinner plus polite text describing what is
   being created and what was already saved.
3. When generation succeeds, the resulting artifact and exact next review
   action are visible; when it fails, the page names the preserved artifact and
   offers the same safe action as a retry.
4. Reopening the project reconstructs checkpoint statuses from validated local
   artifacts and offers the exact next action without calling a provider.
5. Playwright observes the pending state through a deterministic delayed
   fixture provider. Browser and unit tests make zero paid model requests.

**Applicable screen states.** First use/empty, drafting, submitting,
generating, ready for review, provider failure, and interrupted/reopened. True
per-unit progress, stop/resume controls, cost confirmation, and timestamped job
history belong to the Phase 5 persisted job-runner slice.

**Accessibility behavior.** Native labels and validation remain in use. Each
pending form has `aria-busy`, an always-present polite status region, visible
text in addition to motion, reduced-motion handling, and a disabled submit
control while submitted. Routine pending and success updates do not move focus.

**Architecture impact: Updated.** This adds a shared parent workflow shell and
a reusable client-side form feedback boundary; generation and persistence stay
behind `StoryWorkflowService` and `TextProvider`.

| ID      | Task                                                                                                      | Status          | Evidence / notes                                                                                                                  |
| ------- | --------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| UI-01   | Build the wizard shell and progress/checkpoint presentation.                                              | **done**        | Four shared ordered checkpoints show persisted statuses, the project title, save-and-exit, and pending state.                     |
| IDEA-01 | Build the intake form with five narrative templates, Help me choose, and Start from scratch.              | **done**        | Optional shared intake excludes nonfiction and almost-wordless templates.                                                         |
| IDEA-02 | Capture, display, and edit the parent’s original must-keep details at every checkpoint.                   | **done**        | `brief.json` is saved before generation and shown at directions, story, and visual checkpoints.                                   |
| PRV-01  | Define the `TextProvider` boundary and OpenAI Responses adapter.                                          | **done**        | OpenAI is isolated behind `TextProvider`; tests use `FixtureTextProvider`.                                                        |
| DIR-01  | Generate exactly three structurally distinct story directions.                                            | **done**        | Schema enforces three distinct titles/engines; numbered revisions are preserved.                                                  |
| STR-01  | Generate and approve a structured story package: characters, promise, arc, 13-spread map, and manuscript. | **done**        | Versioned story generation, feedback revision, approval, and reopen flow are implemented.                                         |
| STR-02  | Add one hidden story-quality evaluation and at most one automatic revision.                               | **done**        | The first draft is preserved, five checks are stored privately, and no more than one bounded rewrite occurs before parent review. |
| TST-02  | Test must-keep persistence, direction distinction, approval, and upstream staleness.                      | **in progress** | Persistence, distinction, revision, approval, and reopen are covered; general dependency staleness remains.                       |

## Phase 4 — Visual identity and sample-spread gate

### Completed vertical slice — Approve a character and sample spread

**Use case.** As a parent, I can choose a bounded visual language, compare three
character designs, and approve one real book-like sample so that expensive
full-book production starts from a visual identity I recognize and control.

**Acceptance scenarios.**

1. Only six structured presets are available; there is no free-form style or
   named-artist imitation field.
2. Three generated character options are saved; a parent can regenerate a
   numbered successor set while preserving the prior set, and choosing one
   creates a stable reference without deleting its siblings. The Visual Bible
   records identity, palette, locations, props, exclusions, and a text-safe
   area.
3. Spread 7 is illustrated with the chosen reference while its manuscript text
   remains a separately editable HTML layer.
4. Editing text or requesting an image change creates a numbered successor and
   preserves the prior sample and selected character.
5. Explicit approval applies only to the current sample revision; full-book
   production remains locked without it, and provider failure preserves the
   approved story and last safe visual artifact.

**Evidence required.** Vitest covers approval gating, reference and revision
preservation, binary storage, and provider failure. Playwright covers the
fixture-only visual journey, separate text editing, visual approval, reopen
status, and failure recovery with zero paid model requests.

**Architecture impact: Updated.** This adds the `VisualWorkflowService`,
`ImageProvider`, atomic binary asset storage and serving, a persisted image-job
record, and the fourth parent checkpoint.

| ID     | Task                                                                                                         | Status   | Evidence / notes                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VIS-01 | Define six structured, curated art presets.                                                                  | **done** | Presets define medium, line, palette, lighting, shape, texture, detail, exclusions, and swatches; there is no free-form style input.                       |
| PRV-02 | Define the `ImageProvider` boundary and OpenAI image adapter.                                                | **done** | OpenAI generation/edit calls stay behind the adapter; deterministic SVG fixtures keep tests zero-token.                                                    |
| VIS-02 | Generate two or three character-design options and persist the chosen reference asset.                       | **done** | Three options, a visible regeneration action, and numbered revisions are preserved; the chosen asset is copied atomically to a stable versioned reference. |
| VIS-03 | Create and persist a Visual Bible with character invariants, props, locations, palette, and text-safe areas. | **done** | The Visual Bible is schema-validated and tied to the current story revision, preset, and character reference.                                              |
| VIS-04 | Generate one editable-text sample spread and require explicit visual approval.                               | **done** | Spread 7 uses a reference-conditioned image, separate editable text, numbered revisions, and current-revision approval.                                    |
| TST-03 | Test visual approval gating, reference preservation, and provider-error recovery.                            | **done** | Four visual-service tests and two parent-visible Playwright scenarios cover regeneration, revision preservation, the gate, and recovery behavior.          |

## Phase 5 — Full-book production and revision

| ID     | Task                                                                                                       | Status          | Evidence / notes |
| ------ | ---------------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| GEN-01 | Enforce per-book cost estimates, $3 soft budget, and explicit confirmation before $5.                      | **not started** |                  |
| GEN-02 | Generate and persist cover, front matter, roughly 13 landscape story spreads, and end matter sequentially. | **not started** |                  |
| GEN-03 | Pass character references and beat-specific continuity facts to each illustration request.                 | **not started** |                  |
| GEN-04 | Show persisted per-spread generation progress and resume interrupted work.                                 | **not started** |                  |
| REV-01 | Add page-level keep, editable text, and image-regeneration controls.                                       | **not started** |                  |
| REV-02 | Regenerate only the selected spread while preserving approved siblings.                                    | **not started** |                  |
| GEN-05 | Add post-generation preflight for required pages, non-empty text, and required reference details.          | **not started** |                  |
| TST-04 | Test budget accounting, interrupted-job resume, sibling-spread preservation, and preflight failures.       | **not started** |                  |

## Phase 6 — Reader, PDF, and pilot feedback

| ID     | Task                                                                                                           | Status          | Evidence / notes |
| ------ | -------------------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| PDF-01 | Define the `PdfRenderer` boundary and shared HTML/CSS spread layout.                                           | **not started** |                  |
| PDF-02 | Build the fullscreen, one-spread-at-a-time reader with previous/next controls.                                 | **not started** |                  |
| PDF-03 | Render the complete layout as a screen-quality landscape PDF with Playwright.                                  | **not started** |                  |
| FBK-01 | Add post-reading feedback: favorite part, confusion, completion, reread interest, and sequel interest.         | **not started** |                  |
| FBK-02 | Produce a local pilot summary: time, regenerations, cost estimate, fidelity rating, and reread/sequel signals. | **not started** |                  |
| TST-05 | Test proof page completeness, text/layout preflight, reader navigation, PDF export, and feedback persistence.  | **not started** |                  |

## Pilot readiness

| ID     | Task                                                                                      | Status          | Evidence / notes |
| ------ | ----------------------------------------------------------------------------------------- | --------------- | ---------------- |
| PIL-01 | Create three internal books using distinct narrative templates.                           | **not started** |                  |
| PIL-02 | Run 8–12 facilitated family sessions and record agreed pilot measures.                    | **not started** |                  |
| PIL-03 | Review completion, fidelity, child response, revision patterns, latency, and actual cost. | **not started** |                  |
