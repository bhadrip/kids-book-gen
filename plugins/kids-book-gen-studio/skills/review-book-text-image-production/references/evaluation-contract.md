# Text-image and production evaluation contract

Metric ID: `book-text-image-production-v1`

## Results

- `pass`: clear and correct at normal reading size.
- `needs_revision`: absent, contradictory, inaccessible, or reader-confusing.
- `not_applicable`: the check does not apply.
- `not_evaluable`: evidence or measurement is unavailable.

## Checks

| ID | Test |
| --- | --- |
| `TIP-T01` | Every speaker, referent, and reader-required inference is recoverable from the combined page. |
| `TIP-T02` | Text and image have an intentional relationship and do not accidentally contradict. |
| `TIP-T03` | A newly consequential character is introduced or foreshadowed before the reader must understand its role. |
| `TIP-T04` | Location, time, and plan changes have a textual or visual bridge. |
| `TIP-T05` | A transformed, consumed, divided, or moved object retains identity, state, and story-significant scale. |
| `TIP-S01` | Consequential motion retains screen direction across a sequence, or a neutral reset/explicit viewpoint change explains reversal. |
| `TIP-S02` | Page-to-page composition makes cause precede result and preserves spatial relationships needed for the action. |
| `TIP-P01` | Normal text contrast is at least 4.5:1 and large text contrast is at least 3:1 across the complete text background. |
| `TIP-P02` | Text is legible at intended size, unobstructed, unclipped, and ordered correctly. |
| `TIP-P03` | No proof-only locator, prompt artifact, accidental text, or production marker appears in the final reader artifact. |
| `TIP-P04` | Cover title/subtitle and credits remain readable over their actual artwork. |

## Hard gates

- `TIP-H01 ACCESSIBILITY_CONTRAST`: required reader text fails `TIP-P01`.
- `TIP-H02 ESSENTIAL_TEXT_IMAGE_CONTRADICTION`: text and image disagree about
  a plot-bearing character, action, object, state, scale, or outcome.
- `TIP-H03 UNBRIDGED_READER_STATE_CHANGE`: a new character, location, time,
  plan, or transformation cannot be recovered for the intended reader.
- `TIP-H04 ACTION_GEOGRAPHY_BROKEN`: screen direction or geometry makes a
  consequential action appear discontinuous or reversed without explanation.
- `TIP-H05 INTERNAL_MARKER_LEAK`: proof-only identifiers reach the final book.

## Finding fields

Each finding records: pages and revisions, check IDs, visible/extracted evidence,
reader prediction labeled as prediction, result, confidence, hard gate, likely
owner, bounded correction, preserve list, success criteria, related evaluators,
and reruns. Consolidate multiple symptoms of one root cause.
