---
name: build-visual-bible
description: Build a production-ready VisualBible and continuity reference package from an approved children's story, selected art preset, and character reference. Use after story approval and before sample-spread, book-plan, or full-book illustration work; do not use to draft the story or generate finished scene art.
---

# Build Visual Bible

Convert approved story facts into explicit visual locks that downstream image
generation can repeat and evaluate. Preserve approved inputs: when a lock must
change, create a numbered successor and identify affected downstream artwork as
stale rather than overwriting the approved bible.

## Required inputs

- the complete approved `story.json` and its exact revision;
- the project ID;
- one exact Studio `presetId`;
- the selected, versioned character reference image;
- the approved EmotionalArc and character performance sheet produced by
  `build-character-performance-plan`.

An approved `SpreadMap`, parent must-keep details, or existing VisualBible should
also be read when present. If the preset, character, or performance package is
not yet selected or approved, report that prerequisite instead of inventing it.
Do not generate finished spreads while using this skill.

## Workflow

1. Read the complete story, not only character summaries. Extract only visible
   canonical facts plus facts that must be decided for illustration continuity.
2. Build inventories for characters, recurring props, and recurring locations.
   For every claimed fact, record its source as approved text, approved visual
   reference, preset, or an explicit proposed lock.
3. Resolve contradictions visibly. Approved story and parent choices outrank
   generated visual assumptions. Mark undecided, consequential choices for
   approval; do not hide them in prose.
4. Define stable character identity and scale, prop identity and ownership, and
   environment geometry and landmarks. Treat appearance as insufficient: also
   describe spatial relationships and state.
5. Build a spread-by-spread continuity ledger. Track each recurring prop's
   owner, location, state, transfer, appearance, and disappearance; track each
   location's time, weather, lighting, and permitted geometry changes.
6. Choose three palette swatches from the canonical selected preset, one
   book-wide text-safe corner, and a concise visual avoid list. Never blend
   presets without an explicit custom-art-direction request.
7. Produce the runtime `visual-bible.json` using the exact project schema. Read
   [references/output-contract.md](references/output-contract.md) before writing
   it. Also produce the companion `continuity-ledger.md` and
   `reference-briefs.md`; these retain the detail the current runtime schema
   cannot encode.
8. Create reference images only when the user requests them or when this task is
   part of an explicitly requested full visual-bible build. Use the `imagegen`
   skill for raster references. Generate neutral identification sheets—not
   story scenes—and inspect them against the written locks before linking them.
9. Run the completion gate below. A missing or contradictory required lock
   blocks downstream illustration; a purely decorative unknown does not.

## Lock design

Write locks as concrete, observable facts. Prefer “round window centered above
the reading chair on the back wall” to “cozy bedroom.” Separate:

- **immutable locks:** identity, proportions, wardrobe, signature marks,
  location geometry, landmark placement, prop construction and owner;
- **stateful locks:** object location/state, time, weather, lighting, temporary
  clothing, character emotion;
- **tweakable direction:** camera, crop, staging, and focal placement.

Never turn an absent story detail into an implied story event. Proposed design
choices must be labeled as proposals until accepted.

## Completion gate

The package is ready only when:

- every recurring character has an identity lock and relative scale;
- every plot-bearing prop has one canonical description and an initial owner,
  location, and state;
- every recurring location has stable geometry and named landmarks;
- every spread has time, location, present characters, and prop-state entries;
- every spread agrees with the approved EmotionalArc and performance sheet;
- consecutive spreads have no unexplained prop transfer, disappearance,
  location jump, or time reversal;
- `visual-bible.json` conforms to the runtime schema and references the exact
  story revision, preset, and character asset;
- all reference assets agree with the written locks.

Report unresolved decisions and do not call the package production-ready until
all blocking items are resolved. Hand the completed package to
`illustrate-preschool-story`, which must include the relevant locks and
reference assets in each spread prompt.

## Deliverables

- `visual-bible-NN.json` and current `visual-bible.json` alias when operating in
  a project repository that supports revisioned artifacts;
- `continuity-ledger.md` with one row per spread and explicit transitions;
- `reference-briefs.md` for character, prop, and environment sheets;
- generated reference image paths, when generated;
- provenance, unresolved decisions, validation result, and staleness impact.
