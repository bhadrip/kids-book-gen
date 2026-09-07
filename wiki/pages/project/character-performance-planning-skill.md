# Character performance planning skill

The project-local `build-character-performance-plan` skill bridges approved
story intent and visual production. It creates the implemented runtime
`EmotionalArc` and a companion character performance sheet that makes each
emotion drawable through expression, gaze, hands, posture, movement, distance,
and interaction.

The skill owns acting and emotional sequence, including cause-before-reaction
staging and differentiation between neighboring beats. It does not own
character appearance, wardrobe, props, or environment geometry; those remain
in the VisualBible. It does not evaluate generated artwork; the character and
emotional-arc evaluation skills perform that later gate.

The performance package is now a required input to the VisualBible and
full-book illustration skills. This prevents full production from proceeding
with abstract emotion labels alone.

## Related artifacts

- [`build-character-performance-plan` skill](../../../.agents/skills/build-character-performance-plan/SKILL.md)
- [Visual Bible bridge skill](visual-bible-bridge-skill.md)
- [Preschool story illustration skill](preschool-story-illustration-skill.md)
- [`EmotionalArc` catalog entry](../../../spec/09-artifact-catalog.md#visual-workflow)
