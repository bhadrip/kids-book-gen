# Text placement output contract

The placement manifest records evidence and decisions without embedding story
text in illustration pixels. Use normalized spread coordinates in addition to
output-unit measurements so decisions can be reproduced at final resolution.

```yaml
schemaVersion: 1
projectId:
placementRevision:
mode: proof_placement | final_art_placement
status: ready_for_review | revision_required | not_evaluable
sources:
  storyRevision:
  spreadMapOrBookPlanRevision:
  visualBibleRevision:
  continuityProofRevision:
  illustrationRevision:
  typographyProfileRevision:
  productionProfileRevision:
reading:
  readerAge:
  readingMode:
  language:
  direction: ltr | rtl | vertical
spreads:
  - spreadId:
    sequenceIndex:
    exactText:
    sourceImage:
    sourcePanelBounds:
    textConfiguration:
      font:
      weight:
      size:
      leading:
      alignment:
      lines: []
      treatment: none | opaque_panel | translucent_panel | scrim | gradient | separate_area | integrated
      border: none | explicit_approved_system
      padding:
    protectedRegions:
      - regionId:
        class: face | eyes | gesture | interaction | decisive_action | critical_prop | reveal | body | gaze_path | movement_path | focal_area | other
        protection: hard | soft
        boundsOrMask:
        source: plan_annotation | detected | human_annotation
        confidence:
    candidates:
      - candidateId:
        boundsOrPolygon:
        treatmentBounds:
        rejectionReasons: []
        measurements:
          protectedOverlapByClass: {}
          minimumProtectedClearance:
          minimumLocalContrast:
          contrastStatus: pass | fail | deferred_to_final_art | not_evaluable
          backgroundComplexity:
          capacityStatus:
          trimClearance:
          gutterClearance:
          readingOrderCompatibility:
          gazeMovementInterference:
          hierarchyInterference:
        score:
        scoreVersion:
    selectedCandidateId:
    decision: selected | human_review_required | needs_reproof | layout_revision_required | illustration_revision_required | pagination_revision_required | not_evaluable
    rationale:
    humanReviewReasons: []
    preservationLocks: []
    neighboringRegressionScope: []
outputs:
  wholeBookOverview:
  candidateReviewSheets: []
  finalComposites: []
deferredChecks: []
```

## Required evidence

- Every spread appears exactly once and maps to its source image or proof panel.
- Every rejected candidate has at least one concrete rejection reason.
- Every selected candidate records the measurements used for selection.
- `deferred_to_final_art` is mandatory for color/texture contrast in proof mode.
- The selected overlay, leading alternatives, and protected-region view are
  reproducible from the manifest.
- A changed source revision identifies stale placement records rather than
  silently overwriting them.
- Every proof-placement record states whether the text background and border
  are absent, a borderless readability treatment, or part of an explicitly
  approved system.
- Candidate selection records any change to source-panel aspect ratio, crop, or
  scale. A collision workaround that changes only one spread's art scale fails
  whole-book rhythm and must request reproof.
- Monochrome proof sources record a palette-integrity check. Selective retained
  color is `needs_reproof`, even when a grayscale diagnostic derivative exists.
