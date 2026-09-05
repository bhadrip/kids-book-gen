# Parent-selected reader age and age-aware evaluation

Status: partially implemented — intake, prompt profiles, evaluation provenance,
legacy generation blocking, and checkpoint visibility are implemented. Reader
configuration successors and dependency staleness remain future work.

Architecture impact: updated — this changes intake, generation contracts,
evaluator inputs, persisted provenance, and the parent journey.

## Confirmed product gap

The current application does not ask the parent for the intended reader's age.
`ProjectBrief` does not persist an age or reading mode, while story generation
and hidden story evaluation independently hard-code "ages 7–10" and
"parent-read-aloud" in provider instructions. A proof therefore cannot show
which reader configuration governed its creation, and an evaluator can apply a
different age assumption without detecting the mismatch.

This conflicts with the existing product principle that age and reading mode
are configuration rather than hard-coded logic.

## Outcome and user

As a parent or caregiver, I can select and confirm the intended reader age and
reading mode before generating story directions, so that every generated and
evaluated artifact uses the same visible reader configuration.

## In scope

- Capture a required intended-reader age configuration during parent intake.
- Capture or confirm reading mode alongside age; age alone must not stand in
  for decoding ability or delivery context.
- Show the selected reader configuration at every text approval checkpoint and
  in the finished proof's provenance/details view.
- Persist the configuration as a versioned source artifact and record its exact
  identity or values on derived story and evaluation artifacts.
- Use the same configuration for directions, story generation, hidden quality
  evaluation, parent-requested revision, and final holistic evaluation.
- Select an age-appropriate evaluation profile rather than substituting an age
  phrase into one generic prompt.
- Preserve existing projects through an explicit migration/default-confirmation
  state; do not silently claim that an old book was parent-configured.
- Make a changed age or reading mode create a successor configuration and mark
  dependent artifacts stale according to the artifact lifecycle.

## Out of scope

- Promising that a chosen age guarantees comprehension, enjoyment, reading
  level, learning, or behavioral change.
- Diagnosing a child's reading ability from age.
- Formal grade-level certification or independent-reading guarantees.
- Implementing bilingual adaptation, accessibility personalization, or a full
  literacy assessment as part of this feature.
- Retrofitting an age claim into an already exported proof without regeneration
  and reevaluation.

## Product rules

### 1. Age and reading mode are separate

The parent must supply an intended age configuration and confirm a reading
mode. At minimum, the reading-mode choices follow the canonical registry in
[`05-product-configuration.md`](05-product-configuration.md): parent read-aloud,
co-read, independent developing, and independent confident.

The interface must explain that age tunes developmental expectations while
reading mode tunes listening, decoding, oral-flow, vocabulary, cohesion, and
text-density priorities.

### 2. One confirmed configuration governs the artifact chain

Every derived artifact must be traceable to the same confirmed reader
configuration. Generation and evaluation must reject missing, unsupported, or
mismatched configuration rather than falling back to an undeclared prompt
default.

The parent-facing confirmation should use plain language, for example:

> Written for ages 7–10 to enjoy with an adult reading aloud.

### 3. Evaluation must be age-profiled

Evaluation uses the common dimensions in
[`03-evaluation-rubric.md`](03-evaluation-rubric.md), with expectations and
evidence interpreted through the chosen age and reading mode. It must not
reduce age fit to sentence length or vocabulary difficulty.

Each supported evaluation profile must define at least:

- expected causal-chain complexity and inference support;
- protagonist agency and perspective-taking expectations;
- oral-flow or decoding emphasis based on reading mode;
- vocabulary support and simultaneous challenge budget;
- text density and referential clarity expectations;
- participation opportunities and likely page-turn mechanisms;
- acceptable emotional intensity and relevant safety escalation;
- expected text-image cooperation;
- confidence limits and the field evidence needed to validate predicted fit.

An evaluation record must include:

- evaluated artifact and exact revision;
- intended age configuration and reading mode;
- evaluation-profile identifier and version;
- dimension findings with page/spread evidence;
- confidence per finding;
- hard-gate results;
- bounded revision advice and what to preserve;
- an explicit statement that predicted fit is not observed child response.

### 4. Supported ages require validated profiles

The product must not offer an age choice as fully supported until its generation
guidance, evaluation profile, safety guidance, and benchmark calibration status
are documented. An experimental choice must be labeled as such to the parent.

The existing 7–10 parent-read-aloud configuration is the migration baseline,
not proof of calibration. Ages 3–5 remain a proposed expansion until their
profile is reviewed and validated against the research and calibration process.

