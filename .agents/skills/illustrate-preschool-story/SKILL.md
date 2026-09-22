---
name: illustrate-preschool-story
description: "Create or revise final preschool picture-book illustrations from approved story, performance, Visual Bible, continuity-proof, and text-placement artifacts. Compile exact inputs into controlled page work orders, then use interaction-aware hybrid SVG assembly with anchored props and coherent contact modules. Do not redesign approved art, write the story, imitate protected franchises or living artists, or approve the finished book."
---

# Illustrate Preschool Story

Turn an approved visual plan into coherent final pages. Treat illustration as a
controlled production system, not a sequence of unrelated full-page prompts.
Preserve the approved art language, character identity, and environment design;
layering is a production method, not permission to redesign them. Create
successor assets when a revision is needed.

Read [references/layered-illustration-workflow.md](references/layered-illustration-workflow.md)
before building assets or composing pages. When producing a complete book or a
reusable page run, also read
[references/production-plan-contract.md](references/production-plan-contract.md)
and compile the approved inputs before generating art.

## Required inputs

- approved story text and exact revision;
- approved EmotionalArc or character performance plan;
- approved Visual Bible, character references, environment locks, prop ledger,
  and must-avoid details;
- ordered continuity proof and current SpreadMap or BookPlan;
- page-specific text-placement plan when available;
- output dimensions, bleed/safe areas, and intended print or screen format.

Record the exact revision and content hash of every upstream artifact. A path
or mutable alias without revision provenance is not enough for a production
run.

If these inputs are missing, stale, or contradictory, report the lineage issue.
Do not invent identity, continuity, or production facts to make a page render.

## Production-plan gate

Before any full-book generation, create one versioned illustration-production
input covering every page. Compile it into ordered page work orders using the
KidsbookGen compiler when available. Compilation must happen before image
generation and must fail closed on missing lineage, invalid contact boundaries,
unsafe contrast or typography, or an overplayed book-level performance plan.

Treat the compiled plan as immutable operational provenance. If an approved
story, performance, Visual Bible, proof, BookPlan, or text-placement revision
changes, create a successor run instead of editing the old work orders. Outside
KidsbookGen, emit an equivalent machine-readable plan; do not claim the
repository compiler ran when it did not.

## Production strategy

1. Compile the book and process pages in sequence. For each page, follow its
   declared strategy, conditional physics gate, ordered production units, and
   hard gates.
2. Resolve every page into reusable asset IDs: environment, character pose and
   expression, prop state, foreground overlap, effects, and deterministic text.
3. Choose layer boundaries by physical integration. Keep buried, planted,
   submerged, shadow-bound, or heavily occluded props fused to an anchored
   environment plate. Keep hands, grips, body-to-body holds, and their required
   occlusion in one interaction module. Separate only characters and props with
   clean visual boundaries. Reuse approved assets byte-for-byte and generate or
   edit one missing unit at a time.
4. When bitmap generation is required, take only the first unresolved unit from
   the page's generation queue. Use the host's `imagegen` skill for that missing
   independent asset, anchored plate, interaction module, or exceptional
   full-page scene. Inspect alpha, seams, contact, grounding, identity, and
   intensity before continuing. Never ask an image model to render story text.
5. Compose in explicit z-order with stable anchors, bounded transforms, contact
   shadows or overlaps where needed, and content hashes for every source asset.
6. For every push, pull, carry, fall, collision, or linked-character action,
   declare and validate the force vector, resistance point, contact chain, and
   counterbalance using the workflow reference. Use a deterministic 2D pose
   proof when the action has buried geometry, flexible tension, or three or
   more linked contacts. Flexible elements must visibly respond to the applied
   force. A passing proxy does not approve a generated raster; compare every
   final grip, support, and occlusion against the proof.
7. Apply the contrast, performance, and typography controls in the workflow
   reference. Record the intended focal region and performance intensity for
   every page.
8. Render ordered page images, the final PDF when requested, a contact sheet,
   and a machine-readable composition manifest. Inspect representative pages
   and every transition involving a changed character, location, or prop.
9. Send the result to final text-placement, character, emotional-arc,
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

- versioned illustration-production input, compiled plan, per-page work orders,
  and production checklist;
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
present in order, every page traces to a compiled work order, recurring assets
can be traced to stable hashes, story text is deterministic and readable,
performance follows the planned arc, each page has a deliberate contrast
hierarchy, action physics and contact are coherent, prop and environment state
agree with the plan, and no claimed output is missing from the package.
