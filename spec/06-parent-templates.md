# Parent-Friendly Starting Templates

## Purpose

Templates help a parent turn an original idea into a workable story without requiring story-writing vocabulary. They should provide a story engine, not force a theme, setting, moral, or visual style.

Every template remains editable and produces the same downstream artifacts used by a custom project.

## Parent intake shared by all templates

Ask only what materially changes the story:

1. What is the original idea or moment you want to build from?
2. Who should the story follow?
3. What does that character care about right now?
4. What kind of experience should this feel like?
5. Should the story explore a value or question? Optional.
6. Is there anything the story or pictures should avoid?

Configuration such as age, reading mode, length, and style can use defaults with visible editing controls.

## Template contract

```yaml
template:
  id: mystery_and_reveal
  version: 1
  parent_label: Something strange is happening

  required_inputs:
    - protagonist
    - ordinary_world
    - strange_sign

  optional_inputs:
    - explanation_preference
    - meaning_theme

  story_engine:
    - notice_clue
    - form_belief
    - investigate
    - encounter_stronger_clue
    - make_risky_choice
    - reveal
    - emotional_reaction

  required_evaluators:
    - causal_structure
    - suspense
    - clue_fairness

  visual_affordances:
    - background_clues
    - ambiguous_shapes
    - reveal_page_turn
```

## Template 1: Something strange is happening

Best for mystery, suspense, playful fear, or surprising reveals.

Parent prompt:

> What ordinary place begins to feel strange, and what is the first clue?

Engine:

1. Establish a safe or familiar routine.
2. Introduce an ambiguous sign.
3. Protagonist forms a belief or question.
4. Investigation produces escalating clues.
5. A risky choice forces a reveal.
6. Reveal changes the meaning of earlier clues.
7. End with relief, humor, wonder, or a small remaining mystery.

Evaluator emphasis:

- Clues are visible but not obvious.
- Escalation changes the protagonist's belief.
- Reveal is surprising and retrospectively fair.
- Fear intensity matches the reader profile.

Benchmark pattern: *Creepy Carrots!*

## Template 2: A mission with obstacles

Best for quest, rescue, adventure, or portal stories.

Parent prompt:

> What must the character reach, find, deliver, or rescue—and why does it matter today?

Engine:

1. Mission becomes urgent.
2. Protagonist commits.
3. First obstacle tests an obvious strength.
4. Second obstacle makes the first strategy insufficient.
5. Relationship, knowledge, or resource changes.
6. Final obstacle requires a meaningful choice.
7. Return or arrival reveals how the character has changed.

Evaluator emphasis:

- Obstacles are causally different, not cosmetic replacements.
- Protagonist drives the solution.
- Each attempt changes available options.
- Return or arrival supplies emotional closure.

Benchmark patterns: *Magic Tree House*, *The Wild Robot*

## Template 3: Try, fail, change the plan

Best for invention, problem-solving, comedy, persistence, or responsibility.

Parent prompt:

> What is the character determined to make work, and what do they misunderstand at first?

Engine:

1. Character wants a concrete result.
2. First attempt follows their initial belief.
3. Failure produces information, not just frustration.
4. Repeated attempts vary and escalate.
5. Consequences affect another character or larger goal.
6. Character changes the underlying strategy.
7. Result is useful, surprising, or imperfectly successful.

Evaluator emphasis:

- Repetition includes variation.
- Failures yield clues.
- Final solution uses earlier information.
- Persistence is not confused with repeating an unsafe or ineffective action forever.

## Template 4: Two sides of the same problem

Best for friendship conflict, ensemble comedy, fairness, family situations, or competing viewpoints.

Parent prompt:

> Which two characters want different things from the same situation?

Engine:

1. Shared situation or object is introduced.
2. Character A's interpretation appears.
3. Character B's different interpretation appears.
4. Attempts to solve the issue separately make it harder.
5. Each character discovers information about the other.
6. They choose cooperation, compromise, boundary, or respectful disagreement.
7. End shows what changed and what remains different.

Evaluator emphasis:

- Both perspectives are understandable.
- One character is not reduced to an obviously bad obstacle.
- Resolution is earned and proportionate.
- Visual framing can distinguish viewpoints.

