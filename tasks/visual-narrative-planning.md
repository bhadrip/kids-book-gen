# Feature: Review the visual story plan before making artwork

## Status

Implemented and verified on `codex/visual-narrative-plan`.

Implemented evidence:

- versioned `EmotionalArc`, `SpreadMap`, `VisualPlanDecision`, and
  `VisualPlanJob` schemas;
- fixture and OpenAI structured visual-plan generation;
- resumable generation, complete successor revision, and exact approval through
  `VisualNarrativeWorkflowService`;
- minimal parent review on the existing visual route;
- exact visual-plan approval gate before character generation;
- approved emotional and spread-planning inputs passed into character and
  sample image generation;
- focused workflow, regression, and Playwright coverage.

Verification evidence:

- 33 Vitest tests pass;
- all 9 Playwright journeys pass with deterministic providers;
- changed-path formatting, ESLint, TypeScript, and production build pass.

## Outcome and user

As a parent, I can review one concise visual plan for the whole story before
character and image generation, so that I can catch a wrong action, emotion, or
story emphasis without learning internal publishing terminology or editing
multiple technical artifacts.

The system may create detailed visual-narrative reasoning internally. The parent
input remains deliberately minimal.

## Product decision

The application will persist two separate artifacts:

1. An internal `EmotionalArc`, used by downstream planning and evaluation.
2. A parent-facing `SpreadMap`, presented as one simple visual-plan checkpoint.

Parents do not edit emotional-state taxonomies, evaluator scores, camera
language, agent prompts, or raw artifact JSON.

The parent reviews only the information needed to answer:

- Does the sequence tell the right story?
- Is the main action on each spread right?
- Does the emotional movement feel right?
- Is an important family detail missing?

## Journey placement

The new checkpoint sits after exact story approval and before art style and
character generation:

```text
Approved story
→ system creates emotional arc and spread map
→ parent reviews the visual story plan
→ parent approves or requests one bounded revision
→ existing character and sample-spread flow
```

The detailed emotional arc is not a separate parent checkpoint.

## Artifact contracts

### `EmotionalArc`

Purpose: preserve the internal emotional logic that visual planning,
performance, storyboarding, and meaning evaluation must follow.

Minimum structure:

```yaml
schemaVersion: 1
projectId: <uuid>
revision: 1
sourceStoryRevision: 2
generatedAt: <timestamp>
model: <provider model>

characters:
  - characterName: Pea
    beats:
      - spreadNumber: 1
        enteringState: excited
        trigger: Pea arrives ready to help
        outwardExpression: buoyant hop and open posture
        leavingState: hopeful
        intensity: low
        avoidSignals:
          - pressure
          - accusation
```

Rules:

- Track only characters whose emotional change affects visual storytelling.
- Tie every entry to an existing story spread.
- Describe observable performance, not hidden emotion alone.
- Preserve story agency: an assisting character's expression must not imply
  coercion when the child owns the final choice.
- Record prohibited emotional signals when the brief or story establishes an
  important boundary.
- The parent does not edit this artifact directly in V0.

### `SpreadMap`

Purpose: own the visual and narrative job of every approved story spread before
paid artwork begins.

Minimum structure:

```yaml
schemaVersion: 1
projectId: <uuid>
revision: 1
sourceStoryRevision: 2
sourceEmotionalArcRevision: 1
generatedAt: <timestamp>
model: <provider model>
parentSteering: <optional bounded feedback>

spreads:
  - spreadNumber: 1
    storyBeat: Pea arrives
    storyJob: Introduce Pea's purpose and energy
    mainAction: Pea hops into view beside the child's plate
    emotionalMovement: excitement becomes hopeful connection
    illustrationIntent: Show Pea welcoming attention without blocking the child
    mustShow:
      - Pea's leaf hat
    mustAvoid:
      - a demanding pointing gesture
    pageTurnQuestion: Will the child notice Pea?
```

Rules:

- Contain exactly one entry for each story spread.
- Quote or trace the source story beat rather than silently replacing it.
- State one primary action and one emotional movement per spread.
- Separate the job of the image from manuscript text.
- Carry forward relevant `mustKeep` and `avoid` constraints.
- Remain usable by a future storyboard stage without requiring the storyboard
  to reinvent story or emotional intent.

### `VisualPlanDecision`

Purpose: approve or request a revision of an exact `SpreadMap` revision.

Minimum structure:

