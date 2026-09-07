---
name: build-character-performance-plan
description: Turn an approved children's story into a schema-valid EmotionalArc and spread-by-spread character performance plan with drawable expressions, poses, gestures, interactions, and cause-before-reaction staging. Use after story approval and before visual-bible or illustration work; do not use to rewrite the story or evaluate finished artwork.
---

# Build Character Performance Plan

Translate emotional intent into observable acting that an illustrator or image
model can execute. Preserve the approved story's agency, sequence, relationship
boundaries, and emotional safety. Do not introduce new events merely to make an
emotion easier to show.

## Required inputs

- the complete approved `story.json` and exact revision;
- project ID and reader configuration;
- approved parent must-keep and avoid details;
- the current `EmotionalArc` and `SpreadMap`, when they exist.

If the story is not approved, stop at a clearly labeled draft. If an approved
EmotionalArc exists, treat it as authoritative and create a successor only when
the requested performance plan exposes a real contradiction or missing bridge.

## Workflow

1. Read the complete story in order. Identify each character whose emotion,
   reaction, or relationship affects the visual meaning of a spread.
2. For every relevant spread and character, record entering state, visible
   trigger, outward expression, leaving state, intensity, and prohibited
   signals. Read [references/output-contract.md](references/output-contract.md)
   before producing the runtime artifact.
3. Convert every abstract emotion into compatible observable evidence across
   face, gaze, shoulders, hands, posture, movement, proximity, touch, and
   interaction. Select only the signals needed for a clear preschool read.
4. Preserve causality. Stage `trigger → action → reaction` so the reaction does
   not appear before its visible cause. When one image must show both, use
   positions, eyelines, or an unmistakable action-result relationship.
5. Compare adjacent spreads. Ensure each intended transition is credibly
   reachable from the prior leaving state and is visibly differentiated when
   the story requires change. Quiet continuity may deliberately retain a pose.
6. Define a book-wide performance vocabulary for each recurring character:
   stable gesture habits, expression range, body-energy range, relationship
   behavior, and prohibited acting. Keep identity design and wardrobe in the
   VisualBible rather than duplicating their authority here.
7. Produce the runtime `emotional-arc-NN.json` plus the companion
   `character-performance-sheet.md`. If a SpreadMap exists, cite its exact
   revision and report any conflict; do not silently rewrite it.
8. Run the completion gate. Report blocking ambiguities instead of inventing a
   consequential emotional choice.

## Performance rules

- The child's decisive choice must be visible and voluntary.
- Adults may listen, model, wonder, and support, but their pose must not make
  them the agent of the child's resolution.
- Supporting-character reactions must have a visible target and occur after or
  simultaneously with their trigger.
- Avoid using the same open smile, pointing gesture, or front-facing pose as the
  default for neighboring beats.
- Use intensity appropriate to the event. Do not exaggerate quiet uncertainty
  into terror or frustration into threatening aggression.
- Preserve boundaries through distance, hand placement, ownership, and gaze.
- State what changes from the prior spread, not merely the new emotion label.

## Completion gate

The plan is ready only when:

- every story spread is represented for the protagonist;
- every important supporting-character reaction is represented;
- all triggers are visible or explicitly carried from the preceding spread;
- every consequential action has a clear actor, target, and immediate result;
- every intended emotional change names observable before/after differences;
- cause precedes reaction throughout the sequence;
- no prohibited signal, coercive adult staging, unexplained emotional jump, or
  repeated generic performance remains;
- the EmotionalArc validates against the current runtime schema.

## Handoff

Pass the approved EmotionalArc and character performance sheet to
`build-visual-bible`. The VisualBible owns appearance, environment, and prop
locks; this plan owns acting and emotional sequence. Pass both packages to
`illustrate-preschool-story`, which must copy the relevant performance evidence
and causality requirements into every spread prompt.

## Deliverables

- `emotional-arc-NN.json` and current `emotional-arc.json` alias when supported;
- `character-performance-sheet.md` containing global character vocabularies and
  one row per relevant character per spread;
- provenance, unresolved decisions, completion status, and downstream
  staleness impact.
