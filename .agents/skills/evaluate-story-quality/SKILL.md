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
4. State one primary dramatic question and identify the exact unit where it is
   answered. Test every subsequent unit as consequence, reaction, or closure.
   Flag a new goal, checklist, lesson, or problem after that point unless it was
   established earlier and directly completes the same dramatic question.
5. Audit every adjacent unit transition. For each change in location, pursued
   object, plan, or knowledge state, record the textual trigger in the earlier
   or current unit. Distinguish a causal bridge (choice, clue, consequence, or
   established force) from coincidence. Do not use a planned illustration to
   supply a bridge missing from the text.
6. Run a spread-necessity counterfactual: for each unit, ask whether removing it
   would leave the main causal and emotional path intact. Treat a removable
   late teaching sequence as evidence of a split throughline even when its
   individual language, participation, or educational value is strong.
7. Evaluate every rubric dimension independently using the selected reader
   profile. Do not infer missing illustrations or creator intent.
8. Assign a result only after citing observable story evidence and the relevant
   rubric rule ID. Use `insufficient_evidence` when the text cannot support a
   judgment.
9. Separate observation from predicted reader effect. Never claim that a child
   will like, understand, learn from, or change behavior because of the story.
10. Apply hard gates exactly as written. Do not average a gate failure away.
11. Provide bounded revision advice only for `weak` or `not_evident` results;
   state what to preserve.
12. Write the report using the exact schema in
    `references/output-schema.json`. Validate it with
    `scripts/validate_output.py REPORT_JSON`.

## Consistency rules

- Use rubric version `story-quality-text-v2` and the result vocabulary exactly.
- Do not use decimal scores. Numeric exports map categories to 0–4 only.
- Do not use author reputation, popularity, awards, sales, or prior reviews.
- Do not compare the book with named titles unless the user explicitly asks.
- Do not rate `STRUCT-CAUSE-01` as `strong` or `distinctive` when a major
  adjacent transition lacks a recoverable textual trigger. For ages 3–5, also
  cap `LANG-INFERENCE-01` at `functional` when recovering that transition
  requires inventing an unstated clue, choice, or spatial connection.
- Treat a new clue that merely appears at the next location as coincidence
  unless the text explains how the protagonist notices it or why they move
  there. Name the exact source and destination units in revision advice.
- Do not accept a late goal merely because it is valuable, participatory, or
  thematically related. The manuscript must establish how it follows from and
  completes the primary dramatic question.
- `STRUCT-THROUGHLINE-01` cannot exceed `functional` when the primary dramatic
  question resolves and a new goal then requires its own decision-and-action
  sequence. Rate it `weak` when that sequence materially delays or displaces
  consequence and emotional resolution.
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
