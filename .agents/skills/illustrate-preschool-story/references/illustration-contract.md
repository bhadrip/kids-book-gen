# Illustration contract

Use this contract for each generated scene.

```yaml
source:
  artifact:
  revision:
  spread_or_scene:

preset:
  id:
  selection_source: user | approved_artifact | default_routing
  routing_reason:

narrative:
  story_function:
  emotional_beat:
  decisive_visible_action:
  page_turn_support:

continuity_locks:
  characters:
  wardrobe:
  recurring_props:
  ownership_and_state:
  environment_geometry:
  time_weather_lighting:

art_direction:
  medium:
  palette:
  framing:
  viewpoint:
  lighting:
  texture:
  detail_density:

layout:
  aspect_ratio:
  focal_hierarchy:
  safe_area_or_gutter:
  text_space:

constraints:
  must_show:
  must_preserve:
  must_avoid:

output:
  destination:
  version:
```

## Prompt order

Compose the generation prompt in this order:

1. use case and intended asset;
2. scene and backdrop;
3. characters with locked identity facts;
4. decisive action and expressions;
5. composition and focal hierarchy;
6. medium, palette, lighting, and texture;
7. continuity invariants;
8. avoid list and text policy.

Do not paste the whole manuscript into the prompt when a concrete scene brief
will do. Describe gestures and object interactions precisely. Use positive
descriptions for the target result and a short avoid list for likely failures.

## Validation checklist

- The image depicts the requested spread rather than an adjacent beat.
- The emotional state is legible and proportionate.
- The child's action, not an adult command, owns the resolution when relevant.
- Character identities and relative ages are stable.
- Hands, limbs, gaze, and touched objects support the intended interaction.
- Recurring objects retain appearance, ownership, location, and state.
- Environment and lighting agree with story time and nearby spreads.
- Important objects are not hidden by crop, gutter, or clutter.
- Pretend elements read as imaginative play when required.
- There is no accidental lettering, watermark, logo, extra character, or extra
  story event.
- The image is warm and engaging for preschool readers without using fear,
  shame, or visual coercion.

Record failures as targeted corrections. Preserve every passing invariant in
the correction prompt.
