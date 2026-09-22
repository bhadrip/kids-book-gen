# Feature: Compile approved books into controlled illustration work orders

## Outcome and user

As a book producer, I can compile approved creative artifacts into a repeatable
page-by-page illustration run so that new books preserve character identity,
physical contact, quiet contrast, controlled emotion, and deterministic text.

## In scope

- A versioned Zod contract for an illustration production run.
- Conditional Rapier pose-proof decisions from page action specifications.
- Interaction-aware selection of layered, hybrid, or integrated-page strategy.
- Sequential one-missing-unit generation queues.
- Contrast, emotion, typography, burial, and grip/contact hard gates.
- A CLI that emits the compiled plan, page work orders, and review checklist.
- Reuse of the existing SVG composer and Rapier proof primitives by downstream
  executors.

## Out of scope

- Automatic provider calls or paid image generation.
- A parent-facing workflow or changes to `BookProductionService`.
- Replacing existing approval decisions or silently revising approved assets.
- Recreating the Turnip book before its exact source artifacts are supplied.

## Rules and constraints

- All input artifacts carry exact revisions and content hashes.
- Buried props remain anchored to their environment plate.
- Grips and body holds stay in coherent interaction modules unless a documented
  integrated-page exception is necessary.
- Rapier is mandatory for buried geometry, flexible tension, or three or more
  linked contacts, and never approves the final raster by itself.
- At least 75% of principal performances use intensity 2–5; intensity cannot
  exceed 8.
- One focal region owns the page hierarchy and non-focal contrast stays quiet.
- Story text is rendered deterministically after art at 4.5:1 contrast or
  better.

## Acceptance scenarios

1. Given a quiet static page, compilation emits a layered work order without a
   Rapier stage.
2. Given a buried flexible pulling action, compilation emits a hybrid work
   order with a Rapier proof and final-raster comparison gate.
3. Given a hand grip without an interaction module, compilation fails.
4. Given a buried prop without an anchored plate, compilation fails.
5. Given a mostly overplayed emotional plan, compilation fails.
6. Given valid book input, the CLI emits ordered page work orders and a review
   checklist without calling an image provider.

## References

- `.agents/skills/illustrate-preschool-story/SKILL.md`
- `.agents/skills/illustrate-preschool-story/references/layered-illustration-workflow.md`
- `src/lib/illustration-composer/`
- `src/lib/illustration-physics/`
- `spec/09-artifact-catalog.md`

## Open questions / escalation

- Parent-facing approval and staleness behavior must be designed before this
  compiler is wired into `BookProductionService`.
- Provider-specific execution remains behind the existing `ImageProvider`
  boundary.

## Evidence required for handoff

- Focused Vitest coverage for compilation rules and conditional stages.
- Existing compositor and Rapier tests.
- `just check`, `just test`, and `just build`.
