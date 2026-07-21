# Parent Experience and Interaction Guidelines

Status: working specification
Last updated: 2026-07-20

## Purpose and applicability

This is the canonical UX implementation contract for Kids Book Builder. It
turns the parent-first product principles into observable interface behavior.
It applies to every parent-facing route, form, approval checkpoint, generation
job, recovery flow, and reader control. It complements, but does not replace,
the artifact lifecycle and persistence requirements in
[development.md](../development.md) and the pipeline rules in
[04-agent-pipeline.md](04-agent-pipeline.md).

Before changing parent-facing UI, coding agents must read this document, the
relevant task, and the related product specification. They must add or update
the acceptance scenario and focused Playwright coverage for each changed
observable state. Where a rule here conflicts with an approved product decision,
do not guess: record the conflict and escalate it.

## Experience promise

A parent should always be able to answer, without technical knowledge:

1. What am I making, and why does this step matter?
2. Where am I in the book-making journey, what is complete, and what is next?
3. What is the app doing now, what has already been safely saved, and how long
   might the next result take?
4. What can I change, what will be preserved, and what will need to be made
   again?
5. If something goes wrong, what happened to my work and what can I do next?

The primary interaction model is a guided, resumable workflow—not a chat
transcript and not a one-shot generator. Use clear parent language such as
“Choose a story direction”, “Review the sample spread”, and “Make the next
spread”; do not make a parent interpret agent names, model names, or internal
pipeline jargon.

## Non-negotiable interaction rules

### 1. Make the journey and current state visible

- Every project route shows the project title and a persistent entry back to the
  project overview.
- The overview shows all checkpoints in order, each with a text status:
  `Not started`, `In progress`, `Ready for your review`, `Approved`, `Needs
  attention`, or `Out of date`. Do not communicate status with colour or icons
  alone.
- Show the current checkpoint, the next meaningful action, and a concise reason
  when a later action is unavailable. Do not show a disabled primary action
  without explanation.
- A completed checkpoint remains inspectable. Surface the parent-approved
  decisions and the `must keep` details at every downstream approval and
  revision point.
- For ordered work, use a numbered stepper/wizard with an overview and
  “Save and exit”; do not use a freely ordered task list to imply that dependent
  stages can be completed in any order.
- When reopening a project, restore the actual persisted state and offer the
  exact next action. Never make the parent reconstruct prior choices from
  memory.

### 2. Give immediate, unambiguous feedback for every action

- A control must look interactive before activation; on activation it must
  acknowledge the action immediately (pressed/pending state) and prevent an
  accidental duplicate submission.
- Keep the action’s label and context visible while it is pending. Use a local
  pending state for a local action; reserve a global blocker for work that truly
  blocks the entire project.
- After success, name the result and its next action: for example, “Story
  direction saved. Review the outline.” Do not use a vague “Success”.
- Use one consistent semantic treatment across the app: primary for the one
  next-step action, secondary for safe alternatives, and a clearly separated
  destructive treatment for irreversible or costly actions. Visual styling may
  evolve, but these meanings must not.
- Keep confirmation messages visible long enough to be read and also record the
  resulting state in the page itself; a transient toast is never the only proof
  that work succeeded.

### 3. Treat long-running creation as a durable, inspectable job

- Before a potentially costly generation, state what will be generated, what
  inputs/approved decisions it will use, and the current cost estimate. Require
  the existing product-defined confirmation before crossing its cost threshold.
- Starting a generation must persist a job record before provider work starts.
  Every completed unit (for example, each spread) is saved atomically before
  the UI reports it as complete.
- During generation, show a human-readable stage, completed/total units when
  known, the last safely saved result, and appropriate controls: leave this
  page, continue elsewhere, retry when safe, or stop future work. Do not invent
  an exact ETA when one is not reliable.
- On refresh, close, restart, or network interruption, the project overview
  must show the persisted job state and offer the truthful recovery action
  (`Resume`, `Retry failed spread`, `Review saved work`, or `Start again`).
  Never imply that unsaved work completed.
- Keep an accessible, timestamped activity history for meaningful events:
  started, saved, paused/interrupted, failed, resumed, approved, regenerated,
  and exported. It is a parent-facing explanation, not a raw provider log.

### 4. Preserve control and make AI limits legible

- Explain what the app will create and which parent inputs it will honor before
  a generation begins. State clearly that the result is a draft for review, not
  a guaranteed final book.
- At each result, give a bounded choice that matches the decision: approve,
  request a targeted change, edit supplied text where allowed, or go back to
  revise the upstream decision. Avoid an open-ended “try again” as the only
  recovery mechanism.
- When a parent changes an approved upstream decision, show the affected later
  artifacts, what will remain, what will become out of date, and any cost before
  confirmation. Preserve approved siblings for a localized regeneration.
- Never silently alter an approved parent decision, replace a result after the
  parent leaves the page, or represent an evaluator prediction as a fact about a
  child’s likely response.
- Keep evaluation details secondary to the parent’s review, but do not conceal
  them. Provide an accessible disclosure that names the model and timestamp and
  shows outcomes, evidence, preserved strengths, and requested revisions. Label
  the result as an AI quality prediction rather than observed child response.
