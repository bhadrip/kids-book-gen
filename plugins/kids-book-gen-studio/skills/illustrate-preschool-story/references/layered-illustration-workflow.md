# Layered illustration workflow

## Asset vocabulary

Create the smallest reusable vocabulary that can express the book:

- one canonical layer per recurring environment and meaningful time state;
- one canonical character identity plus only the poses or expressions needed by
  the performance plan;
- one asset per important prop state, including held, moved, transformed, and
  consumed states;
- separate foreground overlaps, shadows, motion accents, and typography.

Layer boundaries follow physical contact. A turnip buried in soil, feet in
water, a body under a blanket, or an object embedded in fog is normally an
anchored environment/prop plate, optionally with a foreground occlusion matte.
Hands gripping leaves or characters holding one another belong to one
interaction module unless a tested overlap construction is genuinely seamless.
The prop becomes freely movable only after the story changes its physical state.
Do not force every noun into an independent transparent cutout.

Each source asset must preserve the approved art language and character identity
unless an approved successor explicitly changes them. It must also have a stable
ID, dimensions or view box, content hash, anchor, approved role, source revision,
and page-use list. Reusing the same asset means reusing the same bytes, not
prompting for a similar redraw.

## Action physics and force vectors

Before producing any push, pull, carry, fall, collision, or linked-character
action, record:

- the applied force direction;
- the fixed or resisting point;
- every contact that transfers the force;
- the character's counterbalance through shoulders, torso, hips, and feet;
- every flexible element that must bend, stretch, trail, compress, or remain
  taut.

Validate the full force chain in the rendered image. For a character pulling a
rooted plant leftward, the root remains the resisting point; the stems bend and
become taut toward the hands; the wrists and arms continue that line; and the
body and braced feet lean against it. Upright leaves paired with a strong
sideways pull are a hard failure even when the hands appear to touch. In a
helper chain, each grip, body angle, spacing, and ground contact must transmit
the same force direction without gaps or contradictory leans.

Validate plant topology separately from force alignment. The crown remains at
the root; bare stalk or petiole bases run from the crown to the grip; and the
leafy distal ends continue beyond the grip toward the puller. Leaf blades
clustered on the root side while cut-looking stalk ends protrude toward the
puller are a hard failure, even if the crown-to-hand segment aligns with the
force vector. Trace crown → stalk base → grip → leafy tip before accepting the
image.

Do not use motion lines to disguise incorrect mechanics. Revise the smallest
coherent interaction module, or use an integrated-page exception when the
contact chain cannot be layered seamlessly.

### Deterministic 2D pose proof

For buried objects, tensioned flexible props, or a chain with three or more
contacts, create a deterministic static pose proof before bitmap generation.
Use simple collision proxies rather than trying to simulate anatomy or painterly
shape:

- fixed soil and resistance geometry;
- buried-prop samples that measure the hidden ratio and exposed crown;
- jointed capsule or segment chains for stems, rope, cloth edges, or other
  tensioned flexible elements;
- point or shape sensors for every hand, paw, wing, hoof, foot, and ground
  support that must touch;
- explicit force and reaction vectors plus torso lean and support thresholds.

Record the engine and version, coordinates, constraints, thresholds, and
machine-readable results. The proof controls geometry; approved references
still control character identity, medium, palette, and performance.

After generation, compare the raster to the proof visually. Reject it when a
model invents a different load path—such as substituting a tail or loose feather
for a planned body grip—even if the proxy passed and the picture is otherwise
attractive. For repeated failures, generate the connected participants as one
interaction module or keep the page integrated instead of adding more prompt
language.

## Contrast budget

Declare one focal region per page. That region may own the strongest value
separation, sharpest meaningful edge, warmest or most saturated accent, or
highest local detail—but the whole page must not own all of them.

- Keep recurring backgrounds in a compressed value and chroma range.
- Simplify background edges and detail behind faces, hands, text, and decisive
  props.
- Limit strong accent colors; repeat them intentionally rather than scattering
  unrelated bright details.
- Use shadows to establish contact, not to make every object glossy or dramatic.
- Inspect pages at thumbnail size. If three or more regions compete first, the
  hierarchy is not resolved.

Do not apply a blanket saturation percentage as a substitute for art direction.
Compare focal and non-focal regions and revise the competing layer.

## Character performance scale

Record an integer intensity from 1 to 10 for each principal character on each
page:

- 1–2: neutral attention, rest, or quiet observation;
- 3–4: mild interest, effort, uncertainty, or warmth;
- 5–6: clear concern, frustration, delight, or purposeful effort;
- 7–8: story climax or strong physical action;
- 9–10: exceptional distress or exuberance, rarely appropriate for ages 3–5.

Use face, gaze, hands, posture, proximity, and weight distribution. Avoid
default huge eyes, open mouths, flying limbs, and synchronized cast reactions.
Most pages should sit at 2–5. Supporting characters may remain neutral while
the focal character reacts. Reserve the peak for the planned climax.

## Typography and text-safe composition

Story text is always a deterministic layer composed after the art. Never accept
model-rendered lettering.

Choose the treatment page by page:

- dark text directly on genuinely quiet light space;
- white text directly on a uniform dark field with at least 4.5:1 contrast;
- a simple square-edged or lightly softened color band when the art provides no
  safe field.

Do not default every page to the same rounded cream card or speech-bubble shape.
Keep line lengths comfortable, protect faces and plot-bearing action, and test
the rendered output rather than trusting coordinates alone.

## Composition and review loop

1. Validate source lineage and build the asset and scene manifests.
2. Reuse approved layers; create only missing assets.
3. Compose a complete page in explicit z-order.
4. Render the page and inspect identity, interaction, contact, contrast, text,
   force direction, resistance, counterbalance, and continuity.
5. Revise the smallest failing layer. Re-render adjacent predecessor and
   successor pages when the change affects a transition.
6. Assemble the complete contact sheet and run specialist reviews before final
   approval.

Escalate to a full-page raster only after documenting the specific interaction
or integration problem that layering cannot solve.
