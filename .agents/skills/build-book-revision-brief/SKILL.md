---
name: build-book-revision-brief
description: Consolidate evidence from children's-book story, emotional, continuity, text-image, and production reviews into one dependency-aware revision brief. Use after one or more evaluators report findings and before revising approved text, plans, art, or PDF output; do not perform the revisions or silently change approval state.
---

# Build Book Revision Brief

Turn scattered reviewer comments into the smallest safe repair plan. Assign each
root issue to the earliest artifact that can actually fix it, preserve approved
strengths, and name the downstream artifacts and evaluators affected.

## Inputs

- exact story, planning, illustration, and book/PDF revisions;
- all available review reports and direct parent feedback;
- approval and staleness status for affected artifacts;
- reader configuration and must-keep/must-avoid constraints.

Missing specialist reviews do not block a brief, but any unsupported diagnosis
must be labeled as parent feedback or `needs_evaluation` rather than converted
into a reviewer finding.

## Workflow

1. Read [references/output-contract.md](references/output-contract.md).
2. Normalize each observation into evidence, predicted reader effect, and a
   testable success condition. Parent observations remain authoritative feedback
   even when a specialist has not confirmed the source.
3. Merge symptoms that share one root cause. Keep distinct problems separate
   merely sharing a page does not make them one repair.
4. Assign one primary owner at the earliest valid layer:
   - story revision for missing setup, unclear language, motivation, or causal
     transition;
   - performance/visual planning successor for acting, entrance staging,
     screen direction, geometry, or continuity locks absent from the plan;
   - illustration successor when the plan is correct but the image fails it;
   - PDF/layout successor for contrast, typography, locator leakage, crop, or
     reading-order defects.
5. Order work upstream-first. A story successor makes dependent plans and art
   stale; do not spend on image corrections before the new story/plans pass.
6. For every repair, state what must remain unchanged and which sibling pages
   must not be regenerated.
   For a page-level visual repair, include its predecessor and successor as
   regression-review scope. Neighbors remain reusable unless evidence shows
   they also violate the controlling lock.
7. Define the exact validators to rerun and the evidence needed to close the
   item. A fix is not complete because a file changed.
   Directional or environment-topology repairs require both a three-page-window
   audit and a complete-book contact-sheet pass before closure.
8. Mark decisions that need parent approval. Do not rewrite, regenerate, delete,
   commit, or change approval state while building the brief unless separately
   authorized.
9. Save the report from [assets/revision-brief-template.md](assets/revision-brief-template.md)
   and update repository index/log files when required.

## Priority and readiness

Use `blocker`, `high`, `medium`, or `low`. Hard-gate, accessibility, essential
comprehension, agency, and safety failures are blockers. Repair order is story,
planning, illustration, then layout/PDF, except a standalone production defect
that cannot be affected by upstream changes.

Finish with one status: `ready_for_revision`, `blocked_on_decision`,
`needs_evaluation`, or `no_revision_needed`.
