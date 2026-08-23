---
name: evaluate-book-characters
description: Evaluate character identity, continuity, expression, acting, supporting-character clarity, interaction, picture-only story communication, and whole-book character arc in an illustrated children's book. Use when reviewing a proof PDF, ordered page images, generated BookPage set, character designs, sample spread, or full book against optional StoryPackage, EmotionalArc, SpreadMap, BookPlan, VisualBible, and approved character references. Produce evidence-based findings and bounded revision briefs without changing artwork or approval state.
---

# Evaluate Book Characters

Evaluate visible character design and performance. Keep environment, composition,
typography, general art direction, and production critique out of scope unless they
materially prevent a character check from being judged.

## Select the mode

Use **proof-only** when the input is a PDF or ordered page images. Assess visible
readability and continuity, but do not claim fidelity to an unavailable plan.

Use **plan-to-image** when planning and reference artifacts accompany the pages.
Compare intended identity, action, and emotion with observable illustration evidence.

Use **stage-gate** for a character-design set, sample spread, or BookPlan. Run only
the checks listed for that stage in `references/character-checklist.md`.

Use **regression** when a previous evaluation and successor pages exist. Recheck the
changed checks, identity gates, adjacent-page continuity, and the whole sequence.

## Required inputs

Require the fields defined in `references/input-contract.md`. If the caller supplies
them in prose rather than a manifest, synthesize a temporary manifest and state that
you did so. At minimum, identify one ordered visual source: a proof PDF or page
images. Reader age, reading mode, title, revision identifiers, and optional project
artifacts belong in the manifest when known.

Run:

```text
python3 scripts/validate_input.py INPUT_MANIFEST.json
```

Stop on validation errors. Report missing optional artifacts as scope limitations,
not failures in the book.

## Required references

Read these completely before evaluating:

- `references/character-checklist.md` for checks, stage applicability, gates, and
  evidence rules.
- `references/input-contract.md` for input levels and artifact authority.
- `references/output-schema.json` before producing structured output.

## Workflow

1. Record exact source paths, SHA-256 hashes, revisions, rubric version, evaluator
   model when known, and input-completeness level. Prefer the visible cover/title-page
   title; record conflicting PDF metadata as a limitation.
2. For a PDF, use the PDF workflow to render every relevant page. Inspect the
   complete sequence as thumbnails and every evaluated page at readable size. Do
   not rely only on extracted text.
3. Establish each recurring character from approved references. Without approved
   references, infer a provisional baseline from the clearest early appearances
   and label it `observed_baseline`.
4. Read available StoryPackage, EmotionalArc, SpreadMap, BookPlan, VisualBible, and
   previous evaluation artifacts. Treat plans as intended performance, not proof
   that an illustration achieved it.
5. Run applicable A-E checks per page and F checks across the sequence. Record both
   the one-based physical PDF page number and visible page/spread label when they
   differ. Hide page text for C-series picture-only tests; retain text for text-image
   agreement.
6. Describe visible evidence before interpretation. Do not infer emotion from a
   character's identity, culture, disability, body, or facial structure.
7. Score each applicable check `0`, `1`, or `2`. Use `not_applicable` or
   `insufficient_evidence` rather than forcing a score.
8. Apply hard gates independently. Never average a gate failure away.
9. For every `0` and `1`, state the effect, bounded revision, details to preserve,
   and checks to rerun. Keep artistic preferences in optional observations rather
   than deterministic findings.
10. Produce JSON conforming to `references/output-schema.json` and validate it:

```text
python3 scripts/validate_output.py CHARACTER_EVALUATION.json
```

11. Provide a concise human-readable report using `assets/review-template.md`.
    Lead with the outcome and prioritize required corrections over polish.

## Evaluation integrity

- Evaluate the artifact, not the creator's intent or reputation.
- Tie findings to a page/spread and named character.
- Use the same rubric version, reader configuration, and evaluator model for
  comparisons and regression reviews.
- Keep deterministic checklist results separate from holistic artistic judgment.
- Do not penalize deliberate costume, age, lighting, or emotional changes supported
  by the story or plan.
- Do not rewrite the story, regenerate images, alter references, or change approval
  state.
- Do not create a revision brief unless the user requests revision preparation or
  the project workflow explicitly requires it.
- Preserve parent-approved facts and successful visual details.

## Output

Return:

1. a valid `CharacterEvaluation` JSON artifact;
2. a concise Markdown report;
3. optional `CharacterRevisionBrief` content only when requested.

The evaluation diagnoses. A revision brief proposes a bounded change. Neither one
authorizes image generation or final approval.
