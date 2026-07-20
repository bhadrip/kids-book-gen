# Book Quality Model

## Purpose

This model defines the qualities the service attempts to create and evaluate. It is a product quality model, not a claim that every successful children's book follows one formula.

## Quality layers

A strong illustrated children's book has four nested layers:

1. **Reader fit:** the intended child can access the experience in the selected reading mode.
2. **Story experience:** character, causality, curiosity, emotion, and resolution work together.
3. **Meaning and visual expression:** the book rewards interpretation beyond literal plot.
4. **Book-object execution:** sequence, typography, illustration continuity, layout, and production are coherent.

Failure in an inner layer cannot always be compensated for by strength in an outer layer. Beautiful art cannot repair an incomprehensible story; simple language cannot repair a protagonist with no agency.

## Seven primary quality dimensions

### 1. Character connection

The reader can understand:

- Who the story follows
- What that character wants
- What makes the situation emotionally important
- What the character fears, misunderstands, or risks
- How the character's choices affect events

Connection does not require demographic similarity. It can arise through recognizable desires, emotional truth, humor, competence, vulnerability, or curiosity.

### 2. Narrative engine

The book has a repeatable mechanism that generates forward movement.

Examples:

- Search and discovery
- Mystery and reveal
- Quest and obstacles
- Repeated attempts with escalation
- Competing viewpoints
- Emotional reframing
- Transformation through responsibility
- Journey through information

A theme such as “friendship” is not a story engine. “Two friends repeatedly choose incompatible ways to rescue the same animal” is.

### 3. Engagement

The book provides reasons to continue and participate:

- Early story promise
- Meaningful reader questions
- Pattern with variation
- Emotional rhythm
- Humor, wonder, suspense, or recognition
- Visual discovery
- Page-turn anticipation
- Satisfying payoff

Engagement should be labeled as predicted until tested with children.

### 4. Comprehension and reader fit

The text and images help the reader construct a coherent mental model:

- Clear referents and speakers
- Recoverable chronology
- Causal connections
- Supported inferences
- Appropriate vocabulary challenge
- Suitable text density
- Reading-mode fit
- Relevant visual support

The system should preserve rich language while controlling simultaneous complexity spikes.

### 5. Meaning

Meaning is optional as an explicit project goal, but every story can have an emotional aftertaste.

When enabled, the value or question should appear through:

- A real dramatic test
- Competing desires or legitimate perspectives
- A consequential choice
- Effects on others
- Recognition or repair
- Space for the reader's own interpretation

Meaning is weakened by narrator lectures, disproportionate punishment, instant transformation, or a resolution with no cost.

### 6. Visual storytelling

The illustrations should:

- Carry narrative information
- Establish world and mood
- Make emotion readable
- Cooperate intentionally with text
- Direct attention through composition
- Vary shot, scale, framing, and density with purpose
- Exploit page turns and sequence
- Preserve character and world continuity

### 7. Book-object quality

The assembled book should have:

- Deliberate front and back matter
- Appropriate trim, bleed, safe area, and resolution
- Readable typography
- Text placement that cooperates with composition
- A coherent cover promise
- Correct page order
- Consistent production metadata
- Accessible digital or print output

## Story promise

Every project should be expressible as a one-sentence promise:

> When **[disruption]** happens, **[protagonist]** must **[goal/action]**, but **[pressure or obstacle]**, leading to **[distinctive experience]**.

Example:

> When the kite she built with her best friend tears, Maya hides the damage and must repair both the kite and their trust before the rooftop launch.

The sentence is not marketing copy. It is a structural test for focus.

## Causal beat graph

```text
context
  -> disruption
  -> desire or goal
  -> attempt
  -> consequence
  -> changed attempt
  -> harder consequence or choice
  -> decisive action
  -> resolution
  -> emotional reaction
```

Every major beat should answer:

