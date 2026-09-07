# Worked example: Lina and the Moon-Pocket Picnic

This is a self-contained, tweakable example, not a universal visual style.
Under the current default rules, the story's playful sounds, comic reactions,
and active read-aloud rhythm route it to `bold_funny_v1`.

## Source

- Assumed approved story revision: 2
- Example scene: spread 8
- Text: Sol takes an enormous pretend bite; Lina and Papa laugh, and even the
  moon seems to join the joke.

## Illustration brief

```yaml
preset:
  id: bold_funny_v1
  selection_source: default_routing
  routing_reason: playful sound effects, exaggerated pretend nibble, comic reactions, and energetic read-aloud rhythm dominate the story

narrative:
  story_function: comic relief and natural consequence of Lina's sharing choice
  emotional_beat: delighted connection after cautious generosity
  decisive_visible_action: toddler Sol performs an enormous pretend nibble of one imaginary red starberry offered by Lina

continuity_locks:
  characters:
    Lina: inventive four-year-old, expressive dark eyes, warm brown skin, dark wavy chin-length hair, indigo pajamas patterned with tiny silver moons
    Sol: Lina's toddler brother, warm brown skin, short dark curls, pale yellow footed pajamas
    Papa: warm brown skin, dark curly hair, soft green knit top, seated at the children's level
  recurring_props:
    blanket: soft blue blanket with one clearly visible sewn pocket; it remains wrapped around Lina and belongs to her
    pretend_food: one softly glowing imaginary red starberry, visibly magical/pretend rather than edible realism
  environment_geometry: cozy shared bedroom, low bed, early-night window visible behind the family
  time_weather_lighting: clear early night, round moon at the window, warm bedside light mixed with cool moonlight

art_direction:
  medium: gouache with bold digital ink
  line: thick, energetic, expressive contour
  palette: tomato red, bright yellow, turquoise, and inky navy
  lighting: flat graphic light with crisp contrast
  shape_language: squash-and-stretch silhouettes and comic exaggeration
  framing: landscape spread, intimate medium-wide family grouping
  viewpoint: child-height, slightly angled toward Lina and Sol
  texture: dry-brush marks with clean color blocks
  detail_density: low to medium

constraints:
  must_show: Lina voluntarily offering exactly one pretend starberry; Sol's giant comic pretend bite; Lina retaining the blanket pocket; Papa laughing supportively
  must_preserve: Lina owns and wears the blanket; Sol does not grab it; the mood is playful and safe
  must_avoid: visible words, letters, captions, watermark, photorealism, moralizing imagery, food realism, extra family members, crying, coercive adult posture
```

## Tweakable fields

For a preset-aligned generation, preserve the canonical preset properties.
Tweak only scene-specific presentation unless the user explicitly requests a
custom successor:

- `framing`: intimate medium-wide landscape;
- `viewpoint`: child-height, angled toward Lina and Sol;
- focal placement and gutter-safe area;
- story-specific emotional emphasis.

If this image establishes the chosen character design, use it as a reference
image for later spreads and restate the character locks in every prompt.
