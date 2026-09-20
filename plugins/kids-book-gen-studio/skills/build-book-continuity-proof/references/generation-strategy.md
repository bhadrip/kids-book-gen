# Continuity-proof generation strategy

Choose a route for every spread after reading the approved visual locks and
before requesting images. The goal is reliable evidence with bounded cost, not
maximum asset reuse.

## `full_scene`

Generate the complete panel together when the beat depends on integrated:

- hands gripping, carrying, washing, dressing, or exchanging an object;
- character-to-character contact or overlapping bodies;
- entry into water, furniture, vehicles, bedding, or other strong occlusion;
- splashes, foam, cloth wraps, reflections, or interacting shadows;
- cinematic lighting, unusual perspective, or a composition whose parts cannot
  be positioned independently without changing the meaning.

Full-scene generation may use a multi-panel source sheet when faces, actions,
and props remain readable. It still receives exact character, environment, and
prop references. A full-scene redraw is allowed to vary non-critical finish but
must preserve the locked geometry and identity facts.

## `layered`

Use deterministic layered assembly when:

- an approved background can be reused unchanged;
- approved character pose/expression cutouts already fit the action;
- props do not require precise hand contact or complex occlusion;
- deterministic placement, text-safe space, or exact prop/background identity
  matters more than scene-wide lighting integration;
- each bitmap has a genuine transparent background when transparency is
  required, stable anchors, dimensions, a content hash, and explicit permitted
  uses.

Reject checkerboard pixels, opaque fake transparency, halos, mismatched edge
light, floating feet, missing contact shadows, or a relaxed hand standing in for
a required grip. Exact background reuse cannot compensate for incoherent
interaction.

## `hybrid`

Use hybrid assembly when a stable environment or independent prop can be reused
but the focal action must be generated together. Treat the interacting unit as
one `action_cluster`, for example:

- child + tub rim + bubbles;
- hand + kite string + kite pull;
- two characters hugging;
- character + carried prop + contacting hands;
- towel + wrapped child;
- seated character + chair contact shadow.

Compose the action cluster with the reused environment and any truly
independent props. Keep cluster boundaries away from semantically important
contact when possible.

## Route selection

For each spread:

1. List the decisive visible action and all required contacts/occlusions.
2. Query the accepted asset registry for a compatible background, pose,
   expression, prop state, and scale.
3. Choose the least expensive route that preserves the action without visual
   seams or invented events.
4. Record the route and why the other routes were rejected.
5. Generate only missing assets or panels.
6. If a layered composition fails contact, occlusion, lighting, or emotional
   clarity, retry one missing action asset once, then fall back to hybrid or
   full-scene generation. Record the fallback; do not hide its request count.

Do not route an entire book to one strategy merely for consistency. Consistency
comes from shared references and validation; different beats may need different
rendering strategies.

## Repository compositor

When operating inside a repository that exposes a validated layered compositor,
it may be used for `layered` and `hybrid` routes. In this repository,
`src/lib/illustration-composer/layered-scene.ts` provides validated bitmap,
shape, path, and deterministic text layers with alpha checks and content-hash
provenance. The prototype is not automatically part of the product runtime, so
record whether it was actually invoked. Never claim layered composition merely
because references were supplied to a full-scene image request.

Outside this repository, use an equivalent host compositor when available or
fall back to full-scene proof generation. The skill must still return the
routing plan and manifest if no image or composition capability is available.
