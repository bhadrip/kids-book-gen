# Continuity proof output contract

The proof is an evaluation aid, not an approved production artifact. Keep its
lineage explicit so a reviewer can distinguish an image failure from a stale or
contradictory plan.

## Manifest

Write `continuity-proof-manifest.json` with this logical shape. Use the
project's versioning conventions when a runtime schema is available.

```yaml
schemaVersion: 1
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
  sheets:
    - sheetId:
      imageFilename:
      panelSpreadIds: []
      accepted: false
panels:
  - spreadId:
    sequenceIndex:
    sheetId:
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

## Validation report

For each panel, report whether identity, acting, interaction, environment, prop,
and transition evidence are visible at normal proof size. Finish with:

```yaml
status: ready_for_review | needs_reproof | blocked
accepted_spreads: []
needs_reproof: []
not_evaluable: []
blocking_lineage_issues: []
generation_requests_used:
```
