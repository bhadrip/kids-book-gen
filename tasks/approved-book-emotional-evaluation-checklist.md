# Discovery checklist: Evaluate generated pages for emotional fidelity

## Status

Proposal for product discovery. This checklist does not authorize implementation,
make the evaluation an approval gate, or decide who can see the results.

## Question to answer

Should the product offer an optional evaluation that compares the emotional
journey planned for each character with the emotional performance visible in the
exact generated page set before final book approval?

The evaluation is diagnostic. It may suggest a localized revision, but it must
not silently rewrite text, regenerate art, invalidate an approval, or claim that
one subjective reading is definitive.

## Existing evidence available

- `EmotionalArc` records entering state, trigger, outward expression, leaving
  state, intensity, and avoid signals for each visually relevant character.
- `SpreadMap` records emotional movement, main action, illustration intent,
  must-show details, must-avoid details, and page-turn intent for every story
  spread.
- `BookPlan` carries approved emotional movement and continuity facts into page
  production.
- `BookPage` and `BookProof` identify the exact generated pages and proof being
  reviewed.

The missing capability is a post-generation comparison of the approved plan
with observable evidence in the generated pages. Planning artifacts can be
internally consistent while the image model under-expresses, exaggerates, or
omits the planned performance. That discrepancy cannot be evaluated reliably
before the page image exists.

## Proposed journey placement

Run the primary evaluation after all story-page images have been generated and
before `BookDecision` approves the complete page set:

```text
Approved EmotionalArc and SpreadMap
→ approved BookPlan
→ generated BookPages
→ emotional-fidelity evaluation
→ optional localized page revision
→ parent reviews and approves the complete page set
→ BookProof
```

This is a review of generated output, not another planning-stage evaluation.
Earlier stages may validate whether the intended arc is coherent and visually
expressible, but only this point can compare that intent with the finished
illustrations. An already approved proof may be evaluated as an audit or pilot
learning exercise, but that is a secondary use case.

## Worked example: Milo in _The Last Little Bite_

Source project: `745b83c0-60df-41c0-9305-7c2314a9aa1a`. The example compares
the project's revision 1 `EmotionalArc` and `SpreadMap` with its generated story
pages and the exact reviewed
[generated proof](examples/milo-the-last-little-bite-proof.pdf). The committed
proof's SHA-256 checksum is
`2bf270731276a9676a9cd81954d09708c3266d5f3e3cfe46737c7c99383c2ff2`.

The planning artifacts describe a coherent, safe progression for Milo:

```text
comfortable routine
→ gentle awareness
→ reflection
→ appreciation
→ readiness
→ confidence
→ experimentation
→ practical care
→ patient learning
→ peaceful confidence
```

They also consistently prohibit shame, coercion, forced eating, adult
surveillance, and moralized clean-plate praise. The post-generation review is
needed because several intended transitions are less legible in the finished
book than in that plan.

| Spread | Planned evidence                                                                                                                           | Observed generated-page evidence                                                                                                                          | Example result     | Bounded suggestion                                                                                                                |
| -----: | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
|    1–2 | Milo moves from comfortable habit toward a first hint of awareness by visibly noticing the remaining bites.                                | Milo appears comfortable at the meal; the next page emphasizes the isolated plate, but his change in awareness is subtle.                                 | `could_be_clearer` | Preserve the warm, nonjudgmental meal and make Milo's backward glance or pause more readable.                                     |
|    4–5 | Reflection about the food's journey becomes appreciation, shown through attentive focus, gentle hands, and a warm appreciative expression. | The journey is visualized clearly and Milo remains positive, but the internal reflective beat resolves quickly into readiness.                            | `could_be_clearer` | Preserve the food-journey panorama and give Milo one quieter expression or gesture of recognition before the solution beat.       |
|      6 | Readiness becomes self-directed confidence without a triumphant or moralizing pose.                                                        | Milo raises a finger enthusiastically while his family watches; his agency is clear, though the performance reads more triumphant than the plan requests. | `could_be_clearer` | Keep Milo as the source of the idea while softening the pose into pleased, thoughtful confidence.                                 |
|      9 | Milo moves from comfortably full to relieved while collaborating with family to save the remaining bites.                                  | Collaboration and family warmth are visible, but relief is not distinct from the cheerful expressions used on adjacent pages.                             | `could_be_clearer` | Preserve the cooperative storage action and show a small release of tension, such as relaxed shoulders when the container closes. |
|     11 | Imperfect portions lead to patient persistence and self-compassion rather than failure.                                                    | The montage shows surprise, uncertainty, and success, but the text summarizes learning and the patient emotional bridge is mostly inferred.               | `could_be_clearer` | Preserve the varied attempts and add a calm trying-again expression or other visual link between uncertainty and confidence.      |
|     13 | Competence resolves into peaceful confidence and family connection without treating the clean plate as obedience.                          | Milo is relaxed and connected with his family; the empty plate is contextualized by the text rather than celebrated with applause.                        | `clear`            | Preserve this ending if earlier pages are revised.                                                                                |

