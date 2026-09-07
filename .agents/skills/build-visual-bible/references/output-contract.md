# VisualBible output contract

Use the executable schema in `src/lib/visuals/visual-artifacts.ts` as the source
of truth. The current `visualBibleSchema` requires:

```yaml
schemaVersion: 1
projectId: project identifier
sourceStoryRevision: positive integer
presetId: exact Studio preset ID
characterReference: project-scoped image filename
createdAt: ISO 8601 timestamp
mainCharacter:
  name: canonical name
  description: concise visual description
  identityInvariants: 2–8 observable fixed facts
signatureProps: 0–8 concise canonical descriptions
locations: 1–8 concise location-and-geometry descriptions
palette: exactly 3 color strings
textSafeArea: upper_left | upper_right | lower_left | lower_right
avoid: 1–10 concrete visual failures
```

Do not add fields to `visual-bible.json`; unknown fields may be rejected by
downstream validation. Put detailed production locks in the two companion
documents below.

## `continuity-ledger.md`

Start with artifact provenance: project ID, story revision, VisualBible
revision, preset ID, character-reference filename, and status.

Use one row per spread:

| Spread | Location | Time/light | Characters present | Entering prop state | Visible action/transfer | Leaving prop state | Continuity risk |
| --- | --- | --- | --- | --- | --- | --- | --- |

Make absence explicit for plot-bearing objects. Use `not present`, `off-page
with <owner>`, or `intentionally left at <location>` rather than a blank cell.
Below the table, list every adjacent-spread transition that needs an explicit
visual bridge.

## `reference-briefs.md`

Create sections only for recurring elements:

### Character sheet

- identity and relative scale;
- front, three-quarter, profile, and back views;
- fixed wardrobe and signature items;
- color callouts;
- prohibited drift;
- linked approved reference asset.

### Prop sheet

- owner and narrative function;
- shape, construction, material, colors, wear marks, and scale;
- distinct states required by the ledger;
- prohibited substitutions or duplicates.

### Environment sheet

- simple plan-view geometry;
- fixed entrances, windows, furniture, and landmarks;
- character-scale cue;
- allowed lighting/time variants;
- camera-independent spatial relationships;
- prohibited mirroring or rearrangement.

Reference images should use neutral orthographic or diagram-like presentation,
a plain background, and no typography embedded in the raster image. Record
labels and callouts in the Markdown document instead.

## Validation report

End with:

```yaml
status: ready | blocked
blocking_decisions: []
warnings: []
downstream_artifacts_made_stale: []
```
