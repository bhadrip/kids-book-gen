# Repository overview

## Purpose

Kids Book Builder (presented in the UI as Storytime Studio) is a local-first
Next.js application that helps a parent or caregiver turn an original idea into
a personalized illustrated children's book. V0 runs on a developer laptop and
stores project artifacts locally. Accounts, shared infrastructure, staging,
production hosting, databases, queues, and deployment workflows are explicitly
out of scope.

The product is aimed initially at parent read-aloud books for ages 7–10, with a
configurable 32-page default and normally 12–14 story spreads. Product settings
such as age, reading mode, format, meaning, art style, and model provider are
intended to remain configurable.

Sources: [`README.md`](../../../README.md),
[`spec/README.md`](../../../spec/README.md), and
[`development.md`](../../../development.md).

## What works now

A parent can:

1. Create and reopen a local project.
2. Record an idea, optional context, and details that must be preserved.
3. Generate exactly three distinct story directions.
4. Revise all directions with parent steering.
5. Select a direction and generate a structured 13-spread story.
6. Request revisions or approve the story.
7. Reopen the project and recover its saved checkpoint or generation status.

Before parent review, the workflow persists an evaluation of idea
fidelity, causal structure, age fit, oral flow, and safety. A repairable failure
can create one numbered successor story and one regression evaluation. If that
successor still fails, the loop stops and preserves it for safe review. Parents
can expand an optional disclosure to inspect the current evaluation call and
its evidence.

The repository persists versioned JSON artifacts beneath
`data/projects/<project-id>/`. Generation jobs record in-progress, completed,
or failed state, and failures preserve the last valid artifact. Automated tests
use the deterministic fixture provider and do not spend model tokens.

## What is not implemented yet

The next product task is the structured art presets (`VIS-01`). General artifact
staleness, per-unit job resume/stop behavior, image generation, visual
approval, full-book production, revision by spread, reader mode, PDF export,
and pilot feedback remain incomplete or unstarted.

See [Delivery roadmap](delivery-roadmap.md) and the canonical
[`tasks/mlp-v0.md`](../../../tasks/mlp-v0.md).

## Product invariants

- Preserve the parent's original idea and approved choices.
- Create successor artifacts instead of silently overwriting approved work.
- Keep structured, schema-versioned artifacts rather than a growing chat log.
- Separate creation from evaluation and use hard gates for non-compensable
  quality failures.
- Treat automated evaluation as prediction; parent and child behavior remains
  the product acceptance signal.
- Keep typography in the layout system rather than generated artwork.

## Core terminology

- **Artifact:** a structured, versioned output such as a brief, direction set,
  story package, or visual bible.
- **Spread:** two facing physical pages.
- **Story engine:** the dramatic mechanism that creates momentum.
- **Hard gate:** a pass/fail requirement that cannot be offset by other quality.
- **Parent-approved:** content downstream work must preserve unless explicitly
  reopened.
