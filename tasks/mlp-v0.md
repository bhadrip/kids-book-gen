# MLP V0 task board

This is the local task tracker for `mlp-v0`. Statuses: **done**, **in progress**, **blocked**, or **not started**.

## Phase 1 — Foundation and local setup

| ID     | Task                                                                             | Status   | Evidence / notes                                                            |
| ------ | -------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| FND-01 | Pin Node and pnpm; provide reproducible local setup commands.                    | **done** | `.tool-versions`, `packageManager`, `Justfile`, and `pnpm-lock.yaml` added. |
| FND-02 | Configure formatting, linting, strict TypeScript, unit tests, and browser tests. | **done** | Prettier, ESLint, Vitest, Playwright, and `just ci` are configured.         |
| FND-03 | Protect local data, generated output, and secrets from Git.                      | **done** | `.gitignore`, `.env.example`, and `just doctor` added.                      |
| FND-04 | Provide a runnable local app and visible setup state.                            | **done** | Storytime Studio home page reports local generation readiness.              |
| FND-05 | Verify the foundation quality gate.                                              | **done** | `just ci` passed: check, unit tests, Chromium E2E, and production build.    |

## Phase 2 — Domain model and local project storage

### Current vertical slice — Create a local story project

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

| ID     | Task                                                                                                                               | Status          | Evidence / notes                                                                                         |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------- |
| DOM-01 | Define versioned Zod schemas for projects, briefs, directions, story packages, visual bibles, spreads, proofs, jobs, and feedback. | **in progress** | Current slice defines the versioned Project schema; remaining artifact schemas follow with their slices. |
| DOM-02 | Define artifact lifecycle states, approval rules, provenance metadata, and dependent-artifact staleness rules.                     | **not started** |                                                                                                          |
| DOM-03 | Implement injectable clocks and ID generation for deterministic tests.                                                             | **in progress** | Current slice injects clock and ID generation into project creation.                                     |
| STO-01 | Implement a file-backed project repository at `data/projects/<project-id>/`.                                                       | **in progress** | Current slice creates and loads `project.json`.                                                          |
| STO-02 | Implement atomic JSON/artifact writes and validated reads.                                                                         | **in progress** | Current slice atomically writes and validates `project.json`.                                            |
| STO-03 | Implement project creation, loading, and restart-resume behavior.                                                                  | **in progress** | Current slice supports create and reload; jobs remain deferred.                                          |
| JOB-01 | Implement a file-backed local job runner with persisted progress and safe recovery.                                                | **not started** |                                                                                                          |
| TST-01 | Test schema validation, lifecycle/staleness, persistence, and restart-resume behavior.                                             | **in progress** | Creation, atomic JSON, malformed-data rejection, and browser reload are covered in the current slice.    |

## Phase 3 — Idea, directions, and story approval

| ID      | Task                                                                                                      | Status          | Evidence / notes                                           |
| ------- | --------------------------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------- |
| UI-01   | Build the wizard shell and progress/checkpoint presentation.                                              | **not started** |                                                            |
| IDEA-01 | Build the intake form with five narrative templates, Help me choose, and Start from scratch.              | **not started** | Excludes nonfiction and almost-wordless templates.         |
| IDEA-02 | Capture, display, and edit the parent’s original must-keep details at every checkpoint.                   | **not started** |                                                            |
| PRV-01  | Define the `TextProvider` boundary and OpenAI Responses adapter.                                          | **not started** | No provider imports outside the adapter.                   |
| DIR-01  | Generate exactly three structurally distinct story directions.                                            | **not started** |                                                            |
| STR-01  | Generate and approve a structured story package: characters, promise, arc, 13-spread map, and manuscript. | **not started** |                                                            |
| STR-02  | Add one hidden story-quality evaluation and at most one automatic revision.                               | **not started** | Check fidelity, structure, age fit, oral flow, and safety. |
| TST-02  | Test must-keep persistence, direction distinction, approval, and upstream staleness.                      | **not started** |                                                            |

## Phase 4 — Visual identity and sample-spread gate

| ID     | Task                                                                                                         | Status          | Evidence / notes                                   |
| ------ | ------------------------------------------------------------------------------------------------------------ | --------------- | -------------------------------------------------- |
| VIS-01 | Define six structured, curated art presets.                                                                  | **not started** | No free-form art-direction input in V0.            |
| PRV-02 | Define the `ImageProvider` boundary and OpenAI image adapter.                                                | **not started** |                                                    |
| VIS-02 | Generate two or three character-design options and persist the chosen reference asset.                       | **not started** |                                                    |
| VIS-03 | Create and persist a Visual Bible with character invariants, props, locations, palette, and text-safe areas. | **not started** |                                                    |
| VIS-04 | Generate one editable-text sample spread and require explicit visual approval.                               | **not started** | Full production must remain locked until approval. |
| TST-03 | Test visual approval gating, reference preservation, and provider-error recovery.                            | **not started** |                                                    |

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