- Collect lightweight feedback at useful moments (for example, “Keep this
  spread” / “Change this”). Acknowledge receipt and say whether it changes this
  book, future generation prompts, or only the local evaluation record. Do not
  claim model training or future behavior that is not actually implemented.

### 5. Prevent, explain, and recover from failure

- Validate early enough to prevent wasted work but not while a person is still
  typing, except for high-value limits such as a character count. Preserve all
  entered values after validation fails.
- Put a concise, specific error beside the affected field and provide a linked
  error summary at the top of a submitted form. The message must say what is
  wrong and how to fix it; avoid “Something went wrong”, error codes, blame,
  or jokey language.
- Distinguish a fixable input problem from a service, configuration, provider,
  safety, or saved-data problem. For the latter, say what has been saved, what
  was not completed, and the safest next action. Do not make the parent repeat
  completed work.
- A failed generation must preserve the latest valid artifact and its approved
  dependencies. Offer only safe recovery actions. Retry only the failed unit
  where possible; do not automatically rerun an entire book or incur new cost.
- Destructive, expensive, or scope-expanding actions require a clear
  confirmation that names the effect. Where practical, offer Cancel and an
  undo window for reversible changes.
- Empty states and unavailable prerequisites must explain the benefit of the
  next action, not merely report absence (for example, “Choose a story direction
  before we can create an outline”).

### 6. Use accessible, consistent foundations

- Meet WCAG 2.2 AA as the baseline. Use semantic HTML first; custom controls
  must preserve keyboard operation, visible focus, a programmatic name/role/
  value, and adequate target size and contrast.
- Give every input a visible label, optional/help text at the point it is
  needed, and a programmatic association with its error text. Do not use a
  placeholder as a label.
- Announce non-disruptive saved/loading/progress messages through a pre-existing
  polite status region. Use an assertive alert only for urgent failures that
  require immediate attention. Do not announce every small progress tick.
- Use native `<progress>` when real progress is known; otherwise describe an
  indeterminate state in text. Mark a loading region busy until it is ready.
- Do not move keyboard focus for routine success or loading updates. For a
  blocking validation failure, move focus to the error summary; for a new page
  or dialog, move it predictably to its heading/dialog and restore it on close.
- Respect reduced-motion preferences; never make animation the sole indication
  of progress or success. Test at narrow viewport widths, zoom, keyboard only,
  and with a screen reader-aware semantic review.

## Required screen states

Each feature must deliberately design and test the applicable states below; a
happy-path screenshot is not sufficient.

| State | The parent must see | Minimum evidence |
| --- | --- | --- |
| First use / empty | purpose, expected effort, and one clear starting action | browser test |
| Drafting | what is saved automatically and how to leave safely | browser test where persistence changes |
| Validation error | retained entry, specific field message, linked summary, recovery | browser test |
| Submitting | immediate acknowledgement and duplicate-submit protection | component or browser test |
| Loading | what is loading, usable fallback/skeleton, accessible busy/status state | browser test for meaningful loads |
| Generating | stage, durable progress, saved units, next recovery action | browser test with deterministic job fixture |
| Ready for review | result, must-keep details, decision options, consequences | browser test |
| Service/provider failure | plain explanation, saved-work status, safe retry/recovery | browser test |
| Interrupted/reopened | actual persisted status and resumable next action | browser test |
| Stale dependency | why it is out of date, affected scope, preserve/regenerate choices | browser test |
| Destructive/costly action | named impact, cost if applicable, confirm/cancel | browser test |

## Coding-agent delivery checklist

For each parent-facing change, agents must include the following in the task or
handoff evidence:

- The parent outcome, primary action, and relevant screen states from the table.
- The persisted state transition and recovery behavior, if the action creates,
  modifies, approves, or generates an artifact/job.
- The precise success, pending, empty, validation, and failure copy—or a link
  to the canonical copy source once one exists.
- The keyboard/focus and live-status behavior for dynamic UI.
- Focused unit/integration tests for state/persistence rules and Playwright
  scenarios for the parent-visible flow, including its unhappy path.
- Architecture impact: **Updated** when the change modifies a user journey,
  lifecycle, boundary, or operational recovery behavior; otherwise **None**
  with a short reason.

## Source rationale

These sources inform the rules above; they are guidance, not product policy.

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) defines requirements for
  input-error identification and suggestion, focus, target size, and
  programmatically available status messages.
- [MDN guidance on progress bars](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role)
  supports native progress indicators, `aria-busy`, and accessible progress
  semantics; [MDN live-region guidance](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
  supports proportionate announcements for dynamic updates.
- [GOV.UK’s validation pattern](https://design-system.service.gov.uk/patterns/validation/)
  supports retained form entries, linked summaries, focus management, and
  specific recovery copy. Its [task-list guidance](https://design-system.service.gov.uk/components/task-list/)
  distinguishes freely ordered tasks from ordered, resumable journeys.
- Google PAIR’s [Feedback + Control](https://pair.withgoogle.com/guidebook-v2/chapter/feedback-controls/)
  and [Errors + Graceful Failure](https://pair.withgoogle.com/guidebook-v2/chapter/errors-failing/)
  support human control, feedback acknowledgement, explicit uncertainty, and a
  path forward after AI or context failures.
- Microsoft’s [Human-AI Interaction Guidelines](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/)
  support clear capabilities and limits, relevant in-context information, and
  user control when AI behavior is wrong.
