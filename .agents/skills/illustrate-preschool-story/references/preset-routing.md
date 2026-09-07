# Studio preset routing

Choose one exact Studio preset for an illustration or full book. The canonical
definitions live in `src/lib/visuals/art-presets.ts`; read that file at runtime
and copy the selected preset's medium, line, palette, lighting, shape language,
texture, detail level, and avoid list into the illustration brief and prompt.

## Precedence

1. Use the preset explicitly requested by the user.
2. Otherwise use the `presetId` from the current approved Visual Bible or other
   authoritative project artifact.
3. Otherwise apply the default routing below.

Never replace an explicit or approved preset through automatic routing.

## Default routing

Select exactly one of these three:

### `bold_funny_v1`

Use when the book's dominant visual promise is comedy, vigorous movement,
exaggerated reactions, playful chaos, or a high-energy read-aloud performance.
Do not select it from one isolated joke when the overall book is gentle or
observational.

### `detailed_discovery_v1`

Use when the book depends on exploring a layered environment, finding clues,
noticing small objects, revisiting scenes, following paths, or rewarding visual
search. Do not use merely because a scene contains many objects.

### `warm_handmade_v1`

Use for gentle family life, everyday routines, reassurance, kindness, quiet
imaginative play, or when neither specialized route clearly dominates. This is
the fallback preset.

## Whole-book decision

Choose from the whole story's dominant experience, not just the requested
spread. Use the same preset across character designs, sample spread, cover, and
all production spreads unless the user approves a successor visual direction.

If two routes are equally plausible, choose `warm_handmade_v1` and record the
competing evidence in `routing_reason`. Do not create a hybrid.

## Prompt requirement

The preset ID alone is insufficient. Include all canonical properties from
`src/lib/visuals/art-presets.ts` in the production prompt so image generation
receives the actual art direction. Preserve story-specific framing and mood,
but do not mutate the preset's medium, line, palette, lighting, shape language,
texture, detail level, or avoid list unless the user explicitly requests a
custom successor.
