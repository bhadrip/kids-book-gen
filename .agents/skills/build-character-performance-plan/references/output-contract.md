# Character performance output contract

## Runtime EmotionalArc

Use `emotionalArcSchema` in
`src/lib/visuals/visual-narrative-artifacts.ts` as the executable source of
truth. The current artifact requires:

```yaml
schemaVersion: 1
projectId: project identifier
revision: positive integer
sourceStoryRevision: positive integer
generatedAt: ISO 8601 timestamp
model: evaluator or planning model
characters:
  - characterName: canonical story name
    beats:
      - spreadNumber: 1–13
        enteringState: concise state
        trigger: visible event causing or sustaining the state
        outwardExpression: drawable face-and-body evidence
        leavingState: concise state
        intensity: low | medium | high
        avoidSignals: up to six prohibited visual signals
```

Do not add performance fields to `emotional-arc.json`. Store richer acting and
sequence details in the companion sheet.

## Character performance sheet

Begin with project ID, story revision, EmotionalArc revision, linked SpreadMap
revision when present, status, and unresolved decisions.

For each recurring character, define:

- narrative and emotional function;
- neutral/resting body language;
- recognizable gesture habits;
- low-, medium-, and high-intensity expression range;
- gaze and proximity behavior with other characters;
- prohibited performance signals;
- signals that must remain distinct from another recurring character.

Then create one row per relevant character per spread:

| Spread | Character | Entering state | Visible trigger | Face and gaze | Hands and gesture | Posture and movement | Position/interaction | Leaving state | Change from prior appearance | Avoid |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Make every consequential interaction directional. For example, specify “Lina
extends the berry toward Sol; Sol's eyes and open mouth target the berry” rather
than “Lina shares and Sol is happy.”

## Sequence audit

After the table, record:

1. each `trigger → action → reaction` chain;
2. adjacent spreads whose emotional change needs a visible bridge;
3. repeated expressions or poses that must be differentiated;
4. supporting-character entrances, continued presence, and exits;
5. unresolved contradictions with the story, EmotionalArc, or SpreadMap.

End with:

```yaml
status: ready | blocked
blocking_decisions: []
warnings: []
downstream_artifacts_made_stale: []
```
