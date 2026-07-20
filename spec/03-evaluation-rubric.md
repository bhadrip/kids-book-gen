# Evaluation Rubric

## Evaluation philosophy

Evaluators are diagnostic agents. They do not decide whether a child will love a book, and they do not silently rewrite approved material.

Every evaluation must include:

- Artifact and version evaluated
- Reader and format configuration
- Independent dimension scores
- Confidence per score
- Page or spread evidence
- Hard-gate results
- What should be preserved
- Bounded revision instructions
- Which evaluators must rerun

## Common score anchors

All scored dimensions use a 0–4 scale:

| Score | Anchor |
|---:|---|
| 0 | Absent, contradictory, or structurally broken |
| 1 | Intended in notes but weak or not readable in the artifact |
| 2 | Functional but generic, shallow, or inconsistent |
| 3 | Strong, sustained, and supported by page-level evidence |
| 4 | Distinctive, exceptionally controlled, and benchmark-level |

Scores may use decimals. Evaluators must not produce false precision: a `2.7` requires stronger evidence than merely preferring it to a `2.6`.

## Standard evaluation output

```yaml
evaluation:
  evaluator: engagement_v1
  artifact:
    type: manuscript
    version: 5

  configuration:
    age_range: [7, 10]
    reading_mode: parent_read_aloud
    story_spreads: 13

  scores:
    character_connection:
      value: 3.2
      confidence: high
    curiosity_and_momentum:
      value: 2.1
      confidence: medium

  hard_gates:
    central_reader_question:
      pass: true
    satisfying_payoff:
      pass: false

  evidence:
    - spread: 10
      observation: "An adult finds the lost kite without using Maya's earlier clue."

  predicted_reader_effect:
    - "The ending may feel convenient rather than earned."

  revision:
    priority: high
    assigned_agent: causal_beat_agent
    instruction: "Let Maya apply the clue introduced on spread 7."
    preserve:
      - rooftop_reveal
      - friend's_emotional_reaction

  rerun:
    - structural_evaluator
    - engagement_evaluator
```

## 1. Structural evaluator

| Dimension | Suggested weight | Evidence sought |
|---|---:|---|
| Story promise | 10 | Focused disruption, protagonist, goal, and pressure |
| Protagonist goal | 10 | Goal is understandable and emotionally relevant |
| Causal coherence | 20 | Major events follow from choices or established forces |
| Escalation | 15 | Attempts change stakes, knowledge, relationships, or options |
| Meaningful choice | 15 | Protagonist faces a consequential decision |
| Earned resolution | 20 | Outcome follows from earlier setup and protagonist action |
| Closure | 10 | Emotional reaction and central question are resolved without over-explanation |

Hard floors:

- Causal coherence ≥ 2.5
- Escalation ≥ 2.5
- Earned resolution ≥ 2.5
- Protagonist has a meaningful effect on the outcome

## 2. Engagement evaluator

This is a predicted-engagement scorecard.

| Dimension | Weight | Evidence sought |
|---|---:|---|
| Story promise and hook | 10 | Story-specific uncertainty or desire appears early |
| Character connection | 15 | Recognizable desire, vulnerability, competence, or humor |
| Curiosity and momentum | 15 | Clear reasons to continue across the sequence |
| Causal escalation | 10 | Each attempt changes the situation |
| Emotional rhythm and delight | 15 | Tension, relief, humor, warmth, wonder, or surprise vary intentionally |
| Pattern and surprise | 10 | Repetition supports participation while variation avoids monotony |
| Child agency | 10 | Child or child-like protagonist makes consequential choices |
| Participation opportunities | 5 | Predict, infer, notice, remember, or form an opinion without quiz-like prompts |
| Payoff and aftertaste | 10 | Central question resolves and leaves a memorable feeling or idea |

Hard floors:

- Character connection ≥ 2.5
- Curiosity and momentum ≥ 2.5
- Causal escalation ≥ 2.5
- Payoff ≥ 2.5
- No dimension equals 0

## 3. Language and reader-fit evaluator

Weights vary by reading mode. Decoding load is lower priority for adult read-aloud and central for independent reading.

| Dimension | Read-aloud emphasis | Independent emphasis |
|---|---:|---:|
| Delivery-mode fit | High | High |
| Decoding demand | Low | High |
| Vocabulary support | High | High |
| Syntax and oral flow | High | Medium |
| Referential clarity | High | High |
| Causal cohesion | High | High |
| Inference load | High | High |
| Knowledge and cultural load | Medium | Medium |
| Text-image cooperation | High | High |
| Voice and pleasure | High | High |

Diagnostic rules:

- Readability formulas are supporting signals, not pass/fail authorities.
- Flag unclear pronouns, unexplained chronology shifts, and unsupported causal jumps.
- Flag simultaneous complexity spikes by spread.
- Preserve voice, imagery, and interesting vocabulary when simplifying.
- Require a read-aloud pass for the MVP.

## 4. Meaning evaluator

Run only when `meaning.enabled` is true, or as a low-stakes theme observation when requested.

