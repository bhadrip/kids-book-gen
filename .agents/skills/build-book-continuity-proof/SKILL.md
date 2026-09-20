---
name: build-book-continuity-proof
description: Create economical black-and-white storyboard proofs for a complete children's book so emotional, character, environment, and prop continuity can be evaluated before final illustration. Use after the performance plan and Visual Bible are ready; do not use for final art or prose revision.
---

# Build Book Continuity Proof

Turn approved story and visual-planning artifacts into a disposable,
black-and-white visual rehearsal of the complete book. Optimize for continuity
evidence and low generation cost, not beauty or publication readiness.

Preserve approved artifacts. A proof exposes planning or staging problems; it
does not silently change the story, EmotionalArc, performance sheet, Visual
Bible, or continuity ledger.

## Required inputs

- complete approved story and exact revision;
- approved EmotionalArc and character performance sheet;
- production-ready Visual Bible, continuity ledger, and selected character
  reference;
- current SpreadMap or BookPlan when available;
- parent must-show, must-keep, and must-avoid details;
- intended page or spread order.

Recurring characters, locations, and plot-bearing props also need exact
reference assets when the book's continuity depends on their visual identity.
If a required recurring reference is missing, create a neutral identification
reference through the upstream visual-planning workflow or report the gap; do
not hide the missing lock inside scene prompts.

If a required package is missing, stale, or contradictory, report the lineage
problem instead of inventing continuity facts. A draft proof may be made from
unapproved inputs only when it is clearly labeled non-authoritative.

## Proof strategy

1. Read the complete ordered book and all required planning artifacts.
2. Build the proof manifest defined in
   [references/output-contract.md](references/output-contract.md). Copy only
   spread-relevant locks into each panel entry.
3. Read [references/generation-strategy.md](references/generation-strategy.md)
   and select `full_scene`, `layered`, or `hybrid` for every spread. Record the
   reason, reused assets, generated assets, and any fallback. Do not assume one
   strategy fits the whole book.
4. Build an asset registry before generation. Record every approved character,
   environment, prop, or action-cluster reference with its revision, role,
   dimensions, content hash when available, alpha status when relevant,
   anchors, and permitted reuse. Generate a neutral recurring-environment
   reference before scene art when stable fixture geometry is not already
   represented visually.
5. Choose the fewest image requests that preserve evaluability. A `full_scene`
   route may use sequential source sheets or individual panels. A `layered`
   route generates only missing transparent assets, then reuses approved
   backgrounds, character poses, and props through deterministic composition.
   A `hybrid` route reuses stable layers but generates interacting characters,
   hands, props, occlusion, foam, fabric, or shadows as one integrated action
   cluster. These are generation intermediates, not the parent-facing contact
   sheet. Do not claim savings merely because artwork is monochrome or layered.
6. Generate missing raster art using the `imagegen` skill. Use black lines on
   white, sparse or no gray, and no finished color, painterly effects, textures,
   decorative detail, typography, logos, or watermarks.
7. Keep generated drawings free of labels and story text. After accepting the
   panel art, assemble exactly one master contact sheet for the complete book.
   Add `SPREAD <number>` deterministically above every drawing and the exact
   approved text for that spread deterministically below it. The below-panel
   copy is a human-review caption, not a final-book placement candidate and not
   scene artwork. Preserve reading order and record separate pixel and
   normalized bounds for the drawing and review caption. Never ask the image
   model to render spread numbers, review captions, or story text.
8. Make continuity-critical evidence visible at normal proof size: character
   silhouette and relative scale, face/gaze when emotionally necessary, hands
   and contact, entrances and fixed landmarks, and every important prop's
   identity, holder, location, and state.
   For recurring environments, show enough fixed landmarks to verify
   inside/outside containment and the action path. Keep a declared camera axis
   during consequential motion, or include an explicit neutral reset panel.
9. Inspect each generated source sheet, composed panel, and master-sheet panel
   crop before accepting it. Split or regenerate only an unreadable sheet or
   panel; do not
   regenerate passing siblings for polish. For layered or hybrid work, inspect
   edges, anchors, z-order, scale, gaze/contact, interaction, occlusion,
   lighting, and contact shadows; exact asset reuse does not prove that the
   assembled action is coherent.
10. Assemble the one numbered, captioned master sheet from accepted panels
    without changing their aspect ratio or relative scale. Copy each review
    caption byte-for-byte from the approved story mapping; do not summarize or
    reline it editorially. Record the source request for every panel, prompt,
    model/request settings when available, source revisions, master-sheet
    filename, grid, labels, drawing bounds, and review-caption bounds.
    Prefer the bundled deterministic
    [contact-sheet assembler](scripts/assemble_master_contact_sheet.py) when the
    sources are PNG files. Read
    [references/contact-sheet-assembly.md](references/contact-sheet-assembly.md)
    before running it. The script emits a portable SVG and mapping JSON without
    requiring an image model or third-party Python package.
