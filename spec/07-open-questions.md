# Open Questions and Roadmap

This file separates settled MVP direction from assumptions that still require research, product decisions, or testing.

## Highest-priority open questions

### 1. Parent discovery research

Questions:

- What language do parents use to describe an original story idea?
- Which choices feel empowering versus burdensome?
- How many approval checkpoints are tolerable?
- Do parents prefer choosing a template, answering questions, or beginning in free text?
- What makes parents trust that the system preserved their idea?
- What are their expectations for printing, privacy, ownership, and reuse?

Proposed work:

- Interview 8–12 parents before finalizing intake.
- Test low-fidelity flows with idea interpretation, three directions, and story approval.
- Include parents with different home languages and reading practices.

### 2. Rubric calibration

Current weights and thresholds are design hypotheses.

Proposed work:

- Create structured benchmark records for the balanced corpus.
- Recruit children's literature experts or experienced teachers/librarians.
- Measure inter-rater agreement by dimension.
- Compare evaluator evidence and revision advice, not just scores.

### 3. Child-response validation

Questions:

- Which lightweight parent observations are reliable enough to collect?
- How should quiet attention be distinguished from disengagement?
- Can predicted engagement identify confusing spreads before field testing?
- Does the feedback flow make shared reading feel evaluated or burdensome?

Proposed work:

- Start with voluntary parent taps and four post-reading questions.
- Avoid audio, video, eye tracking, or emotion inference in the MVP.
- Analyze disagreements between model prediction and parent observation.

### 4. Image-provider bakeoff

Evaluate candidate providers using the same controlled book package:

- One protagonist across multiple angles and emotions
- Two recurring characters in one scene
- Clothing and prop continuity
- Location consistency
- Composition adherence
- Local repair quality
- Art-direction stability
- Generation latency and cost
- Rights, privacy, retention, and commercial-use terms

Do not choose a provider from isolated attractive images.

### 5. Safety and representation policy

Requires expert and legal review before launch.

Topics:

- Age-banded fear and violence
- Dangerous imitation and unsafe instructions
- Bullying and humiliation
- Disability and mental-health representation
- Cultural and religious specificity
- Parent customization limits
- Child likenesses and uploaded family photographs
- Moderation and escalation

### 6. Privacy and ownership

Decisions required:

- Whether parent ideas and child details train any model
- Retention duration for text and uploaded images
- Deletion and export behavior
- Ownership and licensing of generated books
- Consent for child names, likenesses, and family stories
- Whether generated artifacts may be publicly shared by default

### 7. Copyright and style policy

Decisions required:

- How to handle requests to imitate living artists
- How benchmark books are stored and analyzed
- Whether any copyrighted text or images are sent to models
- Provider training-data and output-license review
- Similarity detection for text, characters, and illustrations

Recommended direction:

- Use high-level visual property presets rather than artist imitation.
- Store structured observations and bibliographic data, not unauthorized book scans or full text.

## MVP build sequence

### Phase 0: Research prototypes

- Finalize artifact schemas.
- Build benchmark evaluation sheets.
- Prototype parent intake and direction selection.
- Run image-provider consistency bakeoff.

### Phase 1: Story-only vertical slice

- Parent Intent Agent
- Direction Agent
- Story Engine and Beat Agents
- Structural, Engagement, Language, and Meaning Evaluators
- Revision Director
- Parent story proof

Success criteria:

- Parents recognize their original idea.
- Different directions are structurally different.
- Revisions improve target dimensions without changing locked intent.

### Phase 2: Visual development

- Art-direction presets
- Character and world bible
- Storyboard
- Sample-spread checkpoint
- Visual and continuity evaluators

Success criteria:

- Character recognition across representative spreads
- Story remains readable through thumbnails
- Parents understand and approve visual direction before expensive generation

### Phase 3: Complete book production

- Final illustration generation
- Local repair
- Typography and layout
- Preflight
- PDF and screen proof

Success criteria:

- Correct page sequence and production properties
- No critical continuity errors
- Text remains editable and localized separately from art

### Phase 4: Family testing and calibration

- Optional reading feedback
- Prediction versus observation analysis
- Template and evaluator revisions
- Controlled expansion to co-read and independent modes

## Deferred features

- Ages 3–5 as a validated default
- Independent-reading guarantees or formal grade leveling
- Bilingual production
- Rhyme and meter
- Educational nonfiction with formal source verification
- Child-led co-creation
- Audiobooks and interactive animation
- Marketplace or public sharing
- Automatic print ordering

These are technically addable through the stage registry, but should not be marketed before their specialized quality and safety checks exist.

## Decisions to revisit after parent interviews

- Exact number and labels of visible templates
- Whether meaning is asked during intake or after direction selection
- Whether parents approve a beat outline or a plain-language story preview
- Whether one or two sample spreads are needed
- How much evaluator feedback parents want to see
- Default read time and text density
- Whether “custom style” is free text or guided visual controls

## Definition of research-complete for MVP design

Research can be considered sufficient to begin the story-only vertical slice when:

- Core schemas are stable enough to implement.
- At least two expert raters have tested the structural rubric.
- Parent interviews confirm the intake and direction concepts.
- Safety and privacy requirements have named owners.
- No unresolved question blocks story-only prototyping.

It is not necessary to resolve final image-provider, printing, or field-feedback questions before story-only implementation begins.
