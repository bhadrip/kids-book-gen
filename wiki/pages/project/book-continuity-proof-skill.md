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

For a typical 12–16-spread book, the skill prefers several sequential contact
sheets rather than one image request per spread. It chooses sheet size according
to evaluability and regenerates only unreadable or failing panels. Monochrome
style alone is not treated as a cost reduction; request count is recorded in
the proof manifest and validation report.

The completed proof is handed to the existing emotional-arc and
environment/prop continuity review skills. Their findings can request a bounded
panel reproof or an upstream planning successor, but the proof never triggers
final illustration automatically.

It is also handed to `plan-book-text-placement`. For a 12-spread book, the
normal three sequential four-spread sheets are retained. Exact text is overlaid
digitally on mapped panel crops so placement can be checked economically without
model-rendered typography; only unreadable or ambiguous panels require bounded
reproof.

## Related artifacts

- [`build-book-continuity-proof` skill](../../../.agents/skills/build-book-continuity-proof/SKILL.md)
- [Character performance planning skill](character-performance-planning-skill.md)
- [Visual Bible bridge skill](visual-bible-bridge-skill.md)
- [Preschool story illustration skill](preschool-story-illustration-skill.md)
- [Book text-placement skill](book-text-placement-skill.md)
- [Book generation stages](book-generation-stages.md)
