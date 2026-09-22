# Turnip style-preserved hybrid illustration pilot

Status: in progress; one-page Mae-pull pipeline proof complete, complex helper
chain still requires an interaction-module strategy

## Outcome

Rework _The Turnip That Wouldn't Tip_ without changing Mae, the supporting
cast, the painterly art language, or the approved environment design. The pilot
changes only three things:

1. production uses SVG assembly where the scene has safe layer boundaries;
2. non-focal contrast is reduced so the story action reads first;
3. character performance follows a bounded 1–10 emotion scale.

## Interaction-aware stitching strategy

SVG stitching is not a requirement to turn every noun into a transparent
cutout. Choose the smallest unit that remains physically believable:

- **environment plate:** recurring background with no contact-heavy action;
- **independent character or prop:** an element with clear air around its
  silhouette and no consequential contact;
- **anchored prop plate:** a planted, buried, submerged, shadow-bound, or
  heavily occluded object fused to the environment state;
- **interaction module:** every participant and overlap required for one
  connected action, such as hands gripping leaves or a helper holding another
  helper;
- **foreground occlusion matte:** soil, foliage, blanket, water, or another
  small layer that must pass in front of an action module;
- **integrated-page exception:** a contact-heavy scene whose hands, occlusion,
  lighting, and grounding do not survive separation. Only deterministic text
  and production marks are stitched afterward.

For the pulling beat, Mae and the turnip cannot be unrelated cutouts. Either
Mae's grip, leaves, buried crown, and foreground soil form one interaction
module, or the page stays integrated. A buried turnip must show no floating
lower bulb: the soil line covers the cream body and most of the purple shoulder.
The plant must also keep the correct crown-to-tip order: stalk bases run from
the buried crown to Mae's grip, then the leafy tops continue past her hands
toward Mae. Leaves massed on the root side with cut stalk ends pointing toward
Mae are reversed and must be rejected.

## Contrast rule

Declare one focal interaction per page. Lower chroma, small-detail contrast,
and edge sharpness only in non-focal background regions. Do not globally wash
out the approved art or reduce contrast on faces, hands, contact edges, or
plot-bearing props.

## Emotion rule

Record an intensity for each principal character. Keep ordinary beats at 2–5;
use normal-sized eyes, closed or modest mouths, and differentiated supporting
reactions. Reserve 7–8 for the pull-and-flip climax. Do not default to huge
eyes, open mouths, sweat marks, or synchronized cast reactions.

## Acceptance scenarios

1. Mae and every recurring character remain recognizably the approved design;
   the production method does not introduce a new visual language.
2. Hands, grips, body-to-body holds, and foreground overlaps look anatomically
   continuous at normal reading size; stalk bases, leafy tips, limbs, bodies,
   and ground contact preserve both plant topology and one physically
   consistent force vector.
3. The buried turnip reads as materially inside the soil, not pasted on top of
   it; the uprooted state may become a movable prop later.
4. Each page has one declared focal interaction and a quieter non-focal
   background without flattening the focal subject.
5. At least 75% of story pages use intensity 5 or lower; only the planned
   climax uses the book's peak.
6. Reused source assets have stable hashes and every full-page exception records
   why separation failed.

## Current evidence

- extracted original source illustrations:
  `data/prototypes/turnip-style-preserved/source-pages/`;
- clean low-contrast garden candidate:
  `data/prototypes/turnip-style-preserved/assets/garden-clean-low-contrast.png`;
- integrated pulling-page candidate:
  `data/prototypes/turnip-style-preserved/candidates/page-04-integrated-contact-force-v2.png`.
- deterministic Rapier 2D proof report and contact sheet:
  `data/prototypes/rapier-illustration-physics/output/physics-proof-report.json`
  and `data/prototypes/rapier-illustration-physics/output/00-contact-sheet.png`;
- accepted hybrid root/soil test:
  `data/prototypes/rapier-illustration-physics/generated/accepted/`;
- rejected Mae-pull, Google-model, and multi-character renderer tests:
  `data/prototypes/rapier-illustration-physics/generated/rejected/`.
- final-pipeline Mae-pull proof, compiled coordinates, and composed page:
  `data/prototypes/turnip-final-pipeline-poc/`.

The previous integrated candidate is superseded because its upright leaves
contradicted Mae's leftward pull.

The generated transparent interaction-module attempts were rejected because
they returned baked backgrounds. They are not approved assets and must not be
used in a composed page.

The Rapier slice uses
`@dimforge/rapier2d-deterministic-compat@0.20.0`. The proxy now distinguishes
root-side stalk bases from hand-side leafy tops and verifies the full crown →
stalk → grip → leaf-tip order in addition to burial, contact, counterbalance,
and ground support. The generated root/soil plate remains accepted pilot
evidence. Both one-character Mae pulls are rejected: one contains an orphan
limb, and the Nano Banana Pro comparison reverses the plant topology while also
drifting Mae's identity and retaining excessive contrast. The multi-character
raster remains rejected because it replaced planned body contacts with unsafe
or ambiguous tail/feather contacts. A physics proof is therefore a generation
control and review oracle, not final-art approval.

The bounded final-pipeline proof now compiles a normalized Mae rig plus page
anchors and a pull action into page-space and Rapier-space coordinates. It
passes burial, two-hand contact, force alignment, leaf-tip topology,
counterbalance, and two-foot support checks. The compositor reuses the original
Mae and low-contrast garden as stable base layers. Visual review found two
contact failures that the proxy did not detect: the foreground cabbage was
flattened behind Mae's boot, and the hand read as a closed fist pasted over the
stems. Broad clip masks were rejected because they produced geometric cuts.
Two feathered local interaction patches now revise only the grip and the
boot/leaf contact while leaving Mae's face, body, pose, and the rest of the page
unchanged. This proves the pipeline shape, but the successor raster still
requires visual approval before it can become a book page. No story text was
added because this proof has no approved page-copy artifact.

## Next gate

Review the composed Mae-pull POC at normal reading size. If accepted, record it
as the visual baseline and turn its rig, scene-anchor, action-specification,
physics-proof, generated-module, and composition records into a versioned
artifact contract. Keep the renderer interchangeable and use the cheapest
editing-capable model that passes the gates; the Nano Banana Pro full-page edit
showed no production advantage. Rebuild the helper chain only after this
bounded case is accepted. Do not promote any rejected pull image.

## Architecture impact

Updated. The opt-in compositor accepts validated SVG sources, the opt-in
Rapier harness emits versioned static pose proofs, and the pull-scene compiler
derives those proof inputs from character rigs, scene anchors, and action
specifications. The reusable illustration skill defines interaction-aware
hybrid composition with a physics gate for complex actions. No route,
production service, persistence schema, or approval lifecycle changes in this
pilot.
