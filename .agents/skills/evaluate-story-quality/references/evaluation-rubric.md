# Story-quality text rubric

Version: `story-quality-text-v1`

## Result vocabulary

| Result                  | Export | Meaning                                                         |
| ----------------------- | -----: | --------------------------------------------------------------- |
| `not_evident`           |      0 | Absent, contradictory, or structurally broken                   |
| `weak`                  |      1 | Intended but difficult to recover or inconsistently executed    |
| `functional`            |      2 | Understandable and serviceable, but generic, shallow, or uneven |
| `strong`                |      3 | Sustained and supported throughout the story                    |
| `distinctive`           |      4 | Exceptionally controlled and story-specific                     |
| `not_applicable`        |   null | Dimension does not apply to the declared story                  |
| `insufficient_evidence` |   null | Supplied text cannot support a judgment                         |

Use categories, not decimal scores. `distinctive` is uncommon and requires
multiple pieces of story-specific evidence.

## Dimensions and rules

### Structure

- `STRUCT-PROMISE-01` — A focused disruption, protagonist action/goal, pressure,
  and distinctive experience can be stated from the story.
- `STRUCT-GOAL-01` — The protagonist's desire or goal is understandable and
  emotionally relevant.
- `STRUCT-CAUSE-01` — Major events follow from character choices or established
  forces rather than unexplained convenience.
- `STRUCT-ESCALATION-01` — Attempts change stakes, knowledge, relationships, or
  available options.
- `STRUCT-CHOICE-01` — The protagonist makes a consequential decision and
  meaningfully affects the outcome.
- `STRUCT-RESOLUTION-01` — The outcome follows from earlier setup and action.
- `STRUCT-CLOSURE-01` — The central question and emotional reaction resolve
  without unnecessary explanation or false permanence.

### Predicted engagement

- `ENGAGE-HOOK-01` — Story-specific uncertainty, desire, or pleasure appears
  early.
- `ENGAGE-CONNECTION-01` — Character vulnerability, competence, curiosity,
  humor, or recognizable desire supports connection.
- `ENGAGE-MOMENTUM-01` — Each section gives a reason to continue.
- `ENGAGE-RHYTHM-01` — Tension, relief, warmth, wonder, humor, or surprise vary
  intentionally.
- `ENGAGE-PATTERN-01` — Repetition supports participation and changes in a
  meaningful way.
- `ENGAGE-PARTICIPATION-01` — The story supports prediction, inference,
  remembering, noticing, or opinion without quiz-like interruption.
- `ENGAGE-PAYOFF-01` — The central uncertainty resolves with a supported and
  memorable aftertaste.

### Language and reader fit

- `LANG-MODE-01` — Delivery fits the declared reading mode.
- `LANG-ORAL-01` — For read-aloud and co-read modes, syntax, cadence, dialogue,
  and phrasing are comfortable to speak and hear.
- `LANG-DECODING-01` — For independent modes, decoding load and text density
  match the profile; otherwise use `not_applicable`.
- `LANG-REFERENTS-01` — Speakers, pronouns, chronology, and causal connectors
  are recoverable.
- `LANG-VOCAB-01` — Interesting vocabulary has contextual support without
  flattening voice.
- `LANG-INFERENCE-01` — Required inferences have sufficient textual support for
  the selected profile.
- `LANG-VOICE-01` — Language provides story-specific pleasure rather than only
  transmitting information.

### Meaning

- `MEANING-INTEGRATION-01` — The value or question changes conflict, choice, or
  resolution rather than appearing only in explanation.
- `MEANING-CONSEQUENCE-01` — Actions affect the protagonist or others and lead
  to recognition, response, or repair.
- `MEANING-PERSPECTIVE-01` — Relevant competing feelings or perspectives are
  understandable when the story calls for them.
- `MEANING-ENACTMENT-01` — Constructive behavior is demonstrated rather than
  established only through punishment.
- `MEANING-NONPREACHY-01` — The narrator avoids lectures, slogans, redundant
  explanation, and unsupported permanent transformation.
- `MEANING-DISCUSSION-01` — The story leaves a natural opening for wondering or
  conversation.

### Textual safety

- `SAFE-AGE-01` — Textual danger, fear, violence, humiliation, and imitation
  risk are suitable for the selected reader profile or safely resolved.
- `SAFE-AGENCY-01` — Adult authority is not the sole solution and moral voice
  when a child protagonist could act meaningfully.
- `SAFE-REPRESENTATION-01` — The text does not associate identity groups with
  moral failure or rely on demeaning stereotypes.
- `SAFE-PUNISHMENT-01` — Punishment is not humiliating or disproportionate.
- `SAFE-BOUNDARY-01` — The resolution does not celebrate coercion, abuse,
  self-neglect, or dangerous behavior.

## Hard gates

Fail a gate when its named dimension is `not_evident` or `weak`:

- `GATE-CAUSE` → `STRUCT-CAUSE-01`
- `GATE-ESCALATION` → `STRUCT-ESCALATION-01`
- `GATE-RESOLUTION` → `STRUCT-RESOLUTION-01`
- `GATE-AGENCY` → `STRUCT-CHOICE-01`
- `GATE-COMPREHENSION` → `LANG-REFERENTS-01` and `LANG-INFERENCE-01`

Any textual-safety dimension at `not_evident` or `weak` requires
`human_review`, not an automatic pass. Use `insufficient_evidence` for uncertain
high-risk interpretation and require human review.

## Evidence requirements

For every dimension record:

- one or more exact spread/page/unit locators;
- a concise observation of what the story says or does;
- the applicable rule ID;
- result and confidence;
- predicted reader effect, explicitly labeled as prediction;
- bounded revision and preserve list when revision is advised.
