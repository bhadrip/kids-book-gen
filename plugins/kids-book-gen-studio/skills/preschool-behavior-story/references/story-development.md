# Story development workflow

Use this reference whenever creating a preschool behavior story.

## Stage A — Behavior brief

Produce:

```yaml
lesson:
desired_behavior:
real_world_conflict:
undesired_interpretation:
```

The desired behavior must be observable. Record any coercive, unsafe, or
developmentally inappropriate interpretation that the story must avoid.

## Stage B — Story DNA

Produce:

```yaml
character:
purpose:
personality:
conflict:
emotional_arc:
parent_role:
child_decision:
repeated_phrase:
resolution:
primary_dramatic_question:
climax_spread:
secondary_behaviors:
```

Prefer a concrete purpose such as “I want to help someone grow” over an
abstract moral mission. The purpose must not induce guilt.

The default emotional arc is:

```text
anticipation → conflict → emotional dip → curiosity → small choice → success → celebration
```

The child's choice must cause the behavioral payoff. The parent bridges
conflict and discovery through calm curiosity or support.

Choose one primary dramatic question that can be answered by the protagonist's
decisive action. When the brief contains several desired behaviors, make one the
story's dramatic engine. Each secondary behavior must either increase pressure
before the climax or follow naturally as a consequence of the primary choice;
it must not become a new problem or lesson after the first question resolves.

## Stage C — Spread outline

Default to approximately 12 spreads:

- Spreads 1–3: attachment—character, purpose, personality, recurring phrase.
- Spreads 4–6: conflict—a genuine reaction without immediate resolution.
- Spreads 7–8: reframing through curiosity, discovery, humor, empathy, or play.
- Spreads 9–10: agency—the child makes a small, achievable choice.
- Spread 11: a positive, natural consequence.
- Spread 12: emotional payoff, celebration, and an ordinary-life continuation.

For each spread produce:

```yaml
spread:
function:
emotion:
event:
visual_opportunity:
```

Check that the emotional progression is coherent and that each spread changes
something visible before continuing.

After outlining, write a one-line necessity test for every spread:

```text
Because <prior event>, the protagonist <does/learns/chooses>, which changes
<goal, pressure, relationship, or consequence>.
```

If the sentence cannot be completed from the manuscript's events, combine,
move, or remove the spread. Mark where the primary question is answered. After
that point, allow only consequence, emotional reaction, and closure—not a new
goal that requires its own plan and completion sequence.

## Stage D — Critique and revise

Evaluate the outline:

- Is the lesson shown rather than lectured?
- Does the character have a comprehensible purpose?
- Is the conflict recognizable?
- Does the emotional dip avoid guilt?
- Does the child have agency?
- Does the child's choice cause the resolution?
- Is there one dominant dramatic question from disruption through climax?
- Does every secondary behavior support that question rather than compete with
  it?
- Does any new goal, checklist, or lesson begin after the primary climax?
- Would removing any spread leave the main causal and emotional path intact?
- Does the ending spend enough space on consequence and emotional resolution
  rather than solving a second problem?
- Is the behavior realistic and safe?
- Can every spread be illustrated distinctly?
- Is repetition sufficient but not excessive?
- Is the story enjoyable without its educational objective?

Revise every failed area before drafting prose.

## Stage E — Manuscript

Write the complete read-aloud manuscript only after the outline passes critique.
For each spread retain production metadata:

```yaml
spread:
text:
story_function:
emotion:
visual_action:
character_state:
page_turn:
```

Use page turns to create anticipation, surprise, emotional movement, or a
question the next spread answers.

## Stage F — Production handoff

Return:

```yaml
story_spec:
manuscript:
spread_plan:
character_requirements:
illustration_requirements:
performance_handoff:
open_questions:
```

Describe what illustrations must communicate, but do not choose a rendering
style unless the user asks. Keep character and continuity requirements usable
by later character-design and storyboard stages. In `performance_handoff`,
preserve each spread's character state, visible trigger, decisive action,
immediate reaction, and prohibited emotional signal without prescribing exact
acting; `build-character-performance-plan` owns that translation.

## Pattern example

For a food-waste story, a helper such as a pea might want to help someone grow.
The child initially rejects it; a calm parent invites curiosity; the child
chooses “just one”; the natural resolution respects the child's fullness and
saves remaining food. A phrase such as “Every bite has a job!” can recur.

Use this only as an architectural example. Do not mechanically reproduce its
character, plot, or resolution for other lessons.
