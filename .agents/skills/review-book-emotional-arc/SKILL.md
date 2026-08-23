---
name: review-book-emotional-arc
description: Review emotional continuity and emotional-plan fidelity across a generated children's book. Use when asked to review a book PDF, generated page set, proof, or illustrated sequence for character emotions, emotional transitions, supporting-character reactions, repeated generic expressions, or fidelity to EmotionalArc, SpreadMap, and BookPlan artifacts.
---

# Review Book Emotional Arc

Review the complete illustrated sequence, focusing only on emotional continuity
unless the user explicitly broadens the scope. Distinguish coherent planning
from the emotional performance visible in generated pages.

## Choose the review mode

Use **plan-to-image fidelity** when the project provides `EmotionalArc`,
`SpreadMap`, `BookPlan`, and generated pages. Treat these as intended
performance, not proof that the images achieved it.

Use **proof-only continuity** when only a PDF or page images are available. State
that the review can assess readability and continuity but cannot verify fidelity
to an approved plan.

## Review workflow

1. Identify the exact book, proof, page, and planning-artifact revisions.
2. For PDFs, use the available PDF workflow to extract text, render every
   relevant page, and inspect the full sequence visually. Do not rely only on
   extracted text.
3. Read `references/evaluation-metric.md` completely before classifying findings.
4. Build a character-by-character sequence of planned states when planning
   artifacts exist. Include supporting characters only where their reactions
   affect the emotional meaning or safety of a scene.
5. Compare each transition with observable evidence: trigger, expression, pose,
   gesture, gaze, staging, distance, and interaction.
6. Compare neighboring pages and the whole sequence. Flag emotional sameness,
   abrupt jumps, missing bridges, contradictions, and prohibited signals.
7. Separate the likely source of each issue: story text, emotional plan, spread
   plan, illustration execution, or cross-page sequence.
8. Report strengths that must be preserved as well as actionable findings. Do
   not recommend exaggerating a quiet emotion merely to make it obvious.
9. When asked to document the review, copy `assets/review-template.md`, complete
   only evidence-supported sections, store it in the project's review location,
   and update the project's index/log if its local instructions require that.

## Evidence rules

- Tie every finding to a page or spread and character.
- Describe what is visibly present before interpreting it.
- Use `clear`, `could_be_clearer`, or `needs_attention`; do not invent a numeric
  overall quality score.
- Record confidence when evidence is ambiguous.
- State a bounded revision suggestion and what must remain unchanged.
- Never infer emotion from identity, disability, culture, facial structure, or
  another protected characteristic.
- Never diagnose a child or family from a fictional book.
- Do not silently rewrite text, regenerate art, change approval state, or treat
  advisory findings as objective defects.

## Timing guidance

For production review, evaluate after all intended page images exist and before
final book approval. Earlier artifacts can establish whether the arc is coherent
and drawable, but only generated pages reveal whether the image execution
communicates the planned transitions. Review an approved proof only for audit,
learning, or retrospective revision unless the project defines another policy.

## Output shape

Lead with the overall emotional-path assessment. Then provide findings ordered
by page/spread, each containing:

- character;
- planned transition, when available;
- observed evidence;
- result and confidence;
- likely source;
- bounded suggestion;
- details to preserve.

End with the smallest useful conclusion: ready, light revision suggested, or
revision needed. Keep unrelated story, language, layout, and art-direction
critique out of scope.
