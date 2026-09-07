# Preschool story illustration skill

The project-local `illustrate-preschool-story` skill converts an approved story,
spread map, book plan, or visual reference into illustration briefs and
generated raster artwork for ages 3–5.

It keeps narrative and continuity facts separate from scene-specific art direction.
The fixed layer includes character identity, prop ownership and state,
environment geometry, emotional intent, and decisive visible action. The
tweakable layer includes framing, viewpoint, focal placement, and emotional
emphasis. Preset properties such as medium, palette, lighting, texture, and
detail density remain fixed unless the user explicitly requests a custom
successor.

When there is no explicit or approved Studio preset, automatic routing is
limited to `bold_funny_v1`, `detailed_discovery_v1`, and `warm_handmade_v1`.
Bold and funny serves comedy and vigorous performance; detailed discovery
serves visual exploration and clue-rich environments; warm and handmade is the
general fallback. One preset applies across the whole book, and its canonical
properties come from `src/lib/visuals/art-presets.ts`.

The skill preserves approved artifacts by creating versioned successors and
records the final brief and prompt beside generated project artwork. Full-book
work must first pass through the
[Character performance planning skill](character-performance-planning-skill.md)
and the
[Visual Bible bridge skill](visual-bible-bridge-skill.md), which establishes the
acting plan, character lock, detailed prop and environment state, and reference
briefs before scene generation.

## Worked example

The first example uses spread 8 of *Lina and the Moon-Pocket Picnic*. It depicts
Lina voluntarily offering one imaginary starberry to Sol while retaining her
blue pocket blanket. The generated image and complete editable prompt are under
`output/illustrations/lina-moon-pocket/`.

## Related artifacts

- [`illustrate-preschool-story` skill](../../../.agents/skills/illustrate-preschool-story/SKILL.md)
- [Book generation stages](book-generation-stages.md)
- [Quality and likeability control](quality-and-likeability-control.md)
