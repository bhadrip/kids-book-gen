# Page-specific picture-book text placement

Text placement is a composed-page decision, not a fixed corner inherited from
the Visual Bible. A page passes only when its actual text, treatment, art,
narrative information, reading path, and production geometry work together.

Research basis: [Picture-book text-placement research, September 2026](../sources/picture-book-text-placement-research-2026-09.md).

## Placement patterns

- natural negative space;
- a quiet compositional field deliberately reserved during roughs;
- upper/lower band or side column;
- opaque panel;
- translucent panel, local scrim, or gradient;
- separate text area or facing text page with spot art;
- text integrated into an environmental surface;
- expressive typography;
- multiple blocks with an unambiguous order;
- a deliberately silent spread.

Natural negative space is preferred when it remains legible and preserves the
composition. A panel or scrim is a valid designed treatment, but its complete
footprint counts as an obstruction. Passing contrast does not permit it to veil
a face, gesture, interaction, critical prop, action, clue, or reveal.

## Protected-region model

Keep separate production and narrative masks.

**Hard-protected by default:** faces and expression features; meaning-bearing
hands and gestures; character-contact space; decisive action; story-critical
props and clues; page-turn reveals; trim/fold/gutter exclusions; meaningful
existing lettering.

**Soft-protected or strongly penalized:** bodies and identity silhouettes; gaze
corridors; gesture extensions; movement paths; leading lines; focal saliency;
atmosphere; emphasis-producing negative space; and the path from narration to
its visual referent.

## Candidate placement method

1. Build maps for production exclusions, protected subjects, saliency, detail,
   luminance, gaze, motion, reveal, and intended quiet regions across the spread.
2. Render exact copy at all allowed typography configurations, including panel
   or scrim padding. Reject overflow, clipping, prohibited breaks, and type below
   the approved book-specific floor.
3. Generate candidates from actual calm regions, empty rectangles/polygons,
   bands, columns, planned regions, shifted variants, treatment variants, and
   separate-area templates. Do not assume four corners are exhaustive.
4. Hard-reject production, capacity, protected-overlap, local-contrast,
   reading-order, page-turn, and applicable digital-accessibility failures.
5. Score survivors for narrative clearance, contrast, quietness, fit, reading
   order, gaze/motion compatibility, hierarchy, production robustness,
   adjacent-spread rhythm, and integration.
6. Render the leading alternatives. Select only above a calibrated confidence
   threshold. Require human review for close rankings and sensitive pages; ask
   for layout, illustration, pagination, or manuscript revision if none pass.

The ranking formula and all numerical thresholds are heuristics to calibrate,
not publishing rules.

## Measurable checks

- intersection and clearance for every protected-region class;
- pixel-level contrast against the final composited background beneath and
  immediately around glyphs, with failure-cluster heatmaps;
- edge density, multiscale luminance/chroma entropy, texture, salient-object
  mass, and patterned-background interference;
- exact shaping, line breaking, box capacity, overflow, and type-size floor;
- printer-profile trim, bleed, safe margin, fold, and gutter geometry;
- geometric order versus declared spoken and digital reading order;
- intersection with annotated or estimated gaze and motion corridors;
- change in focal hierarchy after text and treatment are composed;
- comparison with preceding/following spreads and approved layout lineage.

WCAG AA contrast values are a useful digital requirement and internal print
baseline: 4.5:1 for normal text and 3:1 for qualifying large text. They are not
a complete proof of preschool readability or print accessibility. Never approve
variable art from a palette swatch or average box color.

## Automation boundary

Production geometry, text fit, font embedding, rendered contrast, annotated-mask
intersection, complexity measures, candidate enumeration, declared reading
order, and regression comparisons are substantially automatable.

Gaze, gesture, movement, saliency, and hierarchy analysis are advisory. Human
review owns narrative importance, emotional integrity, interaction clarity,
expressive typography, aesthetic integration, page-turn payoff, book-wide
rhythm, and physical-size proof approval.

## Fallback hierarchy

1. Move or reshape the container.
2. Adjust legitimate line breaks, width, or alignment without undersizing type.
3. Add a restrained fade, scrim, or panel outside protected content.
4. Use a deliberate separate band or text area.
5. Rebalance the spread.
6. Revise the illustration while locking approved performance and continuity.
7. Revise pagination with editorial approval.
8. Revise manuscript length through the story approval workflow.
9. Block final approval when no acceptable placement exists.

## Artifact contract

The `VisualBible` should own book-wide typography, treatment style, reading
direction, production profile, protected classes, consistency rules, and
localization reserve. A positional preference may be a weak prior, never a hard
constraint.

The `SpreadMap` or `BookPlan` should own a page-level `TextPlacementIntent`:
copy footprint, narrative role, attention targets, must-show/must-not-cover
subjects, expressions, gestures, interactions, critical props, gaze and motion
vectors, page-turn function, ranked preferred/prohibited regions, acceptable
treatments, split-text permission, and separate-area permission.

The illustration prompt should receive the real footprint and narrative locks,
request adaptable quiet space, and return proposed quiet regions plus actual
subject/focus/flow annotations. The final layout stage must re-evaluate the
actual image, store candidates and rejected reasons, preserve live semantic text
for digital output, and be able to return `no acceptable placement`.

Changes to copy, typography, trim, binding, crop, illustration, or treatment
stale the placement decision and require a successor review.

## Review-skill revision direction

Extend [`review-book-text-image-production`](../../../.agents/skills/review-book-text-image-production/SKILL.md)
to require the production profile, typography profile, page placement intent,
candidate report, final composite, neighboring pages, and digital reading-order
data when applicable. Add distinct hard-gate results for geometry, capacity,
local contrast, protected subjects, reading order, and digital semantics.

The review should inspect leading alternatives, the full treatment footprint,
gaze/movement/hierarchy, page-turn integrity, and a physical proof near any
minimum threshold. It should return an owning artifact and explicitly request a
layout or illustration revision when no candidate is safe.

## Representative tests

| Composition                                           | Expected decision                                                                |
| ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Quiet sky above a lower-right character               | Use natural negative space if local contrast and gaze flow pass.                 |
| Face in the nominal corner                            | Reject that corner; evaluate another region.                                     |
| Offered object and hands crossing a quiet area        | Protect the gesture; use a band, alternate region, or revision.                  |
| Detailed full-bleed chase                             | Avoid the motion path; try restrained treatment, separate area, or art revision. |
| Panoramic page-turn reveal                            | Protect the reveal and gutter; prefer minimal text or a planned silent spread.   |
| Text-heavy page with spot art                         | Prefer a dedicated text area instead of shrinking type into the art.             |
| Starry night with unstable local contrast             | Require a measured scrim/alternate region despite acceptable average contrast.   |
| Two characters' gaze corridor crosses the calm region | Penalize or reject placement that interrupts the interaction.                    |
| Full-page crowd with no clean region                  | Use a separate area or revise the composition; do not cover faces.               |
| Right-to-left or expanded localization                | Regenerate candidates with actual shaped copy and correct progression.           |
| Translucent panel crossing a hand                     | Reject even if contrast passes.                                                  |
| Text close to the gutter                              | Reject under the binding profile and inspect a bound proof.                      |