Benchmark pattern: *The Day the Crayons Quit*

## Template 5: A feeling changes shape

Best for belonging, shame, grief, change, courage, family memory, or emotional reframing.

Parent prompt:

> What is the character trying not to feel or remember, and what makes avoidance impossible?

Engine:

1. Character encounters an emotionally charged situation.
2. They resist, hide, minimize, or misunderstand the feeling.
3. Sensory details or another character reveal context.
4. Present event connects with memory or identity.
5. Character makes a small but meaningful choice.
6. Relationship or self-understanding shifts.
7. End with an image or action rather than a full explanation.

Evaluator emphasis:

- Emotion is dramatized through action, image, and sensory detail.
- Change is credible rather than instant.
- Adults do not explain away the child's experience.
- Cultural and family details are specific and respectful.

Benchmark pattern: *Watercress*

## Template 6: Discover a real world

Best for science, nature, place, history, or curiosity-led nonfiction.

Parent prompt:

> What real place, system, creature, or question should the reader explore through a journey?

Engine:

1. Begin with an observable question.
2. Character or narrator enters a real environment.
3. Each stage reveals a connected fact.
4. Visual scale or perspective changes understanding.
5. Earlier facts combine to answer a larger question.
6. End connects knowledge to wonder, agency, or stewardship without forcing a lesson.

Required conditional agents:

- Fact research
- Source attribution
- Educational accuracy
- Diagram or caption review

Evaluator emphasis:

- Facts form a coherent journey rather than a list.
- Illustrations distinguish literal representation from imaginative visualization.
- Scale, chronology, and causality are accurate.
- Uncertainty and scientific limits are represented honestly.

Benchmark pattern: *Grand Canyon*

## Template 7: Almost wordless visual journey

Best for discovery, migration, transformation, dream journeys, or visual inference.

Parent prompt:

> What change should the reader understand mainly by watching the pictures?

Engine:

1. Establish visual routine and world.
2. Introduce disruption through an observable change.
3. Character moves through increasingly unfamiliar spaces.
4. Recurring objects or motifs help orientation.
5. A choice or relationship changes the journey.
6. Final visual echo transforms the opening image.

Evaluator emphasis:

- Sequence is readable without explanatory captions.
- Character goal and emotion remain inferable.
- Spatial and temporal transitions are coherent.
- Visual motifs carry meaning.

Benchmark pattern: *The Arrival*

## Choosing a template

The Direction Agent can recommend templates based on the parent's idea, but should offer genuinely different engines.

Example:

```yaml
parent_idea: "My daughter imagined a moon that lost its light."

directions:
  - template: mission_with_obstacles
    promise: "A child travels through the night sky to return the moon's missing light."

  - template: try_fail_change_plan
    promise: "The moon tries increasingly ridiculous ways to glow before discovering what it actually needs."

  - template: feeling_changes_shape
    promise: "A dim moon hides from the stars until a child recognizes why it no longer wants to be seen."
```

These are different story mechanisms, not merely different names or settings.

## Extending a template

Parents may:

- Combine compatible engines
- Replace protagonist, setting, conflict, or ending direction
- Enable or disable meaning
- Add an educational accuracy stage
- Change reading mode and format
- Request a custom story engine

The Scope Agent should flag combinations that exceed the selected page budget.

## MVP recommendation

Launch with five visible choices plus “Help me choose” and “Start from scratch”:

1. Something strange is happening
2. A mission with obstacles
3. Try, fail, change the plan
4. Two sides of the same problem
5. A feeling changes shape
6. Help me choose
7. Start from scratch

Keep nonfiction discovery and almost-wordless journeys available as internal or later templates until their specialized evaluation flows are implemented.

## Template validation

For each template:

1. Generate at least five structurally different prototype books.
2. Check whether outputs converge into repetitive plots.
3. Confirm the template supports multiple cultures and settings without default stereotypes.
4. Compare expert ratings against custom-start projects.
5. Test whether parents understand the label and can predict the experience.
6. Retire or rewrite templates that mainly produce cosmetic variation.