This example does not show that the upstream artifacts failed. It shows why an
evaluator must compare those artifacts with the generated sequence: a prompt can
contain the correct emotional direction while the final image communicates it
only partially. It also demonstrates why results should cite observable evidence
and recommend localized changes instead of assigning one opaque score.

## Product-decision checklist

Resolve these questions before implementation.

### Purpose and audience

- [ ] Name the primary user: developer, studio operator, parent, or more than one
      role with different levels of detail.
- [ ] Decide whether the evaluation is a private production diagnostic, an
      optional creator tool, or part of the normal parent journey.
- [ ] Validate parent-facing language separately from internal evaluator terms.
      Candidate parent label: **Check emotional journey**.
- [ ] Decide whether results are advisory only or can block proof approval or
      export. Default proposal: advisory only.
- [ ] State what successful use looks like: finding actionable emotional
      discontinuities without encouraging unnecessary regeneration.

### Trigger, timing, and cost

- [ ] Decide whether evaluation is manual, automatic, or both. Default proposal:
      one manual action after the complete page set is generated.
- [ ] Use the complete generated, not-yet-approved page set as the primary input;
      decide separately whether approved proofs may be evaluated for audit or
      pilot learning.
- [ ] Show the estimated model cost before a manual provider call.
- [ ] Prevent duplicate calls while an evaluation is running.
- [ ] Define retry behavior that preserves the current generated pages, existing
      decisions, and last safe artifacts.
- [ ] Decide whether unchanged inputs may reuse a prior result.

### Exact evaluation inputs

- [ ] Identify the exact `EmotionalArc` revision.
- [ ] Identify the exact `SpreadMap` revision.
- [ ] Identify the exact `BookPlan` revision.
- [ ] Identify every evaluated `BookPage` ID and revision.
- [ ] Identify the exact `BookProof` revision when proof-level layout or sequence
      is part of the evidence.
- [ ] Include the reader profile, format, and relevant project boundaries.
- [ ] Reject or clearly label an evaluation when any required input is stale,
      incomplete, or from a different revision chain.

### Evaluation coverage

- [ ] Review every visually relevant character named in `EmotionalArc`, including
      supporting characters when their response affects the scene.
- [ ] Compare each planned entering state, trigger, outward expression, and
      leaving state with observable page evidence.
- [ ] Check continuity between a spread's leaving state and the next applicable
      spread's entering state.
- [ ] Distinguish an emotional transition that is absent from one that is present
      but visually subtle.
- [ ] Check whether expressions, pose, gesture, gaze, staging, distance, and
      interaction support the planned state.
- [ ] Check `avoidSignals`, especially shame, coercion, fear, blame, moralized
      praise, or other prohibited implications.
- [ ] Evaluate the whole sequence as well as individual pages so repeated poses
      or uniformly cheerful expressions do not pass as a continuous arc.
- [ ] Separate story-text gaps, visual-plan gaps, and illustration-execution gaps
      instead of assigning every problem to the final image.

### Finding contract

Each finding should contain:

- [ ] page or spread and character;
- [ ] exact source revisions evaluated;
- [ ] planned emotional transition;
- [ ] concise observed evidence from text and image;
- [ ] result using a small vocabulary such as `clear`, `could_be_clearer`, or
      `needs_attention`;