| Dimension | Weight | Evidence sought |
|---|---:|---|
| Plot-value integration | 20 | Value changes conflict, choice, and resolution |
| Meaningful choice | 15 | Choice has real pressure or cost |
| Consequence and repair | 15 | Actions affect others and require a response |
| Perspective complexity | 15 | Multiple characters' feelings or reasoning are understandable |
| Emotional credibility | 10 | Emotional response and change are earned |
| Positive enactment | 10 | Desired value is demonstrated, not only enforced through punishment |
| Non-preachiness | 10 | Narrator avoids lectures, slogans, and redundant explanation |
| Discussion potential | 5 | Story leaves room for wondering and interpretation |

Hard gates:

- Protagonist retains agency.
- Adult authority is not the sole solution and moral voice.
- No identity group is associated with moral failure.
- Punishment is not humiliating or disproportionate.
- Resolution does not claim instant permanent transformation.

Do not convert this score into a claim about behavioral impact.

## 5. Visual evaluator

| Dimension | Weight | Evidence sought |
|---|---:|---|
| Visual story contribution | 15 | Art adds action, mood, setting, or inference |
| Text-image relationship | 15 | Relationship is intentional and comprehensible |
| Character identity consistency | 15 | Face, body, clothing, and signature traits remain recognizable |
| World and prop continuity | 10 | Objects, locations, time, light, and weather follow story logic |
| Emotional readability | 10 | Expression, pose, gesture, and staging communicate state |
| Composition and hierarchy | 10 | Attention reaches the important action |
| Sequence and page-turn rhythm | 10 | Framing, density, transitions, and reveals vary with purpose |
| Art-direction consistency | 5 | Palette, line, texture, lighting, and medium cohere |
| Representation integrity | 5 | Depictions are specific, respectful, and non-stereotyped |
| Production fitness | 5 | Aspect, resolution, bleed, safe area, and artifact checks pass |

Hard gates:

- Recurring protagonist is recognizable.
- Essential action is readable.
- No accidental contradiction of a critical plot fact.
- Safety and representation pass.
- Required resolution and production properties pass.

## 6. Continuity evaluator

Continuity should be checked as a graph of facts, not vague visual similarity.

```yaml
continuity_fact:
  entity: red_kite
  property: condition
  timeline:
    spread_3: intact
    spread_5: torn_lower_corner
    spread_9: patched_lower_corner
```

Continuity categories:

- Character identity
- Relative height and proportions
- Clothing and accessories
- Held and transferred objects
- Damage and repair states
- Location geometry
- Direction of movement
- Time, weather, and lighting
- Knowledge state: who has seen or learned what
- Text-image agreement

## 7. Safety and representation evaluator

This evaluator requires separate policy development and should combine deterministic checks, expert-authored rules, and human escalation.

At minimum evaluate:

- Age-inappropriate violence, sexual content, or frightening intensity
- Self-harm, dangerous imitation, or unsafe instructions
- Bullying, humiliation, or abuse treated as harmless humor
- Stereotypes and tokenization
- Disability and mental-health framing
- Cultural and religious specificity
- Family structure and identity respect
- Historical or educational factual accuracy when applicable
- Parent-specified boundaries

Uncertain high-risk cases should escalate rather than receive an invented confidence score.

## 8. Production evaluator

Hard checks:

- Correct physical page count and order
- Required front and back matter
- Correct trim and bleed
- Safe text margins
- Sufficient image resolution for target output
- Embedded or available fonts and licenses
- No rasterized accidental text inside illustration
- No missing or duplicated spreads
- Cover, spine, and barcode zones appropriate to provider
- Accessible screen edition when enabled

## Cross-evaluator orchestration

Prioritize revisions in this order:

1. Safety and production blockers
2. Structural hard-gate failures
3. Reader-comprehension failures
4. Visual continuity failures
5. Engagement and meaning weaknesses
6. Polish and differentiation

Revision Director rules:

- Change one mechanism or bounded cluster at a time.
- Preserve parent-approved intent and named strengths.
- Rerun affected evaluators first.
- Run a holistic regression evaluation before parent approval.
- Stop automatic loops after the configured maximum.

## Parent-child field evaluation

The MVP should support optional, lightweight parent input rather than audio or video surveillance.

During reading, parents may mark:

- Wanted to know what happened next
- Commented, predicted, or noticed something
- Laughed or showed another clear reaction
- Seemed confused
- Lost interest

After reading:

1. What was your favorite part?
2. What did the main character really want?
3. Was anything confusing?
4. Would you want to hear it again or another story about this character?

Store active attention, interactive participation, comprehension, and reread intent separately.

## Calibration plan

Before treating rubric thresholds as reliable:

1. Have multiple human raters score the balanced benchmark corpus.
2. Measure inter-rater agreement and clarify ambiguous anchors.
3. Ask evaluators for evidence without revealing benchmark reputations.
4. Compare model scores with expert scores.
5. Run parent-child tests on prototype books.
6. Compare predicted engagement with observed signals.
7. Reweight or remove dimensions that do not help distinguish actionable quality.

The goal is evaluator usefulness and revision quality, not maximizing correlation with a single subjective overall rating.
