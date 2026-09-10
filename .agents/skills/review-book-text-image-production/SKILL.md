---
name: review-book-text-image-production
description: Review a complete illustrated children's book for reader-facing text-image coherence and production accessibility, including unexplained entrances or location changes, action direction, scale/state contradictions, contrast, and leaked proof markers. Use on PDFs or ordered page sets after illustration and before final approval; do not replace manuscript-only, emotional-arc, or environment/prop specialist reviews.
---

# Review Book Text Image Production

Inspect the artifact as a child encounters it: text, image, sequence, and layout
together. A valid manuscript and individually attractive images can still form
an incoherent or inaccessible book.

## Required inputs

- complete ordered PDF or page set and exact revision;
- intended reader age and reading mode;
- exact story revision and current page/spread mapping;
- current `BookPlan`, `VisualBible`, and continuity ledger when available;
- whether page numbers, labels, or other navigation marks are intentionally
  reader-facing.

If the source text or page order is unavailable, report the affected checks as
`not_evaluable`; do not reconstruct them from memory.

## Workflow

1. For a PDF, use the PDF workflow to extract text and render every page. Review
   a full contact sheet, then inspect every text-heavy or transition-critical
   page at normal reading size.
2. Read [references/evaluation-contract.md](references/evaluation-contract.md)
   before classifying findings.
3. Build an ordered reader-state ledger: established characters, current
   location/time, pursued goal, important object identity/state/scale, and
   direction of consequential movement.
4. Audit every adjacent page. Require a recoverable textual or visual bridge
   for a new character, location, time, plan, transformed object, or action-
   direction reversal. A possible off-page event is not a bridge.
   For every regenerated page, also audit the complete three-page window
   (`previous -> changed -> next`), or the available two-page window at a book
   end. Record both boundaries separately; passing one boundary is not a local
   sequence pass.
5. Compare text and image in both directions:
   - hide the text and state what the image establishes;
   - hide the image and state what the text establishes;
   - compare the two for intentional symmetry, enhancement, complement,
     counterpoint, or clear contradiction.
6. Audit reader-facing production: contrast, type size, text-safe placement,
   obstruction, overflow, accidental raster text, proof labels, spread numbers,
   crop, and reading order. Treat an internal locator as a defect when it reaches
   the final book without an explicit reader purpose.
7. Assign the likely owning artifact for each issue: story, performance plan,
   VisualBible/continuity ledger, BookPlan, illustration, or PDF/layout.
8. Record a bounded correction, preservation locks, success criteria, and the
   specialist evaluators that must rerun. Do not rewrite or regenerate during a
   review.
   A localized correction must name both neighboring pages as regression scope,
   even when those neighbors remain preserved rather than regenerated.
9. When saving a report, copy [assets/review-template.md](assets/review-template.md)
   and follow repository index/log rules.

## Accessibility rules

- Normal text must have at least 4.5:1 contrast against the lowest-contrast
  sampled background beneath and immediately around the glyphs; large text must
  have at least 3:1.
- Text over variable artwork needs a sufficiently opaque panel, local scrim, or
  other treatment that makes the threshold stable across the entire text box.
  Do not approve contrast from a palette swatch or average page color.
- Do not encode meaning using color alone. Preserve a clear reading order and
  keep text out of visually busy focal action.
- If contrast cannot be measured reliably, mark it `not_evaluable` and require
  a deterministic production check; visual confidence is not a pass.

## Boundaries

- Route manuscript-only causality, unclear wordplay, and age-fit issues to
  `evaluate-story-quality`.
- Route emotional-performance issues to `review-book-emotional-arc`.
- Route detailed location and prop timelines to
  `review-book-environment-prop-continuity`.
- This skill owns the cross-modal and reader-facing failure even when a
  specialist evaluator is also needed.

## Output

Lead with lineage, hard-gate, and accessibility status. Provide the reader-state
ledger, adjacent-page transition audit, text-image checks, production checks,
findings in reading order, strengths to preserve, and readiness:
`ready`, `light_revision_suggested`, `revision_required`, or `not_evaluable`.
