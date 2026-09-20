# Continuity proof output contract

The proof is an evaluation aid, not an approved production artifact. Keep its
lineage explicit so a reviewer can distinguish an image failure from a stale or
contradictory plan.

## Manifest

Write `continuity-proof-manifest.json` with this logical shape. Use the
project's versioning conventions when a runtime schema is available.

```yaml
schemaVersion: 3
projectId:
proofRevision:
status: draft | ready_for_review | needs_reproof | blocked
createdAt:
sources:
  storyRevision:
  emotionalArcRevision:
  characterPerformanceRevision:
  visualBibleRevision:
  continuityLedgerRevision:
  spreadMapOrBookPlanRevision:
  characterReference:
generation:
  mode: black_white_line_proof
  requestCount:
  strategyBySpread:
    - spreadId:
      strategy: full_scene | layered | hybrid
      reason:
      reusedAssetIds: []
      generatedAssetIds: []
      compositionId:
      fallbackFrom:
  assetRegistry:
    - assetId:
      role: environment | character | prop | action_cluster | source_sheet | replacement_panel | other
      imageFilename:
      sourceRevision:
      generationRequestId:
      dimensions:
        width:
        height:
      sha256:
      hasAlpha:
      anchor:
        x:
        y:
      approvedUses: []
      status: proposed | accepted | rejected | stale
  sourceSheets:
    - sheetId:
      imageFilename:
      panelSpreadIds: []
      accepted: false
  compositions:
    - compositionId:
      spreadIds: []
      strategy: layered | hybrid
      renderer:
      orderedAssetIds: []
      outputFilename:
      accepted: false
masterContactSheet:
  sheetId:
  imageFilename:
  rows:
  columns:
  spreadOrder: []
  labelPolicy: deterministic_outside_drawing
  reviewCaptionPolicy: deterministic_exact_story_text_below_drawing
  accepted: false
  panels:
    - spreadId:
      label:
      reviewCaption:
      reviewCaptionSourceRevision:
      sourceSheetId:
      sourcePanelBounds:
      masterDrawingBoundsPixels:
      masterDrawingBoundsNormalized:
      masterReviewCaptionBoundsPixels:
      masterReviewCaptionBoundsNormalized:
panels:
  - spreadId:
    sequenceIndex:
    sourceSheetId:
    masterSheetId:
    generationStrategy: full_scene | layered | hybrid
    sourceAssetIds: []
    compositionId:
    sourceBeat:
    location:
    timeWeatherLighting:
    charactersPresent: []
    enteringState:
    visibleTrigger:
    decisiveAction:
    observablePerformance: []
    leavingState:
    environmentLandmarks: []
    props:
      - identity:
        ownerOrHolder:
        location:
        enteringState:
        visibleChange:
        leavingState:
    transitionFromPrior:
    mustShow: []
    mustPreserve: []
    mustAvoid: []
    readability: pass | needs_reproof | not_evaluable
    notes: []
```

Use `null` only when a field truly does not apply. Do not leave plot-bearing
prop presence, ownership, state, or deliberate absence implicit.

`sourceSheets` are generation intermediates and may be one sheet, several
sheets, or replacement panels. `compositions` record deterministic layered or
hybrid assembly. `assetRegistry` is the identity and provenance authority for
reused raster elements; content hashes prove reuse but do not replace visual
inspection of contact, occlusion, lighting, or action. `masterContactSheet` is
the sole parent-facing sequence artifact. It must contain every intended spread exactly once, in
reading order, with a deterministic `SPREAD <number>` label above each drawing
and the exact approved spread text below it. The below-panel text is
`reviewCaption` metadata for human sequence review. It is not final-book text
placement, a placement candidate, or part of the generated drawing. Do not
treat source-sheet labels or image-model lettering as valid identifiers.
Record drawing and review-caption bounds separately in both pixels and
normalized master-sheet coordinates so evaluators can reproduce an art-only
crop and exclude review metadata when needed.

## Prompt record

For every request, record:

- request or sheet ID;
- included spread IDs;
- source manifest revision;
- complete prompt;
- supplied reference assets;
- model and request settings when available;
- output filename;
- acceptance or rejection reason.

Also record the deterministic master-sheet assembly operation: ordered source
panel filenames and bounds, output dimensions, grid rows and columns, label and
review-caption font/settings, caption wrapping method, exact-text verification,
assembler name/version, mapping filename, and final filename. Assembly is not
an image-generation request and does not increase `requestCount`.

## Validation report

For each panel, report whether identity, acting, interaction, environment, prop,
and transition evidence are visible at normal proof size. Finish with:

```yaml
status: ready_for_review | needs_reproof | blocked
master_sheet:
  filename:
  spread_labels_verified: false
  exact_review_captions_verified: false
  drawing_caption_bounds_separate: false
  panel_mapping_verified: false
accepted_spreads: []
needs_reproof: []
not_evaluable: []
blocking_lineage_issues: []
generation_requests_used:
```
