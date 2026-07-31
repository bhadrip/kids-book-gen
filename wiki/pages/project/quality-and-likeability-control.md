# Quality and likeability control

## Two separate control problems

**Quality control** checks whether the book meets explicit reader-fit, story,
visual, safety, and production requirements.

**Likeability control** predicts likely appeal and then learns from observed
child response. It cannot guarantee that a particular child will love a book.

The canonical detailed rubric remains
[`spec/03-evaluation-rubric.md`](../../../spec/03-evaluation-rubric.md).

## Control stack

### 1. Configuration controls

- Reader profile, reading mode, language, interests, sensitivities, and
  cultural/family constraints.
- Purpose-specific realism policy.
- Parent “must keep,” “must avoid,” and approved artifact locks.
- Format, page budget, cost budget, and maximum automatic revisions.

### 2. Deterministic hard gates

- Correct schema and artifact lineage.
- Complete physical page count and order.
- No text overflow; required trim, bleed, safe margins, and resolution.
- No missing/duplicated spreads or accidental rasterized text in art.
- Factual claims verified when applicable.
- Parent locks preserved and stale dependencies identified.

### 3. Evidence-based evaluators

Evaluate independently rather than collapsing everything into one score:

- safety and representation;
- causal structure and protagonist agency;
- engagement prediction;
- language/listening fit and comprehension load;
- meaning and non-preachiness;
- visual storytelling and text-image relation;
- character, object, world, and knowledge-state continuity;
- typography, layout, and production fitness.

Every finding must cite spread-level evidence, confidence, a bounded repair,
what to preserve, and which evaluator must rerun.

### 4. Human expert/parent gates

Use human judgment at intent, story, visual identity, sample spread, and final
proof checkpoints. Escalate uncertain safety, cultural, disability, medical,
historical, or identity issues rather than inventing confidence.

### 5. Child-observation calibration

During a natural reading, record low-burden observations:

- active engagement: attends, joins in, visibly reacts;
- interactive engagement: predicts, asks, answers, notices, connects;
- confusion: asks for clarification or gives an incompatible retell;
- disengagement: repeatedly shifts away without re-engaging;
- delight: laughter, surprise, affection, imitation, or requested repetition;
- after reading: favorite part, protagonist's desire, confusing part, and
  willingness to hear it or the character again.

Do not interpret quiet attention as dislike. Do not require every child to talk.
The strongest single practical likeability signal is voluntary reread or
more-story intent, but it remains child- and context-specific.

## Recommended decision model

Use a profile, not a single “quality score”:

| Layer                | Blocking rule                                    | Evidence                              |
| -------------------- | ------------------------------------------------ | ------------------------------------- |
| Safety and integrity | Any hard-gate failure blocks                     | Rules plus human escalation           |
| Reader comprehension | Critical action/causality must be recoverable    | Spread evidence and read-aloud review |
| Story experience     | Goal, escalation, agency, and payoff meet floors | Structural rubric                     |
| Visual narrative     | Identity and essential action remain readable    | Sequence and continuity review        |
| Production           | All preflight checks pass                        | Deterministic report                  |
| Predicted appeal     | No blocker; weaknesses drive experiments         | Engagement rubric                     |
| Observed appeal      | Never treated as a universal guarantee           | Parent-child field observations       |

## Likeability experiment loop

1. Form a specific hypothesis, such as “the second attempt repeats without a
   new surprise.”
2. Make one bounded variant while preserving approved story intent.
3. Blind-review both variants against the same rubric.
4. Test naturally with the intended child when practical.
5. Compare observable behaviors and reread intent, not only adult preference.
6. Keep the winner for that reader; do not universalize a single-child result.
7. Aggregate only consented, privacy-minimized data for evaluator calibration.

## Anti-patterns

- Declaring a book good because an LLM gave it a high scalar score.
- Optimizing only sentence length or readability.
- Equating bright colors, rhyme, anthropomorphic animals, or humor with
  universal preschool appeal.
- Adding unrelated visual detail merely to increase stimulation.
- Treating parent taste as child response, or child response as market proof.
- Teaching a factual animal concept through fully anthropomorphic language and
  imagery without an explicit bridge back to reality.
- Revising the whole book when one spread has a local continuity fault.
