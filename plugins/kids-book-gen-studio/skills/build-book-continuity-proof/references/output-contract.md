# Continuity proof output contract

The proof is an evaluation aid, not an approved production artifact. Keep its
lineage explicit so a reviewer can distinguish an image failure from a stale or
contradictory plan.

## Manifest

Write `continuity-proof-manifest.json` with this logical shape. Use the
project's versioning conventions when a runtime schema is available.

```yaml
schemaVersion: 2
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
  sourceSheets:
    - sheetId:
      imageFilename:
      panelSpreadIds: []
      accepted: false
masterContactSheet:
  sheetId:
  imageFilename:
  rows:
  columns:
  spreadOrder: []
  labelPolicy: deterministic_outside_drawing
  accepted: false
  panels:
    - spreadId:
      label:
      sourceSheetId:
      sourcePanelBounds:
      masterPanelBoundsPixels:
      masterPanelBoundsNormalized:
panels:
  - spreadId:
    sequenceIndex:
    sourceSheetId:
    masterSheetId:
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
sheets, or replacement panels. `masterContactSheet` is the sole parent-facing
sequence artifact. It must contain every intended spread exactly once, in
reading order, with a deterministic `SPREAD <number>` label outside each
drawing. Do not treat source-sheet labels or image-model lettering as valid
identifiers. Record panel bounds in both pixels and normalized master-sheet
coordinates so every evaluator can reproduce the crop.

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
panel filenames and bounds, output dimensions, grid rows and columns, label
font/settings, and final filename. Assembly is not an image-generation request
and does not increase `requestCount`.

## Validation report

For each panel, report whether identity, acting, interaction, environment, prop,
and transition evidence are visible at normal proof size. Finish with:

```yaml
status: ready_for_review | needs_reproof | blocked
master_sheet:
  filename:
  spread_labels_verified: false
  panel_mapping_verified: false
accepted_spreads: []
needs_reproof: []
not_evaluable: []
blocking_lineage_issues: []
generation_requests_used:
```
