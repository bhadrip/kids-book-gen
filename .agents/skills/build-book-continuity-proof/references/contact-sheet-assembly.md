# Deterministic master contact-sheet assembly

Use `../scripts/assemble_master_contact_sheet.py` after every accepted drawing
exists as a PNG. It creates one portable SVG contact sheet plus a mapping JSON.
No story text or spread label is sent back to an image model.

## Input spec

```json
{
  "schemaVersion": 1,
  "title": "BLACK-AND-WHITE CONTINUITY PROOF",
  "subtitle": "Review text only — not final-book text placement",
  "columns": 4,
  "cellWidth": 1000,
  "drawingHeight": 600,
  "captionHeight": 300,
  "panels": [
    {
      "spreadNumber": 1,
      "sourceImage": "panels/spread-01.png",
      "sourceCropPixels": { "x": 0, "y": 0, "width": 1536, "height": 1024 }
    }
  ]
}
```

Paths are resolved relative to the spec file. The story file must contain an
ordered `spreads` array with integer `number` and string `text` fields. The
script requires one panel for every story spread, in exact reading order. It
copies captions from the story file; the spec cannot override manuscript text.

## Command

```sh
python scripts/assemble_master_contact_sheet.py \
  --story story.json \
  --spec contact-sheet-spec.json \
  --output contact-sheet-master.svg \
  --mapping contact-sheet-master.mapping.json
```

The assembler accepts PNG sources, embeds them into the SVG, applies optional
source crops without rewriting the originals, and records:

- source path, crop, dimensions, and SHA-256;
- deterministic `SPREAD <number>` label;
- exact approved review caption and story revision;
- separate drawing and review-caption bounds in pixels and normalized canvas
  coordinates;
- grid and typography settings;
- `accepted: false`, because human approval is downstream.

Render the SVG to PNG only when the receiving workflow requires a raster master.
Use an available deterministic browser or graphics renderer; do not regenerate
the sheet with an image model. Preserve the SVG and mapping as assembly
provenance.
