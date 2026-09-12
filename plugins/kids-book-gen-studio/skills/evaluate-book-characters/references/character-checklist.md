# Character Evaluation Checklist

## Contents

1. Result vocabulary
2. Page checks A-E
3. Whole-book checks F
4. Hard gates
5. Stage applicability
6. Evidence and revision rules

## Result vocabulary

| Result                  | Score | Rule                                                       |
| ----------------------- | ----: | ---------------------------------------------------------- |
| `fail`                  |     0 | Absent, contradictory, or materially unreadable            |
| `partial`               |     1 | Present but ambiguous, weak, or inconsistently sustained   |
| `pass`                  |     2 | Clearly observable and consistent with available authority |
| `not_applicable`        |  null | The check does not apply to this page/stage                |
| `insufficient_evidence` |  null | Available inputs cannot support a responsible judgment     |

Do not compute one aggregate artistic-quality score. Counts may summarize workflow
status, but hard gates and individual failures retain their meaning.

## A - Recognition and continuity

| ID  | Observable test                                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------- |
| A1  | The main character can be identified with text hidden within three seconds.                                           |
| A2  | Face shape, feature placement, skin tone, and distinguishing marks match the approved reference or declared baseline. |
| A3  | Hair color, texture, hairline, length, and established style remain consistent.                                       |
| A4  | Apparent age, body proportions, and relative height remain consistent unless the story explains a change.             |
| A5  | Clothing is consistent within a scene/day, or a change is intentional and preserves identity.                         |
| A6  | The character remains distinguishable from other recurring characters by at least three stable traits.                |
| A7  | Signature accessories, aids, or identifying props remain consistent.                                                  |

Score `partial` for one minor variation that does not threaten identity. Score
`fail` when a reasonable viewer could mistake the character for someone else or
when a locked trait is contradicted.

## B - Expression and acting

| ID  | Observable test                                                                           |
| --- | ----------------------------------------------------------------------------------------- |
| B1  | The intended basic emotional state can be identified from visible face and body evidence. |
| B2  | The visible state agrees with the story event and available EmotionalArc/BookPlan.        |
| B3  | Face, gaze, shoulders, hands, posture, and movement communicate compatible signals.       |
| B4  | Emotional intensity is proportionate to the event and intended tone.                      |
| B5  | The character's current action can be named with one specific verb.                       |
| B6  | A planned emotional change is visibly different from the preceding relevant state.        |

Do not require exaggerated facial acting when a quiet pose, gaze, distance, or
gesture clearly communicates the state.

## C - Picture-only story clarity

Hide page text for C1-C7.

| ID  | Observable test                                                           |
| --- | ------------------------------------------------------------------------- |
| C1  | The focal character or character group is unambiguous.                    |
| C2  | A reviewer can describe the page event in one concrete sentence.          |
| C3  | A character action and its immediate result have a readable relationship. |
| C4  | A character-related problem is visibly evidenced when introduced.         |
| C5  | A consequential character choice is shown rather than only narrated.      |
| C6  | The outcome is visibly different from the earlier state it resolves.      |
| C7  | The order of a montage or multi-action sequence is unambiguous.           |

For formal user testing, use three independent reviewers: `pass` when all three
substantially agree, `partial` when two agree, and `fail` when fewer than two agree.
For a single-reviewer LLM evaluation, record that limitation and confidence.

## D - Supporting-character clarity

| ID  | Observable test                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------- |
| D1  | Each recurring supporting character receives at least one clear front or three-quarter establishing view. |
| D2  | Relationship to the protagonist is recoverable from story or visible interaction.                         |
| D3  | The character differs from others through at least three stable visual traits.                            |
| D4  | The character performs an identifiable narrative or emotional function.                                   |
| D5  | Gaze, gesture, proximity, touch, or action connects the character to the scene.                           |
| D6  | Entrances, continued presence, and absences remain logically consistent.                                  |
| D7  | Narratively important supporting characters are included or intentionally accounted for in the ending.    |

## E - Interaction and staging

| ID  | Observable test                                                                                    |
| --- | -------------------------------------------------------------------------------------------------- |
| E1  | Eyelines lead toward the intended person or object.                                                |
| E2  | Pointing, offering, reaching, speaking, and receiving gestures have visible targets.               |
| E3  | Character positions and distances relative to one another are understandable.                      |
| E4  | Isolation from or inclusion in a group matches the story event.                                    |
| E5  | Foreground placement and visual weight do not accidentally make a minor character the protagonist. |
| E6  | Character scale agrees with distance, furniture, props, and other characters.                      |

If the cause is primarily composition or environment, record that as the likely
source while retaining only the character-readability consequence here.

## F - Whole-book character arc

Evaluate once across the ordered sequence.

| ID  | Observable test                                                                        |
| --- | -------------------------------------------------------------------------------------- |
| F1  | The protagonist's initial behavior or emotional state is visibly demonstrated.         |
| F2  | The consequence or limitation of that initial state is visible.                        |
| F3  | Reflection, questioning, or reconsideration is visibly represented.                    |
| F4  | The protagonist visibly performs a new choice or behavior.                             |
| F5  | Practice, adjustment, or imperfect progress appears when the story calls for learning. |
| F6  | The final state visibly contrasts with the beginning.                                  |
| F7  | The final expression or interaction provides emotional resolution.                     |

## Hard gates

| Gate ID | Failure condition                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------- |
| HG1     | The recurring protagonist cannot be reliably recognized.                                                                  |
| HG2     | A major character changes identity, age, skin tone, facial construction, or hair structure without story support.         |
| HG3     | An essential character action or critical emotional state is unreadable or contradicted.                                  |
| HG4     | A recurring supporting character is plausibly mistaken for another character or has no recoverable role.                  |
| HG5     | Character acting introduces a prohibited safety signal or contradicts an approved non-shaming/non-threatening constraint. |
| HG6     | A central character disappears from the resolution without narrative or plan support.                                     |

Use `human_review` for uncertain identity, representation, or safety concerns.

## Stage applicability

| Stage                      | Checks                                       |
| -------------------------- | -------------------------------------------- |
| Character-design selection | A1-A7; B1-B5 for expression/pose samples; D3 |
| Sample spread              | A1-A7, B1-B6, C1-C5, D1-D5, E1-E6            |
| BookPlan                   | Planned B1-B6, C1-C7, D1-D7, E1-E6, F1-F7    |
| Production page            | A1-A7, B1-B6, C1-C7, D1-D6, E1-E6            |
| Final proof                | A1-A7, B1-B6, C1-C7, D1-D7, E1-E6, F1-F7     |

At planning stages, score whether the plan supplies drawable, observable evidence;
do not claim that ungenerated images pass execution checks.

## Evidence and revision rules

Every scored finding must include:

- check ID and plain-language check;
- page/spread and character;
- observed visible evidence;
- expected evidence when a plan/reference exists;
- result and confidence;
- likely source: `story`, `emotional_plan`, `spread_plan`, `reference`,
  `illustration`, `sequence`, or `uncertain`;
- predicted story effect, phrased as a possibility rather than a child-impact fact;
- bounded revision for `fail` and `partial`;
- details to preserve;
- checks to rerun.

Translate findings using:

```text
failed or partial check
-> visible evidence
-> likely story effect
-> required visual change
-> preserve and prohibit lists
-> observable success test
```

Never instruct an image model only to “raise B2 to 2.” Describe the visible result
that constitutes a pass.
