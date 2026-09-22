# Illustration production-plan contract

Use this contract for a complete book or any page run intended to be repeated,
resumed, reviewed, or handed to another producer. A one-off exploratory image
that cannot become book art does not need a production plan.

## Compile before generation

The production input binds a run to exact approved artifacts and turns creative
intent into executable page controls:

- `sourceLineage`: exact revisions and SHA-256 hashes for the story,
  EmotionalArc, Visual Bible, continuity proof, BookPlan, and text-placement
  plan when present;
- `canvas`: dimensions, bleed, and safe inset;
- per page: exact story text, one focal region, character performance
  intensities and prohibited signals, action mechanics, continuity locks,
  production units, contrast budget, and typography treatment;
- per production unit: stable ID, role, z-index, and exactly one approved source
  asset or missing-unit generation request.

In the KidsbookGen repository, start from
`examples/illustration-pipeline/minimal-book-plan.json` and run:

```sh
pnpm illustration:compile -- --input <illustration-plan.json> --output <new-run-directory>
```

The output directory must be new. Preserve the compiled plan, page work orders,
and checklist together. Outside the repository, create the same information in
a machine-readable manifest and clearly identify it as an equivalent plan, not
as compiler output.

## Unit selection

Choose the smallest unit that preserves real contact:

| Scene condition                                              | Required unit                             |
| ------------------------------------------------------------ | ----------------------------------------- |
| Stable environment with no consequential contact             | `environment`                             |
| Clean silhouette with no meaningful overlap                  | `independent_asset`                       |
| Buried, planted, submerged, or materially occluded prop      | `anchored_prop_plate`                     |
| Grip, handoff, body hold, or linked participants             | `interaction_module`                      |
| Small element that must pass in front                        | `foreground_occlusion`                    |
| Contact, lighting, or choreography cannot survive separation | `integrated_page_exception` with a reason |

Never satisfy a grip by placing an independent hand layer over an independent
prop. Never model a buried object as a freely movable transparent cutout.

## Conditional physics

Declare a force vector, resistance point, and contact chain for every non-static
action. A deterministic Rapier pose proof is mandatory when the page includes
any buried geometry, any flexible element under load, or three or more linked
contacts. The compiled page work order marks this explicitly.

Run the proof before bitmap generation. After generation, compare the raster's
actual contacts, supports, flexible shapes, and occlusion to the proof. The
proof validates geometry only; it does not approve the raster.

## Page execution

For each compiled page:

1. verify lineage and coordinate anchors;
2. run the conditional physics proof;
3. reuse approved source assets byte-for-byte;
4. generate or edit only the first unresolved queued unit;
5. compose all units in declared z-order;
6. render and inspect identity, contact, grounding, physics, focal hierarchy,
   performance, and continuity;
7. revise the smallest failing unit and repeat the affected inspection;
8. add deterministic typography only after art passes;
9. record the page result without changing the compiled work order.

Do not batch-generate later queued units while an earlier unit is unresolved.
Do not treat successful generation as successful composition or successful
review.

## Enforced book controls

- At least 75% of principal-character performances remain at intensity 2–5;
  no planned intensity exceeds 8.
- Each page has one focal region, at most two competing regions, at most three
  accent colors, and a compressed value/chroma background.
- Typography is deterministic, uses direct dark text, direct white text, or a
  simple band, and declares at least 4.5:1 contrast.
- Image-generation requests contain no typography.
- A failed hard gate creates a local revision; an upstream approved-artifact
  change creates a successor run.
