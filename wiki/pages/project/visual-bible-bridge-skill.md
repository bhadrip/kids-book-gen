# Visual Bible bridge skill

The project-local `build-visual-bible` skill fills the production gap between
an approved character-performance plan and scene illustration. It converts the
approved story, EmotionalArc, performance sheet, exact Studio preset, and
selected character reference into a runtime `VisualBible` plus two production
companions: a spread-level continuity ledger and reference-sheet briefs.

The runtime JSON remains compatible with `visualBibleSchema` in
`src/lib/visuals/visual-artifacts.ts`. Detailed prop transitions, environment
geometry, and per-spread state live in the companion documents because the V1
runtime schema does not encode those details directly.

The skill blocks a production-ready handoff when a recurring character lacks an
identity lock, a plot-bearing prop lacks ownership or state, a recurring
location lacks stable geometry, or adjacent spreads contain an unexplained
continuity change. Finished scene generation remains the responsibility of the
`illustrate-preschool-story` skill.

## Related artifacts

- [`build-visual-bible` skill](../../../.agents/skills/build-visual-bible/SKILL.md)
- [Preschool story illustration skill](preschool-story-illustration-skill.md)
- [`VisualBible` catalog entry](../../../spec/09-artifact-catalog.md#visual-workflow)
