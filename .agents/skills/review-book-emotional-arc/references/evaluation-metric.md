# Emotional-fidelity evaluation metric

## Result vocabulary

Use one result for each relevant character transition:

- `clear`: The transition is legible in the generated sequence and supported by
  observable performance evidence.
- `could_be_clearer`: The transition is plausible but subtle, compressed,
  generic, or more dependent on inference than the intended image performance.
- `needs_attention`: The transition is absent, contradictory, discontinuous, or
  communicates a prohibited signal.

Do not average results into one opaque emotional-quality score.

## Evaluation checks

1. **State continuity** — The prior leaving state can credibly lead into the next
   entering state.
2. **Trigger visibility** — The event causing the change is present and
   understandable.
3. **Performance evidence** — Expression, pose, gesture, gaze, staging,
   distance, or interaction makes the state observable.
4. **Character coverage** — Main and relevant supporting characters are assessed
   where their responses affect the scene.
5. **Sequence differentiation** — Neighboring states do not collapse into the
   same generic expression, pose, or emotional temperature.
6. **Boundary fidelity** — No approved `avoidSignals` or emotional-safety
   boundary is contradicted.

## Finding requirements

Record:

- page/spread and character;
- exact source revisions when available;
- planned transition;
- concise observed evidence from text and image;
- result;
- confidence and ambiguity;
- likely source: story, emotional plan, spread plan, illustration, or sequence;
- bounded suggestion;
- details to preserve.

Prefer `could_be_clearer` when a reasonable reader could perceive the intended
transition but the image does not distinguish it reliably. Reserve
`needs_attention` for missing, contradictory, unsafe, or clearly discontinuous
performance.