11. For bathing, dressing, toileting, medical care, or similar intimate child
    scenes, use age-appropriate dignity-safe staging. Require opaque occlusion or
    careful framing of every private body area and prohibit visible private
    anatomy. Do not solve privacy by leaving ordinary clothes on a child when the
    depicted action requires those clothes to be removed.

## Prompt construction

For each sheet, state in this order:

1. continuity-proof purpose and panel grid;
2. fixed black-and-white storyboard treatment;
3. global character identity and relative-scale locks;
4. one compact block per panel containing spread ID, location, characters,
   trigger, decisive action, observable acting, environment landmarks, prop
   state/holder/location, and required transition evidence;
5. must-preserve and must-avoid constraints;
6. instruction to keep story text and labels out of the drawings.

Do not paste the whole manuscript into the image prompt. Do not use vague
emotion labels where observable face, gaze, hands, posture, or proximity is
required.

For generated reusable assets, state the asset role, required transparent
background, anchor, intended scale, approved identity reference, permitted
reuse, and the interaction it must or must not contain. For a hybrid action
cluster, include every element whose contact or occlusion must be solved
together; do not split a gripping hand from its object merely to maximize reuse.

## Acceptance gate

A proof package is ready for review only when:

- exactly one parent-facing master contact sheet contains the complete book;
- every intended spread appears exactly once and in reading order;
- every drawing has the correct visible `SPREAD <number>` label outside its
  image area, with no duplicate, missing, or model-rendered identifiers;
- every drawing has its exact approved spread text immediately below it as a
  deterministic review caption, with no omission, paraphrase, duplication, or
  model-rendered lettering;
- drawing and review-caption bounds are recorded separately, and the manifest
  identifies the exact story revision used to verify each caption;
- every panel maps to exact source revisions in the manifest;
- every spread records a generation strategy and the exact generated or reused
  assets that produced it;
- every layered bitmap has validated transparency when required, stable anchors,
  dimensions, and content provenance;
- every layered or hybrid composition passes interaction, occlusion, edge,
  lighting, and contact-shadow inspection rather than relying on asset identity
  alone;
- recurring characters are distinguishable and relatively scaled;
- plot-bearing actions and cause-before-reaction staging are visible;
- continuity-critical landmarks and prop facts are large enough to inspect;
- recurring fixed fixtures retain the same silhouette, proportions,
  construction, and landmark relationships across every panel where they
  appear, not merely within one source-generation sheet;
- intimate child scenes use plausible clothing state and opaque, dignified
  staging with no visible private anatomy;
- adjacent panels can be compared without ambiguous numbering or order;
- every changed panel has been checked in a predecessor/changed/successor
  window, with both boundaries recorded separately;
- omitted decorative detail cannot be mistaken for a required continuity fact;
- no panel is presented as final illustration or publication-ready art.

If evidence is too small or absent, mark the panel `needs_reproof`; do not turn
an unevaluable panel into a continuity failure.

## Review handoff

First pass the accepted numbered master sheet, manifest, exact story text
mapping, and planning revisions to `plan-book-text-placement`. The placement
skill must crop from the recorded drawing bounds and exclude the below-panel
review captions. Those captions provide human reading context only; they are
not evidence of a selected location, treatment, type size, or final-book
layout. The placement skill adds separate deterministic candidate overlays
without asking the image model to render words. It may request a bounded
reproof when a face, gesture, prop, or focal action is too small to protect
reliably; the corrected panel is then reassembled into a successor master
sheet without regenerating passing siblings.

Then pass the proof package to:

- `review-book-environment-prop-continuity` for planning-to-image checks of
  locations, geometry, time, weather, lighting cues, and prop timelines;
- `review-book-emotional-arc` for planned-to-visible character performance and
  emotional transitions.

Ask reviewers to treat intentionally omitted non-critical finish as outside
scope. Review findings may request a bounded panel reproof or an upstream plan
successor. They must not trigger final illustration automatically.

## Deliverables

- `continuity-proof-manifest.json`;
- asset registry plus per-spread `full_scene`, `layered`, or `hybrid` routing
  decisions;
- one versioned, numbered master contact sheet for the complete book, with exact
  approved review text beneath every drawing;
- generation-only source sheets and any replacement panel images needed for
  provenance or bounded repair;
- `continuity-proof-prompts.md`;
- `continuity-proof-validation.md` with lineage, readability results,
  unresolved questions, request count, and review readiness;
- separate exact drawing and review-caption bounds, plus deterministic
  panel-to-spread mapping usable by the text-placement stage;
- provenance and downstream staleness notes.