### 5. Parent changes are explicit and non-destructive

Changing age or reading mode after directions or a story exist must:

1. explain which downstream artifacts will become stale;
2. require parent confirmation;
3. preserve all prior approved artifacts and decisions;
4. create a successor reader configuration;
5. regenerate and reevaluate affected text before visual or production work can
   continue;
6. prevent export from representing stale work as current.

## Parent experience

### New project

1. Parent enters the original idea and must-keep details.
2. Parent selects the intended reader age and reading mode.
3. The app summarizes the choice in plain language.
4. Parent confirms the complete brief before directions are generated.
5. Each later approval screen repeats the confirmed reader summary.

The UI should offer a short explanation and a sensible default without
requiring knowledge of reading scores. It must not imply that all children of
one age have the same preferences or abilities.

### Existing project without reader configuration

The project opens in a recoverable **Reader details need confirmation** state.
The app may preselect the legacy assumption of ages 7–10 and parent read-aloud,
but the parent must confirm or change it before generating a new revision or
exporting a newly represented age-aware proof. Existing artifacts remain
available and visibly labeled as generated under the legacy default.

## Acceptance scenarios

1. Given a new project, when the parent attempts to generate directions without
   confirming reader details, then generation is blocked and the missing choice
   is identified accessibly.
2. Given a confirmed ages 3–5 parent-read-aloud configuration, when directions,
   a story, and a hidden evaluation are created, then all three identify that
   same configuration and the evaluation uses the ages 3–5 read-aloud profile.
3. Given a confirmed ages 7–10 independent-developing configuration, when the
   story is evaluated, then decoding demand has greater emphasis than it does
   in the parent-read-aloud profile, while causal coherence and safety remain
   required.
4. Given an evaluator request whose profile does not match the story's source
   reader configuration, when evaluation starts, then it fails safely instead
   of producing a misleading age-fit result.
5. Given an approved story, when the parent changes the reader configuration,
   then the old story and approval are preserved, dependent artifacts are
   marked stale, and regeneration is required before production continues.
6. Given a legacy project with no saved reader configuration, when it is
   opened, then the UI discloses the legacy ages 7–10 read-aloud assumption and
   asks the parent to confirm it rather than silently persisting it.
7. Given a completed evaluation, when the parent reviews it, then every finding
   shows story evidence, its age-profile basis, and whether it is an artifact
   observation or a predicted reader effect.
8. Given an unsupported or experimental age profile, when the parent selects
   it, then its validation status and limitation are visible before generation.

## Evidence required for implementation handoff

- Schema tests for required reader configuration, profile identity/version, and
  rejection of mismatched artifacts.
- Migration tests proving legacy projects are readable and require explicit
  confirmation without rewriting approved artifacts.
- Provider-contract tests proving generation and evaluation receive the same
  reader configuration and contain no hard-coded age fallback.
- Evaluator fixtures demonstrating materially different age/read-mode criteria,
  not cosmetic prompt substitution.
- Workflow tests proving an age/read-mode successor stales the correct dependent
  artifacts and blocks production/export until regenerated.
- Playwright coverage for selection, confirmation, checkpoint visibility,
  accessible validation, legacy recovery, and changing an approved project.
- Human calibration evidence for every profile presented as supported.

## Open product decisions

These decisions must be resolved before implementation planning:

1. **Resolved input shape:** the parent selects an exact age from 3 through 10;
   the application maps it to displayed 3–5, 6–7, or 8–10 tuning guidance.
2. **Initial supported bands:** whether launch exposes only 7–10 plus an
   experimental 3–5 option, or waits until both profiles meet the same
   calibration standard.
3. **Boundary ages:** how a parent chooses for siblings or a child near a band
   boundary without implying false precision.
4. **Who can override:** whether advanced users may select a custom profile and
   what warnings or validation requirements apply.
5. **Proof display:** whether reader configuration appears on the visible
   copyright/details page, only in project metadata, or both.

## References

- [`01-research-findings.md`](01-research-findings.md)
- [`02-book-quality-model.md`](02-book-quality-model.md)
- [`03-evaluation-rubric.md`](03-evaluation-rubric.md)
- [`05-product-configuration.md`](05-product-configuration.md)
- [`07-open-questions.md`](07-open-questions.md)
- [`08-ux-guidelines.md`](08-ux-guidelines.md)
- [`09-artifact-catalog.md`](09-artifact-catalog.md)
