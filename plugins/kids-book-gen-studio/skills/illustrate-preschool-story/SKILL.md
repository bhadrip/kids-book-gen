---
name: illustrate-preschool-story
description: "Create or revise final preschool picture-book illustrations from approved story, performance, Visual Bible, continuity-proof, and text-placement artifacts. Use interaction-aware hybrid SVG assembly: reuse safe independent layers, keep buried or occluded props anchored, and preserve physical contact in coherent modules or integrated pages. Do not redesign approved art, write the story, imitate protected franchises or living artists, or approve the finished book."
---

# Illustrate Preschool Story

Turn an approved visual plan into coherent final pages. Treat illustration as a
controlled production system, not a sequence of unrelated full-page prompts.
Preserve the approved art language, character identity, and environment design;
layering is a production method, not permission to redesign them. Create
successor assets when a revision is needed.

Read [references/layered-illustration-workflow.md](references/layered-illustration-workflow.md)
before building assets or composing pages.

## Required inputs

- approved story text and exact revision;
- approved EmotionalArc or character performance plan;
- approved Visual Bible, character references, environment locks, prop ledger,
  and must-avoid details;
- ordered continuity proof and current SpreadMap or BookPlan;
- page-specific text-placement plan when available;
- output dimensions, bleed/safe areas, and intended print or screen format.

If these inputs are missing, stale, or contradictory, report the lineage issue.
Do not invent identity, continuity, or production facts to make a page render.

## Production strategy

1. Resolve every page into reusable asset IDs: environment, character pose and
   expression, prop state, foreground overlap, effects, and deterministic text.
2. Choose layer boundaries by physical integration. Keep buried, planted,
   submerged, shadow-bound, or heavily occluded props fused to an anchored
   environment plate. Keep hands, grips, body-to-body holds, and their required
   occlusion in one interaction module. Separate only characters and props with
   clean visual boundaries. Reuse approved assets byte-for-byte and generate or
   edit one missing unit at a time.
3. When bitmap generation is required, use the host's `imagegen` skill for only
   the missing independent asset, anchored plate, interaction module, or
   exceptional full-page scene. Inspect alpha, seams, contact, grounding,
   identity, and intensity before acceptance. Never ask an image model to
   render story text.
4. Compose in explicit z-order with stable anchors, bounded transforms, contact
   shadows or overlaps where needed, and content hashes for every source asset.
5. For every push, pull, carry, fall, collision, or linked-character action,
   declare and validate the force vector, resistance point, contact chain, and
   counterbalance using the workflow reference. Use a deterministic 2D pose
   proof when the action has buried geometry, flexible tension, or three or
   more linked contacts. Flexible elements must visibly respond to the applied
   force. A passing proxy does not approve a generated raster; compare every
   final grip, support, and occlusion against the proof.
6. Apply the contrast, performance, and typography controls in the workflow
   reference. Record the intended focal region and performance intensity for
   every page.
7. Render ordered page images, the final PDF when requested, a contact sheet,
   and a machine-readable composition manifest. Inspect representative pages
   and every transition involving a changed character, location, or prop.
8. Send the result to final text-placement, character, emotional-arc,
   environment/prop, and text-image production reviews. Do not mark the book
   approved yourself.

## Full-page exception

Use a full-page raster when hand contact, occlusion, integrated lighting, crowd
choreography, or a cinematic composition cannot be expressed cleanly by the
available asset vocabulary. Document why separation failed, preserve the
page's text-safe region, and add typography afterward. Never accept visible
seams, floating hands, pasted-on soil contact, or false transparency merely to
claim that a page was layered.

Do not imitate Bluey, another protected franchise, or a named living artist.
Translate references into general attributes such as controlled hierarchy,
clear silhouette, readable staging, and quiet acting while preserving the
book's already approved art language.

## Deliverables

- versioned asset manifest with stable IDs, roles, dimensions, hashes, source
  revisions, and allowed reuse;
- ordered scene manifests with z-order, transforms, focal region, performance
  intensity, text treatment, and continuity locks;
- rendered page images and optional print-ready PDF;
- contact sheet and production validation report;
- versioned 2D physics pose proof when the action required one, including the
  engine version, proxy geometry, constraints, thresholds, and pass/fail data;
- generation prompts and settings only for assets that actually required
  generation;
- unresolved findings and downstream review handoff.

## Acceptance gate

The illustration package is ready for specialist review only when all pages are
present in order, recurring assets can be traced to stable hashes, story text is
deterministic and readable, performance follows the planned arc, each page has
a deliberate contrast hierarchy, action physics and contact are coherent, prop
and environment state agree with the plan, and no claimed output is missing
from the package.
