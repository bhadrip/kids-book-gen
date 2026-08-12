# MLP V0 task board

This is the local task tracker for `mlp-v0`. Statuses: **done**, **in progress**, **blocked**, or **not started**.

## Delivery snapshot

- **Last verified:** 2026-07-22 on the Phase 6 feature branch.
- **Current runnable outcome:** a parent can create and reopen a project, shape
  an idea, generate and revise directions, select one with steering, generate
  and revise a quality-checked 13-spread text story, approve it, choose one of
  six art presets, compare or regenerate three character designs, save a
  character reference, review and approve one illustrated sample spread, confirm
  or edit a zero-additional-image-cost 16-page contact sheet and wireframe
  reader, approve its exact revision, resume sequential full-book production,
  review 16 saved landscape pages, edit a page, regenerate one image without
  replacing siblings, approve the current complete book once, read it one
  spread at a time, export the exact approved revisions as a landscape PDF,
  save a family reading reflection, and inspect a local pilot summary.
- **Quality evidence:** `just ci` passes with formatting, lint, strict
  TypeScript, 29 Vitest tests, 9 fixture-only Playwright scenarios, real local
  PDF rendering, and the production build. Automated tests use no paid model
  calls and write projects only below `test-results/`.
- **Next incomplete product task:** `PIL-01`, creating three internal books with
  distinct narrative templates before facilitated family sessions.

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
| DOM-01 | Define versioned Zod schemas for projects, briefs, directions, story packages, visual bibles, spreads, proofs, jobs, and feedback. | **done**        | Text, visual, production, exact-revision proof, reading-feedback, and pilot-summary artifacts are schema-versioned and validated.                             |
| DOM-02 | Define artifact lifecycle states, approval rules, provenance metadata, and dependent-artifact staleness rules.                     | **not started** |                                                                                                                                                               |
| DOM-03 | Implement injectable clocks and ID generation for deterministic tests.                                                             | **done**        | Project creation, workflow services, providers, repositories, and tests use injected clocks/IDs where nondeterminism exists.                                  |
| STO-01 | Implement a file-backed project repository at `data/projects/<project-id>/`.                                                       | **done**        | The repository creates, lists, loads, and stores all current JSON artifacts below the project directory.                                                      |
| STO-02 | Implement atomic JSON/artifact writes and validated reads.                                                                         | **done**        | JSON and binary image artifacts use project-scoped atomic replacement; persisted JSON uses schema-validated reads.                                            |
| STO-03 | Implement project creation, loading, and restart-resume behavior.                                                                  | **done**        | Create/reopen, truthful interrupted-job recovery, atomic per-page saves, and resume from the first missing production page are implemented.                   |
| JOB-01 | Implement a file-backed local job runner with persisted progress and safe recovery.                                                | **done**        | Text, visual, and book jobs persist progress and safe outputs; book production supports pause, failure retry, per-unit resume, and activity history.          |
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
| UI-01   | Build the wizard shell and progress/checkpoint presentation.                                              | **done**        | Five shared ordered checkpoints show persisted statuses, the project title, save-and-exit, and pending state.                     |
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

| ID     | Task                                                                                                         | Status   | Evidence / notes                                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VIS-01 | Define six structured, curated art presets.                                                                  | **done** | Presets define medium, line, palette, lighting, shape, texture, detail, exclusions, swatches, and same-scene visual previews; there is no free-form style input. |
| PRV-02 | Define the `ImageProvider` boundary and OpenAI image adapter.                                                | **done** | OpenAI generation/edit calls stay behind the adapter; deterministic SVG fixtures keep tests zero-token.                                                          |
| VIS-02 | Generate two or three character-design options and persist the chosen reference asset.                       | **done** | Three options, a visible regeneration action, and numbered revisions are preserved; the chosen asset is copied atomically to a stable versioned reference.       |
| VIS-03 | Create and persist a Visual Bible with character invariants, props, locations, palette, and text-safe areas. | **done** | The Visual Bible is schema-validated and tied to the current story revision, preset, and character reference.                                                    |
| VIS-04 | Generate one sample spread with separately rendered story text and require explicit visual approval.         | **done** | Spread 7 uses a reference-conditioned image, displays approved story text separately from the artwork, and requires current-revision approval.                   |
| TST-03 | Test visual approval gating, reference preservation, and provider-error recovery.                            | **done** | Four visual-service tests and two parent-visible Playwright scenarios cover regeneration, revision preservation, the gate, and recovery behavior.                |

## Phase 5 — Full-book production and revision

### Completed vertical slice — Produce and locally revise the complete book