```yaml
schemaVersion: 1
projectId: <uuid>
spreadMapRevision: 1
status: approved
feedback: <optional>
decidedAt: <timestamp>
```

An approval is current only when:

- the decision status is `approved`;
- it names the current `SpreadMap` revision;
- the `SpreadMap` names the current approved story revision;
- the `SpreadMap` names the current `EmotionalArc` revision.

## Parent-facing experience

### Page purpose

Use parent language such as:

> Check how the story will unfold in pictures.

Supporting copy:

> We planned the main action and feeling for each part of the story. Check the
> sequence before we design the character and make artwork.

Do not show the terms `EmotionalArc`, `SpreadMap`, agent, evaluator, schema,
prompt, or model.

### Review layout

Show all story spreads in order as compact numbered cards. Each card shows only:

- short story beat;
- main action in the picture;
- emotional movement;
- must-show detail, when present.

Keep illustration intent, page-turn logic, detailed emotional observations, and
avoid-signal rules available to downstream stages but hidden from the default
parent view.

The page must preserve the existing project title, journey navigation, and
family `mustKeep` reminder.

### Parent actions

Primary:

- **Approve the visual story plan**

Secondary:

- **Ask for a change**

The change form contains one optional spread selector and one required feedback
field:

- “Which part needs attention?” — whole plan or one spread
- “What should feel or happen differently?” — plain-text feedback

Do not present a form on every spread. Do not ask the parent to classify an
emotion, select camera framing, score the plan, or edit internal fields.

One submission creates a complete successor `EmotionalArc` and `SpreadMap`;
earlier revisions remain preserved.

### Success copy

After generation:

> The visual story plan is ready. Check the sequence before we make artwork.

After revision:

> The updated visual story plan is saved. Review this revision before approving
> it.

After approval:

> Visual story plan approved. Next, choose the character's look.

### Failure and recovery copy

> The visual story plan did not finish. Your approved story and the last saved
> plan are still safe. Retry only this step when you are ready.

The UI must not imply that character or image generation has started.

## State and lifecycle

### Versioning

Candidate V0 filenames:

```text
emotional-arc-01.json
emotional-arc.json
spread-map-01.json
spread-map.json
visual-plan-decision-01.json
visual-plan-decision.json
visual-plan-job.json
```

The numbered file preserves the exact revision. The stable alias points to the
current revision.

### Staleness

- A new approved story revision makes the emotional arc, spread map, visual-plan
  approval, character designs, Visual Bible, sample spread, and book production
  artifacts out of date.
- A new emotional arc revision makes its spread map and all later visual
  artifacts out of date.
- A new spread map revision makes its approval and later visual artifacts out
  of date.
- A localized parent change must preserve earlier revisions and must not delete
  generated assets.
- The UI must name the affected later work before reopening an approved visual
  plan once later visual artifacts exist.

This slice must implement and test the dependency checks it relies on. It must
not claim general lifecycle-wide staleness for unrelated artifacts.

## Service boundary

Add a visual-narrative application service rather than placing provider or
filesystem logic in a route:

```text
UI/routes
→ VisualNarrativeWorkflowService
→ TextProvider
→ FileProjectRepository
→ validated artifacts
```

The service owns:

- approved-story prerequisite validation;
- generation of paired `EmotionalArc` and `SpreadMap` revisions;
- preservation of numbered successors and current aliases;
- exact-revision approval;
- persisted job status and failure recovery;
- currentness checks required before character generation.

The two artifacts are one generation/revision unit for V0. Do not expose them as
independently rerunnable parent actions.

## Existing flow changes

- Add the visual-plan review before the current character-design section on the
  existing visual route, unless implementation evidence shows that the screen
  becomes too dense; creating a new route then requires an architecture update.
- Block `generateCharacterDesigns` until the current `SpreadMap` has an exact
  approved `VisualPlanDecision`.
- Pass the current `EmotionalArc` and `SpreadMap` into character and sample
  generation so prompts can honor the whole-book performance requirements.
- Update project progress so the visual checkpoint distinguishes plan
  generation, plan review, character selection, sample review, and final visual
  approval using parent-readable status and next-action copy.
- Preserve the current image-provider boundary and cost gates. Planning uses
  text generation and must not trigger paid image generation.

## In scope

- Three versioned Zod artifact schemas.
- A persisted, resumable visual-plan generation job.
- Fixture and OpenAI structured text-provider methods.
- Visual-narrative workflow service.
- Parent-facing generation, review, bounded revision, approval, failure, and
  reopen states.
