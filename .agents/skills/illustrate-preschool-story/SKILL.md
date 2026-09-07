---
name: illustrate-preschool-story
description: Plan and generate emotionally clear, visually consistent illustrations for preschool picture books from an approved story, spread plan, or book plan. Use for character exploration, sample spreads, covers, or full-book artwork for ages 3–5; do not use to rewrite the story or evaluate prose quality.
---

# Illustrate Preschool Story

Turn approved story intent into illustration-ready briefs and raster artwork.
Preserve the manuscript’s meaning, the child’s agency, and every approved
character, prop, environment, and emotional-continuity fact.

The user's instructions take precedence over this skill. Treat existing
approved artifacts as immutable: create a successor version when a requested
change conflicts with them and identify downstream artwork that may be stale.

## Inputs and routing

Accept one or more of:

- `story.json` or manuscript;
- spread map or book plan;
- visual bible, character sheet, or approved reference image;
- a spread number, scene, cover request, or full-book request;
- optional art direction, dimensions, destination, and must-keep details.

Read the complete source story and the requested spread before planning. When
available, also read the current visual plan and character references. Never
infer that a later artifact overrides an explicitly approved earlier one.

Resolve art direction using
[references/preset-routing.md](references/preset-routing.md). An explicit user
choice or approved `presetId` always wins. Otherwise choose exactly one of
`bold_funny_v1`, `detailed_discovery_v1`, or `warm_handmade_v1`; use
`warm_handmade_v1` when neither specialized preset clearly fits. Do not invent
or blend a custom style unless the user explicitly requests custom art
direction.

For full-book work, select one preset for the whole book, then require both the
approved EmotionalArc and character performance sheet produced by
`build-character-performance-plan` and the package produced by
`build-visual-bible`: a schema-valid VisualBible, continuity ledger, reference
briefs, and selected character reference. If either package is missing or
blocked, create or complete it before generating scene art. Do not route each
spread to a different preset.

## Workflow

1. Extract the scene’s narrative purpose, emotion, visible action, characters,
   setting, props, continuity facts, and page-turn function.
   For full-book work, copy the relevant face, gaze, gesture, posture,
   interaction, and cause-before-reaction locks from the approved performance
   sheet; an emotion label alone is insufficient.
2. Resolve and record one exact Studio `presetId`, then build an illustration brief using
   [references/illustration-contract.md](references/illustration-contract.md).
3. Separate fixed invariants from tweakable art direction. Do not silently add
   story events, characters, possessions, text, or moral messaging.
4. Load every visual property for that ID from the canonical Studio preset and
   compose a concise production prompt. State interactions and spatial
   relationships explicitly when they carry the story. Do not substitute a
   loosely similar style label.
5. Use the `imagegen` skill and its built-in image-generation tool by default.
   Use case: `illustration-story`. For a project asset, save the selected image
   into the workspace with a descriptive, versioned filename.
6. Inspect the result for narrative accuracy, emotional clarity, preschool fit,
   anatomy, character identity, prop ownership/state, environment continuity,
   accidental text, and unwanted visual fear or shame.
7. If a material check fails, make one targeted revision and inspect again.
   Do not accumulate unrelated stylistic changes during correction.
8. Save the final prompt and brief beside the image or in the requested
   artifact so the user can tweak and regenerate it.

For a one-image request, generate one polished image. Do not generate a batch
or whole book unless requested. For full-book generation, create one prompt per
spread, attach the relevant approved references, and copy the applicable
VisualBible and continuity-ledger locks into every prompt.

## Preschool visual rules

- Make the decisive child action readable without relying on the manuscript.
- Show difficult feelings with empathy, not grotesque distress, humiliation,
  isolation, or threatening adult body language.
- Keep adults supportive rather than visually dominant or coercive.
- Use expressive faces, readable silhouettes, concrete action, and uncluttered
  focal hierarchy suitable for ages 3–5.
- Distinguish pretend or imagined objects from real edible or dangerous items
  when the story requires it.
- Preserve ownership and boundaries; sharing does not imply surrendering a
  treasured possession.
- Leave typography out of scene artwork unless the user explicitly requests
  exact visible text. Story text is normally rendered separately.

## Continuity locks

Once established or approved, repeat these facts in every relevant prompt:

- character age, body proportions, skin tone, hair, face, clothing, and
  signature items;
- relative character scale and relationship;
- recurring prop identity, owner, state, and location;
- room geometry, landmarks, time, weather, lighting progression, and palette;
- current emotional state and how it differs from the prior spread.

Do not use style labels as a substitute for concrete continuity facts.

## Deliverables

Return or save:

1. source artifact and exact spread/scene;
2. illustration brief;
3. final image-generation prompt;
4. generated image path;
5. validation notes and any unresolved continuity questions;
6. scene-specific tweakable fields such as framing, viewpoint, focal placement,
   and emotional emphasis; list preset properties separately so the user can
   explicitly request a custom successor when desired.

Also report whether the preset came from the user, an approved artifact, or the
default routing rule.

For a worked example, read
[references/lina-moon-pocket-example.md](references/lina-moon-pocket-example.md).