**Use case.** As a parent, I can review cost and scope, generate a complete book
sequentially, leave or stop safely, resume at the next missing page, and revise
one page without losing the rest of the book.

**Acceptance scenarios.**

1. Full production remains locked until the current story and visual sample are
   approved. Before spending on final images, the parent can inspect all 16
   pages as a contact sheet and neutral wireframe reader, edit per-page text,
   illustration intent, and must-show details, then approve the exact current
   plan revision.
2. Cover, title/copyright front matter, 13 story spreads, and closing matter are
   requested sequentially. Every request includes the approved character
   reference and page-specific continuity facts, and every successful page is
   saved before the next request.
3. Persisted completed/total progress, last safe output, estimate, timestamps,
   failure location, and activity history survive reopen. A parent can stop
   future pages, resume at the first missing page, or retry only the failed page.
   While a local request is active, the review page refreshes automatically and
   distinguishes live work from an interrupted persisted job; duplicate active
   production requests are rejected.
4. Every saved page offers separate editable text and a targeted image
   regeneration with explicit change/preserve instructions. Numbered
   predecessors and every sibling page remain unchanged. After page review, one
   final decision approves the exact current revisions of all 16 pages; a later
   page change makes that approval stale without deleting it.
5. Preflight fails explicitly for a missing required page, empty text layer,
   absent character reference details, or missing continuity facts.
6. The plan is derived locally without an image-provider request. Production
   then shows the configurable estimate, $3 soft budget, and required
   confirmation above $5.

**Applicable screen states.** First-use plan preview, edited plan awaiting fresh
approval, approved plan, costly confirmation, generating, interrupted/reopened,
paused, provider failure, ready for review, and localized revision. Known
progress uses native `progress`; pending forms retain their action label,
prevent duplicate submission, and announce saved-work context.

**Evidence required.** Vitest covers zero-provider-call plan preview, successor
plan approval, cost gating, sequential reference inputs, interruption/resume,
localized regeneration, sibling preservation, and preflight. Playwright covers
the 16-page contact sheet and wireframe reader, plan edit and approval,
pause/reopen/resume, generated-page review, editable text, targeted
regeneration, one complete-book approval, narrow layout, and provider failure
using fixture images only.

**Architecture impact: Updated.** This adds `BookProductionService`, versioned
book-plan and exact-revision decision artifacts, versioned book
page/manifest/job/preflight schemas, an exact-page-revision final-book decision,
production requests to `ImageProvider`, the fifth persisted checkpoint, a
process-local duplicate-run claim, live polling, and a parent-readable
production activity log.

| ID     | Task                                                                                                       | Status   | Evidence / notes                                                                                                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GEN-00 | Preview, edit, and approve all 16 planned pages before final-image spending.                               | **done** | A locally derived contact sheet and wireframe reader expose text, illustration intent, continuity, and must-show details; current-revision approval gates production.                      |
| GEN-01 | Enforce per-book cost estimates, $3 soft budget, and explicit confirmation before $5.                      | **done** | Configurable per-image estimates roll into persisted spend; UI warns above the soft budget and schema-tested confirmation gates $5.                                                        |
| GEN-02 | Generate and persist cover, front matter, roughly 13 landscape story spreads, and end matter sequentially. | **done** | One cover, title/copyright page, 13 story spreads, and closing page are planned and atomically persisted in order.                                                                         |
| GEN-03 | Pass character references and beat-specific continuity facts to each illustration request.                 | **done** | Production requests include the exact reference, Visual Bible details, current/prior beats, setting/prop facts, and prior page.                                                            |
| GEN-04 | Show persisted per-spread generation progress and resume interrupted work.                                 | **done** | The book job records completed units, current/failed unit, last safe artifact, cost, and events; the UI auto-refreshes, identifies active vs interrupted work, and rejects duplicate runs. |
| REV-01 | Add page editing, targeted image regeneration, and one final-book approval.                                | **done** | Each page exposes separate-text and change/preserve image actions with numbered successors; one exact-revision decision approves all 16 current pages.                                     |
| REV-02 | Regenerate only the selected spread while preserving approved siblings.                                    | **done** | Service and Playwright evidence compare an unchanged sibling while the selected page advances revision.                                                                                    |
| GEN-05 | Add post-generation preflight for required pages, non-empty text, and required reference details.          | **done** | Versioned preflight checks all 16 IDs, text, reference filename/details, and continuity facts.                                                                                             |
| TST-04 | Test plan approval, budget accounting, interrupted-job resume, sibling-spread preservation, and preflight. | **done** | Seven production-service tests and two fixture-only browser scenarios cover preview, duplicate-run protection, happy, and recovery paths.                                                  |