- Character-generation prerequisite gate.
- Passing approved planning artifacts into downstream visual prompts.
- Focused schema, service, progress, and browser tests.
- Artifact catalog, architecture, and task-status updates.

## Out of scope

- Character performance/model sheets.
- Thumbnail storyboard images.
- Storyboard evaluation.
- Per-spread parent editing forms.
- Drag-and-drop spread reordering.
- Camera, lens, composition, or lighting controls.
- Exposing evaluator scores or detailed emotional taxonomies.
- Final illustration changes beyond accepting the approved plan as input.
- A generic dependency-graph engine.
- New hosted storage, queues, accounts, or deployment infrastructure.

## Required screen states

1. **Prerequisite unavailable:** story is not approved; explain that the story
   comes first.
2. **First use:** explain the visual-plan benefit and show one generation action.
3. **Generating:** show persisted job stage and last safe artifact.
4. **Ready for review:** show every spread in order and the two bounded actions.
5. **Revision form:** retain selected spread and feedback after validation
   failure.
6. **Approved:** show the approved revision and the next character action.
7. **Provider failure:** preserve the approved story and last valid visual plan;
   offer a safe retry.
8. **Interrupted/reopened:** restore the actual persisted job or review state.
9. **Out of date:** explain which story change invalidated the plan.
10. **Reopen after downstream work:** name affected character/sample/book
    artifacts before confirmation.

## Acceptance scenarios

1. Given an exact approved story and no visual plan, when the parent starts
   planning, then a job is persisted before provider work and paired version-1
   emotional-arc and spread-map artifacts are saved atomically before the job
   completes.
2. Given a generated plan, when the parent reviews it, then every approved story
   spread appears exactly once in order with beat, action, emotional movement,
   and relevant must-show detail.
3. Given a generated plan, when the parent approves it, then the decision names
   the exact current spread-map revision and character generation becomes
   available.
4. Given no current exact-revision approval, when character generation is
   requested directly, then the service rejects it without calling the image
   provider.
5. Given feedback for one spread, when the parent requests a revision, then the
   application saves complete paired successor artifacts, preserves the prior
   files, and requires approval of the successor.
6. Given a provider failure, when the parent reloads the project, then the last
   valid plan remains reviewable and the UI offers a truthful retry.
7. Given a newer approved story revision, when the project is reopened, then
   the prior visual plan is marked out of date and cannot unlock character
   generation.
8. Given an approved current plan, when character/sample prompts are built, then
   they include the relevant emotional and spread-planning constraints without
   exposing the internal artifacts to the parent.
9. Given keyboard-only use or narrow/zoomed presentation, when the parent
   reviews and decides, then spread order, labels, focus, pending feedback, and
   error recovery remain operable and understandable.

## Verification contract

### Unit and integration

- schema validation for exact spread coverage, ordering, source revisions, and
  observable emotional performance;
- paired revision persistence and alias updates;
- approval-currentness and character-generation gating;
- provider failure and interrupted-job recovery;
- no image-provider call during planning;
- downstream prompt construction from approved planning artifacts;
- affected project-progress statuses and next actions.

### Browser

- first generation through review and approval;
- one bounded revision with retained feedback on validation error;
- provider failure and safe retry/reopen;
- out-of-date behavior after an upstream story successor;
- character generation unavailable before and available after exact approval;
- semantic headings, labels, status/alert regions, pending-state duplicate
  protection, keyboard operation, and a narrow viewport.

### Handoff commands

Run the narrowest tests while developing, then:

```text
just check
just test
just e2e
just build
```

Tests must use deterministic fixtures and must not call paid providers.

## Architecture impact

**Updated.** This feature adds a user-visible checkpoint, new persisted artifact
contracts, a new application-service responsibility, new dependency/currentness
rules, and new inputs to visual generation. Update `ARCHITECTURE.md`,
`spec/04-agent-pipeline.md`, and the artifact catalog when implementation lands.

## Open implementation questions

These should be resolved from implementation evidence without increasing
parent input:

- Whether the compact cards fit comfortably on the existing visual route or
  need a dedicated `/visual-plan` route.
- Whether the text provider should produce the two artifacts in one structured
  response or two deterministic passes. The saved contracts remain separate.
- Whether the detailed `EmotionalArc` needs a parent-readable summary for
  accessibility or debugging; it must not become another approval form.
