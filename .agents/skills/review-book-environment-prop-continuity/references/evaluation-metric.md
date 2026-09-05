# Environment and prop continuity metric

Metric ID: `environment-prop-continuity-v1`

## Score anchors

- `0` — required evidence is absent or contradicts an established fact.
- `1` — continuity is plausible but ambiguous, weak, or insufficiently visible.
- `2` — continuity clearly matches the established fact at normal reading size.
- `not_applicable` — the check does not apply to this page or entity.
- `not_evaluable` — required artifact or visible evidence is unavailable.

## Environment checks

| ID        | Observable test                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------- |
| `ENV-P01` | The page depicts the planned or previously established location.                                   |
| `ENV-P02` | Stable landmarks and defining background details retain identity.                                  |
| `ENV-P03` | Relevant entrances, exits, paths, furniture, and fixed features preserve compatible geometry.      |
| `ENV-P04` | Character and prop positions are possible within the established space.                            |
| `ENV-P05` | Viewpoint changes explain which setting features appear, disappear, or reverse on the image plane. |
| `ENV-P06` | Time of day and elapsed-time cues follow the story sequence.                                       |
| `ENV-P07` | Weather and seasonal state persist or change with visible or planned cause.                        |
| `ENV-P08` | Light direction, intensity, and practical light sources are compatible within the scene.           |
| `ENV-P09` | Persistent world details required by the plan remain present and compatible.                       |
| `ENV-P10` | A return to a recurring location remains recognizable while allowing story-caused change.          |

## Prop checks

| ID         | Observable test                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| `PROP-P01` | Each story-important prop is present when required and absent only when justified.                             |
| `PROP-P02` | Defining identity traits such as type, color, markings, material, and relative size persist.                   |
| `PROP-P03` | State follows its timeline: intact, open, full, torn, repaired, wet, consumed, assembled, or similar.          |
| `PROP-P04` | Holder, owner, or wearer matches the last established transfer or action.                                      |
| `PROP-P05` | Location and movement follow visible action or an explicit story transition.                                   |
| `PROP-P06` | Quantity and component count persist or change with an established cause.                                      |
| `PROP-P07` | Orientation or handedness remains compatible when it carries story meaning.                                    |
| `PROP-P08` | Contact and interaction are physically coherent: held, worn, inserted, poured, attached, or used as intended.  |
| `PROP-P09` | Damage, repair, transformation, or consumption remains visible after it occurs unless later action changes it. |
| `PROP-P10` | A recurring prop remains distinguishable from similar incidental objects.                                      |

## Whole-book checks

| ID         | Observable test                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| `CONT-B01` | Every recurring environment has a non-contradictory fact timeline.                                   |
| `CONT-B02` | Every story-important prop has a complete state, holder, and location timeline.                      |
| `CONT-B03` | Changes between nonadjacent appearances have explicit or reasonably visible causes.                  |
| `CONT-B04` | No required environment or prop silently disappears from a continuity-critical beat.                 |
| `CONT-B05` | Climax and resolution preserve the consequences of earlier environment and prop changes.             |
| `CONT-B06` | Planning artifacts contain enough continuity facts to constrain production without inventing policy. |

## Scoring guidance

Score each applicable entity/check pair, not merely one score per page. A page
with a correct room and contradictory weather receives separate results.

For a `1`, state exactly what remains ambiguous. Examples include a damaged
corner hidden by a hand, a landmark too small to verify, or an object transfer
that may have occurred off-page but is neither shown nor planned.

For a `0`, cite the established fact and contradictory visual evidence. Do not
fail an entity because harmless rendering details vary when its defining traits
and story state remain stable.

## Hard gates

- `CONT-H01 WRONG_LOCATION` — a critical beat occurs in a contradictory location.
- `CONT-H02 IMPOSSIBLE_GEOMETRY` — setting geometry makes a required action or transition impossible or reverses a story-critical relationship.
- `CONT-H03 CRITICAL_PROP_MISSING` — a must-show prop is absent where the action requires it.
- `CONT-H04 PROP_IDENTITY_CHANGED` — a story-important prop becomes a different object without explanation.
- `CONT-H05 STATE_REGRESSION` — damage, repair, opening, consumption, assembly, or transformation reverses without cause.
- `CONT-H06 OWNERSHIP_TRANSFER_BROKEN` — the wrong character has or uses a prop in a way that changes agency or causality.
- `CONT-H07 CONSEQUENCE_ERASED` — the climax or resolution omits an environment or prop consequence required by earlier events.
- `CONT-H08 APPROVED_FACT_CONTRADICTED` — a parent-approved must-keep, must-show, or must-avoid fact is violated.
- `CONT-H09 INVALID_LINEAGE` — exact evaluated revisions are missing, stale, or from incompatible revision chains.

## Finding construction

Combine multiple failed checks when they share one cause. For example, a kite
changing from torn in Maya's hands to intact in her friend's hands is one prop
finding referencing `PROP-P03`, `PROP-P04`, and possibly hard gates `CONT-H05`
and `CONT-H06`.

Write revisions as concrete visual instructions:

> On `story-09` revision 2, restore the red kite's patched lower-right corner
> and place it in Maya's hands. Preserve Maya's approved design, the rooftop,
> sunset lighting, the friend's supportive pose, and the upper-left text-safe
> area. Success: the patch remains visible at normal size and the holder matches
> the transfer established on `story-08` revision 1.

Do not use vague instructions such as “make continuity better.”