## Phase 6 — Reader, PDF, and pilot feedback

### Completed vertical slice — Read, export, and reflect on the approved book

**Use case.** As a parent, I can read the exact approved book in a focused
spread reader, download the same layout as a local PDF, and record a lightweight
family reflection so that the finished book and pilot signal are usable in one
resumable flow.

**Acceptance scenarios.**

1. The reader and export remain locked until production preflight passes and
   the exact current revisions of all 16 pages have one complete-book approval.
   A later page edit preserves the prior proof but requires fresh approval.
2. The fullscreen reader shows one landscape spread at a time with obvious
   previous/next controls, a page count, Arrow/Home/End keyboard navigation,
   a persistent project title and return route, and a narrow layout without
   horizontal overflow.
3. Reader and PDF consume the same page model, text-safe-area mapping, and
   HTML/CSS layout. Opening the reader creates a versioned HTML proof; export
   uses Playwright to inspect all 16 text layers and only saves a versioned,
   screen-quality 12-by-8-inch PDF when page count and overflow checks pass.
4. Export pending, success, and failure remain visible and accessible without
   leaving the app. A failed completeness, renderer, or overflow check names
   the safe recovery action and does not save an invalid PDF.
5. The optional reading reflection records favorite part, confusion,
   completion, 1–5 idea fidelity, reread interest, and sequel/another-story
   interest as numbered successors. It states that the record stays local,
   does not change the book, and does not train a model.
6. Each saved reflection produces a validated local pilot summary with time
   from project start to feedback, final-page regeneration count, tracked image
   estimate, fidelity, completion, reread, and sequel signals.

**Applicable screen states.** Approved/ready to read, direct-route locked,
first/last/intermediate reader page, narrow reader, PDF rendering, PDF saved,
layout/export failure, first feedback, updated feedback, and saved pilot
summary. Reader page turns use a polite status without moving focus; form
errors receive focus; motion is reduced when requested.

**Evidence required.** Vitest covers exact-revision gating, 16-page shared
layout output, valid export persistence, overflow rejection, successor feedback,
and pilot-summary derivation. Playwright covers the parent-visible reader,
keyboard and button navigation, narrow layout, a real valid PDF download, and
feedback persistence using fixture images and zero paid model requests.

**Architecture impact: Updated.** This adds `BookProofService`, the
`PdfRenderer` boundary and local Playwright adapter, versioned HTML/PDF proof,
reading-feedback and pilot-summary artifacts, a fullscreen reader route, and
project-scoped PDF export.

| ID     | Task                                                                                                           | Status   | Evidence / notes                                                                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PDF-01 | Define the `PdfRenderer` boundary and shared HTML/CSS spread layout.                                           | **done** | Reader and serialized proof share `BookLayoutPage`, text-safe-area classes, and CSS; renderer results report page count and overflowing page IDs.                |
| PDF-02 | Build the fullscreen, one-spread-at-a-time reader with previous/next controls.                                 | **done** | Focused reader provides button and Arrow/Home/End navigation, visible page position, project exit, responsive layout, and an end-of-reading feedback action.     |
| PDF-03 | Render the complete layout as a screen-quality landscape PDF with Playwright.                                  | **done** | Local Chromium renders a 12-by-8-inch PDF only after all 16 pages and text layers pass; HTML, PDF, metadata, and export activity are versioned and persisted.    |
| FBK-01 | Add post-reading feedback: favorite part, confusion, completion, reread interest, and sequel interest.         | **done** | The optional local-only form saves all agreed signals as validated numbered feedback successors without changing the approved proof.                             |
| FBK-02 | Produce a local pilot summary: time, regenerations, cost estimate, fidelity rating, and reread/sequel signals. | **done** | `pilot-summary.json` derives the session time, final-page regenerations, tracked estimate, fidelity, completion, reread, and sequel signals from saved records.  |
| TST-05 | Test proof page completeness, text/layout preflight, reader navigation, PDF export, and feedback persistence.  | **done** | Two service tests plus the fixture-only full-book browser journey cover completeness, staleness, overflow, real PDF bytes, navigation, and feedback persistence. |

## Pilot readiness

| ID     | Task                                                                                      | Status          | Evidence / notes |
| ------ | ----------------------------------------------------------------------------------------- | --------------- | ---------------- |
| PIL-01 | Create three internal books using distinct narrative templates.                           | **not started** |                  |
| PIL-02 | Run 8–12 facilitated family sessions and record agreed pilot measures.                    | **not started** |                  |
| PIL-03 | Review completion, fidelity, child response, revision patterns, latency, and actual cost. | **not started** |                  |
