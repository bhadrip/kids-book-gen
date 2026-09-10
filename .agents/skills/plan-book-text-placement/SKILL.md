---
name: plan-book-text-placement
description: Plan and validate page-specific story-text placement on black-and-white picture-book continuity proofs or finished illustrations by comparing multiple candidates, protecting narrative subjects, and escalating unsafe or ambiguous pages. Use after an ordered continuity proof exists and before final layout approval; do not generate story art, rewrite prose, or certify final color contrast from monochrome proofs.
---

# Plan Book Text Placement

Treat text as part of each spread's composition, not as content assigned to a
book-wide corner. Use the economical continuity proof to resolve spatial and
narrative placement before final illustration, then remeasure the selected
placement on finished color art.

Keep story text as a separate deterministic layout layer. Never ask an image
model to render it into proof or final art.

## Required inputs

- complete ordered story and exact revision;
- intended reader age, reading mode, language, and reading direction;
- current `SpreadMap` or `BookPlan` with exact page/spread text;
- current `VisualBible`, continuity ledger, and character-performance plan;
- accepted continuity-proof sheets and manifest, or ordered final illustrations;
- trim, bleed, binding/gutter, safe-margin, and output-format profile;
- typography profile with font, weight, permitted sizes, leading, alignment,
  panel treatments, padding, and an approved minimum type size.

If exact copy, page mapping, typography, or production geometry is missing,
mark the affected placement `not_evaluable`; do not invent it or shrink text to
force a result.

## Modes

### Proof placement

Use black-and-white continuity proofs to approve spatial intent, protected
regions, text capacity, reading path, and layout rhythm before expensive final
art. For a typical 12-spread book, consume the existing three sequential
four-spread proof sheets. Crop or enlarge their panels deterministically for
inspection; request a bounded reproof only when the source panel lacks enough
evidence.

Monochrome proof placement cannot approve final color contrast, texture
interference, finished lighting, or print reproduction. Record these as
`deferred_to_final_art`, not `pass`.

### Final-art placement

Reapply the approved spatial intent to the exact final illustration and rerun
capacity, local contrast, background complexity, production geometry,
obstruction, and reading-order checks. A changed crop, illustration, copy,
typeface, type size, trim, binding, or treatment stales the prior placement.

## Workflow

1. Verify source lineage and page order. For contact sheets, map every panel to
   exactly one manifest spread before analyzing it.
2. Read [references/placement-contract.md](references/placement-contract.md)
   and create a placement record for every spread.
3. Render the exact copy at permitted typography settings. Calculate line
   breaks, glyph bounds, padding, and the complete panel/scrim/gradient
   footprint. Do not go below the approved type floor.
4. Mark hard-protected regions: faces and expression features, communicative
   hands/gestures, character interactions, decisive actions, critical props or
   clues, and page-turn reveals. Mark soft-protected bodies/silhouettes, gaze
   corridors, gesture extensions, movement paths, focal areas, leading lines,
   and emphasis-producing negative space.
5. Generate materially different candidates from natural quiet regions,
   reserved fields, upper/lower bands, side columns, shifted or reshaped
   regions, treatment-backed regions, and separate text-area layouts. Do not
   restrict candidates to four corners.
6. Reject any candidate that fails production geometry, capacity, protected
   subjects, reading order, page-turn integrity, or—on final art—local contrast.
   A translucent treatment still obstructs any protected subject it crosses.
7. Score survivors for narrative clearance, contrast when evaluable, quietness,
   fit, reading order, gaze/movement compatibility, hierarchy, production
   robustness, adjacent-spread rhythm, and visual integration. Treat scores and
   thresholds as project heuristics, never publishing standards.
8. Render the selected candidate and up to two leading alternatives as separate
   digital overlays. Review the complete open spread and the previous/current/
   next window, not only an isolated page.
9. Select only when all hard gates pass and one candidate is clearly preferable.
   Otherwise request human review or the least-upstream bounded revision.
10. Save the manifest and review sheet using
    [assets/placement-review-template.md](assets/placement-review-template.md).

## Hard gates

- No glyph or treatment crosses trim/gutter exclusions or required safe margins.
- Copy fits without clipping, overflow, prohibited line breaks, distorted type,
  or type below the approved minimum.
- The complete treatment footprint does not cover a hard-protected region.
- Text blocks have an unambiguous spoken, visual, and digital order.
- Placement does not expose, cover, or compete with a planned page-turn reveal.
- In final-art mode, contrast is measured locally against the final composited
  background. A box-average or palette-swatch result is not a pass.

For applicable digital output, use at least 4.5:1 for normal text and 3:1 for
qualifying large text. These WCAG values are a measurable baseline, not a
complete preschool print-accessibility standard.

## Decisions and human approval

Return one decision per spread:

- `selected`: one candidate clearly passes; final book approval is still
  downstream;
- `human_review_required`: candidates pass mechanically but narrative or
  aesthetic judgment is material;
- `needs_reproof`: proof evidence is too small or ambiguous;
- `layout_revision_required`: a separate area, treatment, or spread rebalance is
  needed;
- `illustration_revision_required`: staging must create safe space while
  preserving approved performance and continuity;
- `pagination_revision_required`: text distribution must change with editorial
  approval;
- `not_evaluable`: required evidence or configuration is unavailable.

Require human review for close candidate rankings, expressive or integrated
typography, multiple text blocks, uncertain protected regions, climaxes,
emotionally critical interactions, page-turn reveals, and any proposed
illustration or pagination revision. Review routine selected placements together
in the whole-book contact sheet before final approval.

## Fallback order

Move or reshape the container; adjust legitimate line breaks or alignment; add
a restrained treatment outside protected content; use a separate text area;
rebalance the spread; revise illustration composition; revise pagination; then
revise prose only through the story-approval workflow. If none is acceptable,
block placement rather than hiding narrative information or undersizing type.

## Boundaries and handoff

- `build-book-continuity-proof` owns economical proof-art generation and proof
  readability.
- This skill owns placement candidates, deterministic overlays, measurements,
  and placement decisions. It does not approve story or final illustrations.
- `review-book-text-image-production` independently evaluates the final composed
  book and may overturn a selected placement based on reader-facing evidence.
- Route emotional-performance and environment/prop continuity issues to their
  specialist reviewers.

Preserve approved source artifacts. A revision creates a successor placement
manifest and identifies which dependent pages are stale.