1. What does the protagonist currently want?
2. What action do they take?
3. Why does the next event happen because of that action?
4. What changes in knowledge, stakes, relationships, or available options?
5. What reader question remains open?

## Spread model

Each story spread should have an explicit function.

```yaml
spread:
  id: 6
  story_function: escalation
  reader_question: "Are the carrots real, or is Jasper imagining them?"

  character_state:
    before: uneasy
    after: frightened

  event:
    cause: Jasper notices another suspicious shape
    effect: he no longer feels safe at home

  text_job: describe what Jasper believes he sees
  visual_job: reveal an ambiguous carrot-like silhouette
  text_image_relation: counterpoint
  page_turn_hook: reveal_or_false_alarm

  continuity_requirements:
    - character_clothing
    - time_of_day
    - recurring_silhouette
```

If a spread has no unique story, emotional, visual, rhythmic, or informational function, it should be combined, replaced, or removed.

## Text-image relationship taxonomy

| Type | Definition | Typical use |
|---|---|---|
| Symmetric | Both modes communicate essentially the same fact | Clarity, emphasis, early setup |
| Enhancing | Image adds setting, mood, gesture, or detail | Emotional and world depth |
| Complementary | Each mode supplies information needed for full meaning | Inference and visual participation |
| Counterpoint | Image creates tension with the words or character belief | Humor, suspense, unreliable perspective |
| Contradictory | Image deliberately disproves the words | Advanced irony; use sparingly and clearly |

## Per-spread challenge budget

The system should measure challenge across multiple axes instead of enforcing only short words and sentences.

```yaml
spread_challenge:
  unfamiliar_vocabulary: 1
  complex_syntax: 1
  new_background_concept: 0
  unstated_causal_inference: 1
  visual_inference: 1
  chronology_shift: 0
```

Possible overload rule:

> Flag a spread when three or more high-demand axes coincide without contextual, visual, or adult support appropriate to the selected reading mode.

This rule requires validation and should initially be treated as a heuristic.

## Visual rhythm model

Track the full sequence rather than judging only isolated images.

```yaml
visual_rhythm:
  spread_1: establishing_wide
  spread_2: medium_character
  spread_3: detail_discovery
  spread_4: wide_action
  spread_5: repeated_vignettes
  spread_6: close_emotion
  spread_7: quiet_negative_space
  spread_8: dramatic_full_bleed
```

Variation should follow story need. Random variety is not rhythm.

## Meaning model

```yaml
meaning_spec:
  enabled: true
  value_or_question: honesty

  dramatic_test:
    situation: Maya damages a shared kite
    immediate_desire: avoid embarrassment
    competing_value: protect her friend's trust

  protagonist_choice:
    options:
      - continue_hiding_damage
      - admit_what_happened
    real_cost: risk_friend_being_angry

  consequence:
    concealment: repair becomes harder
    honesty: enables cooperation but does not erase hurt

  narrator_explains_moral: false
```

## Quality gates

The following should normally block progression:

- The story promise cannot be stated clearly.
- The protagonist has no meaningful desire, goal, or agency.
- Major beats do not form a recoverable causal chain.
- The ending does not resolve the central story question.
- Essential comprehension depends on missing information.
- A required moral is supplied only through a lecture.
- Images accidentally contradict essential story facts.
- The recurring protagonist is not recognizable across spreads.
- Essential props, time, or location continuity is broken.
- Content safety or representation checks fail.
- Output fails typography, bleed, resolution, or page-order requirements.

## Quality is a profile

The product should present strengths and weaknesses by dimension:

| Area | Example status |
|---|---|
| Structure | Strong |
| Character | Strong |
| Engagement | Middle needs escalation |
| Language | Ready for read-aloud |
| Meaning | Optional; not enabled |
| Visual narrative | Sample approved |
| Continuity | Two local repairs required |
| Production | Not evaluated |

Avoid presenting a single opaque score as proof that a book is good.
