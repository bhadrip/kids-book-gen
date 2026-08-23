# Kids Book Builder — Research and Product Specification

Status: working specification  
Last consolidated: 2026-07-16

This folder captures the research and product decisions for a parent-first service that helps families turn an original idea into a high-quality illustrated children's book.

The service should feel simple to parents while using a configurable set of specialist creation agents, evaluators, revision loops, and approval checkpoints internally.

## Current MVP decisions

| Area | MVP decision | Extensibility requirement |
|---|---|---|
| Primary user | Parent or caregiver | Educator and child co-creation flows can be added later |
| Initial age | 7–10 | Age is configuration, not hard-coded logic |
| Reading mode | Parent read-aloud | Co-read and independent modes use the same `ReaderProfile` interface |
| Format | 24–32 physical pages; 32-page default | Page count, trim, orientation, and number of story spreads are configurable |
| Story length | Normally 12–14 story spreads in a 32-page book | Scope agent may recommend a different format |
| Moral or educational aim | Optional | Meaning and educational agents are conditional stages |
| Art direction | Approximately six curated presets plus custom direction | Image provider and visual style definitions are replaceable |
| Parent checkpoints | Intent, directions, story/characters, visual sample, full proof | Checkpoints are configurable per workflow |
| Benchmark strategy | Balanced corpus across commercial, literary, educational, cultural, and visual books | Benchmark records should store observations, not unauthorized full-text copies |

## Document map

1. [Research findings](01-research-findings.md) — evidence and implications.
2. [Book quality model](02-book-quality-model.md) — what a good book consists of.
3. [Evaluation rubric](03-evaluation-rubric.md) — scoring, hard gates, evidence, and child testing.
4. [Agent pipeline](04-agent-pipeline.md) — internal roles, artifacts, and revision loops.
5. [Product configuration](05-product-configuration.md) — configurable project and stage schema.
6. [Parent templates](06-parent-templates.md) — starter story engines and simple intake flows.
7. [Open questions and roadmap](07-open-questions.md) — unresolved product and validation work.
8. [Parent experience and interaction guidelines](08-ux-guidelines.md) —
   parent-facing UX implementation contract and coding-agent checklist.
9. [Artifact catalog](09-artifact-catalog.md) — implemented and proposed
   artifacts, ownership, lineage, storage, approvals, and lifecycle status.
10. [Parent-selected reader age](10-parent-selected-reader-age.md) — proposed
    intake, lineage, migration, and age-aware evaluation contract.
11. [Research references](references.md) — cited academic and industry sources.

## Product principles

1. Preserve the parent's idea and intent; agents extend it rather than replacing it.
2. Treat age, reading mode, format, meaning, art style, and model provider as configuration.
3. Separate creation from evaluation.
4. Require evaluators to return page-level evidence and bounded revision instructions.
5. Use hard gates for failures that cannot be averaged away by attractive prose or art.
6. Revise locally and preserve approved strengths.
7. Treat LLM quality scores as predictions; observed parent-child reading behavior is the eventual ground truth.
8. Add typography in a layout system, not inside generated artwork.
9. Store structured, versioned artifacts instead of passing an ever-growing chat transcript between agents.
10. Do not promise that one story will change a child's behavior.

## Terminology

- **Physical page:** one side of a printed leaf, including front and back matter.
- **Spread:** two facing pages seen together.
- **Story engine:** the repeatable dramatic mechanism that generates momentum, such as a quest, mystery, escalating attempts, or emotional reframing.
- **Artifact:** a versioned structured output such as a story bible, beat graph, or storyboard.
- **Hard gate:** a non-compensable pass/fail requirement.
- **Predicted engagement:** a manuscript-based forecast, not a claim about actual child response.
- **Parent-approved:** an artifact or field that downstream agents must preserve unless explicitly reopened.

## Repository recommendation

Keep this folder under version control. Record material changes to thresholds, weights, default templates, and research interpretations in commit messages or an adjacent decision log.
