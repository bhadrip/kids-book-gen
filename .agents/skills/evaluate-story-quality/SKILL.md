---
name: evaluate-story-quality
description: Evaluate the complete text of a children's story from story.json against a versioned story-quality rubric for a specified reader age and reading mode. Use for one-book reviews, repeat evaluations, or benchmark comparisons across many books when the requested scope is story structure, predicted engagement, language fit, meaning, and textual safety rather than illustration or production quality.
---

# Evaluate Story Quality

Evaluate only the story text. Do not score illustrations, visual continuity,
layout, typography, or production fitness.

## Required inputs

Require exactly:

1. path to `story.json`;
2. age as an integer from 3 through 10;
3. reading mode: `parent_read_aloud`, `co_read`,
   `independent_developing`, or `independent_confident`.

Run `scripts/validate_input.py STORY_JSON --age AGE --reading-mode MODE`
before evaluating. Stop and report validation errors. Use its normalized JSON as
the evaluation input.

## Required references

Read both files completely before evaluating:

- `references/evaluation-rubric.md` for dimensions, rule IDs, gates, and result
  categories.
- `references/reader-profiles.md` for age- and reading-mode expectations.

## Workflow

1. Record the input file, SHA-256 hash, title, story revision when present, age,
   reading mode, rubric version, and evaluator model when known.
2. Read every story unit in order. Treat array order as reading order; preserve
   supplied spread/page numbers as evidence locators.
3. Build a concise causal trace: context, disruption, goal, attempts,
   consequences, changed attempt, decisive action, resolution, and reaction.
4. Evaluate every rubric dimension independently using the selected reader
   profile. Do not infer missing illustrations or creator intent.
5. Assign a result only after citing observable story evidence and the relevant
   rubric rule ID. Use `insufficient_evidence` when the text cannot support a
   judgment.
6. Separate observation from predicted reader effect. Never claim that a child
   will like, understand, learn from, or change behavior because of the story.
7. Apply hard gates exactly as written. Do not average a gate failure away.
8. Provide bounded revision advice only for `weak` or `not_evident` results;
   state what to preserve.
9. Write the report using the exact schema in
   `references/output-schema.json`. Validate it with
   `scripts/validate_output.py REPORT_JSON`.

## Consistency rules

- Use rubric version `story-quality-text-v1` and the result vocabulary exactly.
- Do not use decimal scores. Numeric exports map categories to 0–4 only.
- Do not use author reputation, popularity, awards, sales, or prior reviews.
- Do not compare the book with named titles unless the user explicitly asks.
- Keep the same age, reading mode, rubric version, and evaluator model across a
  benchmark corpus.
- Randomize book order and hide popularity metadata for comparative studies.
- For repeatability studies, run each book twice and report disagreements; do
  not silently choose the more favorable result.

## Output

Return:

1. valid machine-readable JSON following `references/output-schema.json`;
2. a concise parent-readable summary containing the overall profile, gates,
   strongest qualities, limiting qualities, and highest-value revision.

Every dimension must contain story evidence, rubric basis, result, confidence,
and a distinction between observation and prediction. A book may be ready while
still having weak non-gating dimensions.
