# Book continuity proof skill

The project-local `build-book-continuity-proof` skill creates an economical,
black-and-white visual rehearsal of a complete children's book before final
illustration. It is used after the approved character performance plan and
production-ready Visual Bible, and before expensive finished scene art.

The proof emphasizes observable continuity evidence: character identity and
scale, expression and pose, cause-before-reaction staging, environment geometry
and landmarks, and each important prop's identity, holder, location, and state.
It deliberately omits color, texture, typography, decorative finish, and other
details that do not help continuity evaluation.

Before generation, the skill routes each spread independently to `full_scene`,
`layered`, or `hybrid` production. Full-scene generation is preferred for
integrated hands, contact, water, foam, fabric, lighting, and strong occlusion.
Layered composition reuses approved backgrounds, poses, and props only when
anchors, alpha, scale, interaction, and lighting remain credible. Hybrid
composition keeps stable layers but generates a contacting or occluded action
cluster together. The manifest records every route, asset, hash, reuse, and
fallback.

For a typical 12–16-spread book, the image model may still produce several
sequential source sheets so faces, actions, and props stay readable. Those are
generation intermediates. The skill deterministically assembles accepted panels
into exactly one parent-facing master contact sheet, in reading order, with a
visible `SPREAD <number>` label above every drawing and the exact approved
spread text below it. The below-panel copy is deterministic review metadata,
not final-book text placement. The manifest records drawing and caption bounds
separately. The skill regenerates only unreadable or failing panels and then
rebuilds the master without replacing passing siblings. Request count and
source provenance remain recorded.

A bundled standard-library assembler creates the captioned master as a portable
SVG plus deterministic mapping JSON. It reads exact text from the approved
story, accepts PNG panels and crops, records source hashes and separate
drawing/caption bounds, and leaves human approval false. Raster conversion is a
separate deterministic rendering step when required.

The completed proof is handed to the existing emotional-arc and
environment/prop continuity review skills. Their findings can request a bounded
panel reproof or an upstream planning successor, but the proof never triggers
final illustration automatically.

It is also handed to `plan-book-text-placement`. That skill crops only the
recorded drawing area, excluding the review caption, and creates new candidate
overlays. This keeps human-review context separate from final-book placement;
only unreadable or ambiguous panels require bounded reproof.

## Related artifacts

- [`build-book-continuity-proof` skill](../../../.agents/skills/build-book-continuity-proof/SKILL.md)
- [Character performance planning skill](character-performance-planning-skill.md)
- [Visual Bible bridge skill](visual-bible-bridge-skill.md)
- [Preschool story illustration skill](preschool-story-illustration-skill.md)
- [Book text-placement skill](book-text-placement-skill.md)
- [Book generation stages](book-generation-stages.md)
