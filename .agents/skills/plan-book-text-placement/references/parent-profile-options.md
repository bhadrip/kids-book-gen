# Parent-facing placement profile options

Use this catalog only when its format preconditions match the parent's stated
output. These are complete proposals, not defaults. Present the option name,
readability and visual tradeoff, and exact values; label a recommendation only
when it fits the stated use. Do not select on the parent's behalf.

## Home-print US Letter landscape, pinned left

Preconditions:

- physical sheet: 11 × 8.5 inches, landscape;
- ordinary home printer, no bleed;
- left-to-right reading;
- full sheets pinned along the left edge;
- preschool parent read-aloud;
- Arial is available in the deterministic layout environment.

Shared production profile `home_print_letter_landscape_pinned_v1`:

- trim: 11 × 8.5 inches landscape;
- bleed: 0 inches;
- safe margins: 0.5 inch top, right, and bottom;
- pinned-edge exclusion: 0.75 inch from the left sheet edge;
- binding edge: left;
- all text, treatments, faces, communicative hands, decisive actions, and
  critical props remain outside the pinned-edge exclusion;
- non-critical background art may reach the sheet edge, but the final preflight
  must verify the actual printer's printable area and must not call edge color
  guaranteed on a no-bleed home printer;
- PDF coordinates: 792 × 612 points; 36-point outer safe margins and a 54-point
  left pinned-edge exclusion.

### Option A — balanced overlay

ID: `home_print_balanced_overlay_v1`

- recommended for a visually immersive book with moderate-length read-aloud
  text;
- font: Arial Regular, weight 400;
- selected story size: 18 pt;
- permitted story-size range: 17–20 pt;
- approved minimum: 17 pt;
- leading: 23 pt;
- alignment: left;
- hyphenation: off;
- treatment: borderless warm-white scrim, `#fffaf0`, 92% opacity;
- border: none;
- padding: 16 pt on every side;
- placement remains page-specific and may use any quiet region that passes the
  protected-subject and reading-order gates.

Tradeoff: preserves more visible artwork than the other options while retaining
reliable text contrast. It still needs reserved quiet space and final-art local
contrast measurement.

### Option B — bigger read-aloud type

ID: `home_print_large_readaloud_v1`

- recommended when viewing distance or larger type is the parent's priority;
- font: Arial Regular, weight 400;
- selected story size: 20 pt;
- permitted story-size range: 19–22 pt;
- approved minimum: 19 pt;
- leading: 26 pt;
- alignment: left;
- hyphenation: off;
- treatment: borderless warm-white scrim, `#fffaf0`, 94% opacity;
- border: none;
- padding: 18 pt on every side.

Tradeoff: strongest read-aloud legibility, but long passages occupy more space
and may require a bounded illustration-composition revision. Never shrink below
19 pt to avoid that revision.

### Option C — dedicated cream panel

ID: `home_print_opaque_panel_v1`

- recommended when dependable home-printer contrast is more important than
  maximum art integration;
- font: Arial Regular, weight 400;
- selected story size: 18 pt;
- permitted story-size range: 17–20 pt;
- approved minimum: 17 pt;
- leading: 23 pt;
- alignment: left;
- hyphenation: off;
- treatment: opaque warm-cream panel, `#fff8e8`;
- border: none;
- padding: 18 pt on every side.

Tradeoff: provides the most predictable contrast but is visually heavier. It
may be used only as a consistent book-wide system or a parent-approved
exception, and its complete footprint must clear protected regions.

## Approval record

Before candidate generation, write a versioned decision containing:

```yaml
schemaVersion: 1
projectId:
decisionRevision:
catalogVersion: 1
formatProfileId: home_print_letter_landscape_pinned_v1
offeredOptionIds:
  - home_print_balanced_overlay_v1
  - home_print_large_readaloud_v1
  - home_print_opaque_panel_v1
selectedOptionId:
status: proposed | approved | rejected | superseded
selectionSource: parent | custom
customizations: []
feedback:
decidedAt:
```

An explicit option letter or ID given after the options are presented is a
valid parent selection. Translate letters to IDs in the saved decision. Store
the complete production and typography values in separate versioned profiles;
do not rely on the letter alone downstream.

If the format preconditions do not match, do not adapt these measurements
silently. Present a custom proposal containing every field required by the
placement contract and wait for approval.
