# Discovery checklist: Evaluate the approved book's emotional fidelity

## Status

Proposal for product discovery. This checklist does not authorize implementation,
make the evaluation an approval gate, or decide who can see the results.

## Question to answer

Should the product offer an optional evaluation that compares the emotional
journey planned for each character with the emotional performance visible in the
exact approved book?

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
with observable evidence in those final pages.

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
      one manual action on the complete proof.
- [ ] Decide whether an already approved book is required, or whether a complete
      unapproved proof may also be evaluated.
- [ ] Show the estimated model cost before a manual provider call.
- [ ] Prevent duplicate calls while an evaluation is running.
- [ ] Define retry behavior that preserves the approved proof and last safe
      artifacts.
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
- [ ] Preserve the approved proof until a successor page is generated, reviewed,
      and approved through the existing workflow.
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
- [ ] Tests prove evaluation failure does not change the approved proof.
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