- [ ] confidence with an explanation when evidence is ambiguous;
- [ ] likely source: story, emotional plan, spread plan, illustration, or
      cross-page sequence;
- [ ] bounded suggestion and explicit details to preserve;
- [ ] evaluator identity, prompt version, model, timestamp, and cost estimate.

Do not present a single opaque emotional-quality score as proof that the book is
good or bad.

### Safety and authority

- [ ] State that findings are suggestions, not objective diagnoses of a child or
      family.
- [ ] Do not infer internal emotion solely from identity, disability, culture,
      facial structure, or other protected characteristics.
- [ ] Do not reward exaggerated expressions when quiet emotion fits the approved
      story.
- [ ] Preserve child agency and avoid converting supportive family behavior into
      surveillance, pressure, or praise for obedience.
- [ ] Never alter approved artifacts automatically.
- [ ] Require explicit user confirmation before sending a suggestion into paid
      page regeneration.

### Result presentation

- [ ] Show actionable findings by page and character, with whole-sequence issues
      clearly separated.
- [ ] Keep planned transition, observed evidence, and suggestion visible together.
- [ ] Allow passing findings to be collapsed so attention goes to meaningful
      exceptions.
- [ ] Provide an understandable empty state when no actionable issues are found.
- [ ] Provide accessible loading, success, partial-result, failure, and retry
      states.
- [ ] If both parent and advanced views exist, keep technical revisions,
      confidence, and provider metadata in the advanced view.

### Revision handoff

- [ ] A page-level suggestion may prefill the existing targeted-regeneration
      feedback, but the user must review and confirm it.
- [ ] Name what to change and what to preserve.
- [ ] Target only the affected page unless the finding demonstrates a
      cross-spread problem.
- [ ] Preserve the current page revision until a successor page is generated,
      reviewed, and approved through the existing workflow; when evaluating an
      already approved proof, preserve that proof as historical evidence.
- [ ] Do not dismiss or resolve a finding merely because regeneration completed;
      compare the successor against the intended transition again.

### Lifecycle decision

- [ ] Decide whether results are derived and disposable or saved as a versioned
      artifact.
- [ ] Start with a derived result unless history, auditability, resumability, or
      an approval gate is a confirmed requirement.
- [ ] If persisted, define schema, filenames, source revision identifiers,
      successor rules, current alias, and migration behavior.
- [ ] If persisted, stale only findings affected by changed inputs; do not discard
      valid findings for unchanged page revisions.
- [ ] Decide whether dismissals are local UI state, evaluation annotations, or a
      separate human decision artifact.

## Implementation acceptance checklist

Use this only after the product decisions above are resolved.

- [ ] No provider call occurs merely by opening the proof or review screen.
- [ ] The evaluator receives only the intended project-scoped inputs.
- [ ] The evaluated source revisions are visible in advanced evidence.
- [ ] Fixture-based tests cover clear, ambiguous, and discontinuous arcs without
      paid provider calls.
- [ ] Tests cover supporting-character findings and prohibited emotional signals.
- [ ] Tests prove stale or mismatched inputs cannot be reported as current.
- [ ] Tests prove evaluation failure does not change page revisions, decisions,
      or an existing approved proof.
- [ ] Tests prove suggestions cannot regenerate or replace a page without an
      explicit user action.
- [ ] Focused browser coverage verifies role visibility, cost disclosure,
      loading, results, failure, and targeted-revision handoff.
- [ ] Accessibility evidence satisfies `spec/08-ux-guidelines.md` for every new
      parent-facing or operator-facing state.
- [ ] Provider metadata and estimated cost are recorded consistently with the
      existing generation workflows.

## Deferred until explicitly decided

- Evaluation buttons at every workflow stage.
- Automatic evaluation after every regeneration.
- Automatic rewriting or image regeneration.
- A required emotional-quality score.
- Making evaluation a proof-approval or export gate.
- Persisted evaluation history.
- Parent-facing technical evaluator output.

## Architecture impact

The checklist itself has no runtime architecture impact. A later implementation
will require an **Updated** architecture assessment if it adds an evaluator
boundary, persisted artifact, proof-review route behavior, new staleness edges,
or a revision handoff.
