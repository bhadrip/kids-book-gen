# Product Configuration

## Goal

Age, reading mode, book format, style, meaning, agents, evaluation thresholds, checkpoints, and model providers must be configuration rather than assumptions embedded in prompts.

## Top-level project configuration

```yaml
project:
  schema_version: 1

  reader:
    age_range: [7, 10]
    reading_mode: parent_read_aloud
    language_confidence: comfortable
    challenge_level: gentle_stretch
    home_languages: [English]
    desired_read_time_minutes: 10

  format:
    physical_page_count: 32
    estimated_story_spreads: 13
    orientation: landscape
    output_targets: [screen_pdf]

  story:
    template: custom_original_idea
    tone: warm_adventure
    pleasure_modes: [curiosity, humor]
    ending_preference: hopeful

  meaning:
    enabled: false

  visual:
    preset: warm_handmade_v1
    custom_direction: null

  agents:
    educational_accuracy: disabled
    meaning_evaluator: conditional
    rhyme_evaluator: disabled
    bilingual_adaptation: disabled
    accessibility_evaluator: enabled

  checkpoints:
    parent_intent: required
    story_direction: required
    story_outline: required
    visual_identity: required
    sample_spread: required
    final_proof: required

  providers:
    language: default_language_adapter
    image: default_image_adapter
    layout: default_layout_adapter
```

## Reader profile

```yaml
reader_profile:
  age: 8
  reading_mode: parent_read_aloud
  language_confidence: comfortable
  challenge_level: gentle_stretch

  home_languages:
    - English
    - Hindi

  interests:
    - inventions
    - animals

  accessibility:
    dyslexia_friendly_layout: false
    reduced_text_density: false
    high_contrast_text: false
```

The parent should not need to know a formal reading score. A future intake may show sample passages and ask which feels comfortable.

### Reading mode registry

```yaml
reading_modes:
  default: parent_read_aloud

  values:
    parent_read_aloud:
      prioritize:
        - oral_flow
        - listening_comprehension
        - rich_vocabulary_with_support

    co_read:
      prioritize:
        - adult_narration
        - child_participation_lines
        - repeated_language

    independent_developing:
      prioritize:
        - decoding_load
        - clear_cohesion
        - controlled_density

    independent_confident:
      prioritize:
        - narrative_complexity
        - rich_language
        - supported_inference

  custom_modes_allowed: true
```

## Format profile

```yaml
format_profile:
  id: picture_book_32_landscape
  physical_pages: 32
  target_story_spreads: [12, 14]
  orientation: landscape

  front_matter:
    half_title: optional
    title: required
    copyright: required

  end_matter:
    discussion_prompts: conditional
    author_note: optional

  output:
    trim_width: provider_defined
    trim_height: provider_defined
    bleed: provider_defined
    color_profile: provider_defined
```

Scope Agent behavior:

```yaml
scope_rules:
  when_story_exceeds_capacity:
    options:
      - narrow_to_one_arc
      - increase_page_count
      - switch_to_illustrated_chapter_format
    parent_approval_required: true
```

## Meaning configuration

```yaml
meaning:
  enabled: true
  theme:
    preset: honesty
    custom: null

  approach: lived_experience
  explicitness: gentle
  desired_aftertaste: [hopeful, thoughtful]
  discussion_prompts: optional

  avoid:
    - punishment_focused_ending
    - narrator_lecture
```

Supported approaches:

- `lived_experience`: value emerges through emotion, action, and consequence.
- `dialogic_question`: story intentionally leaves competing perspectives to discuss.
- `positive_model`: character demonstrates a constructive choice and its benefits.
- `direct_instruction`: reserved for clearly educational formats; not the narrative default.

## Art direction

Parent-facing presets should map to structured visual properties.

```yaml
art_direction:
  id: warm_handmade_v1
  parent_label: Warm and handmade

  medium:
    primary: watercolor
    secondary: colored_pencil

  line:
    weight: soft_variable
    precision: loose

  palette:
    saturation: moderate
    emotional_arc: warm_to_cool_to_warm

  lighting:
    type: soft_natural
    contrast: low

  shape_language:
    characters: rounded
    environments: organic

  texture: visible_paper
  detail_level: medium

  avoid:
    - photorealism
    - plastic_3d_surface
    - excessive_background_detail
```

Proposed MVP parent labels:

1. Warm and handmade
2. Bold and funny
3. Magical and luminous
4. Graphic adventure
5. Quiet and emotional
6. Detailed discovery
7. Custom direction

Do not make imitation of a named living artist a product preset. Custom requests should be translated into medium, palette, line, shape, composition, era, and mood descriptors.

## Character asset

```yaml
character:
  id: maya

  identity_invariants:
    age_appearance: 8
    face_shape: round
    skin_tone: deep_brown
    hair: two_low_puffs
    body_proportions: child_realistic

  signature_features:
    - yellow_round_glasses
    - gap_between_front_teeth
    - green_satchel

  default_clothing:
    top: coral_tshirt
    bottom: denim_overalls
    footwear: red_sneakers

  allowed_changes:
    - facial_expression
    - pose
    - weather_accessories
    - story_required_costume

  reference_views:
    - front
    - three_quarter
    - side
    - back

  parent_approved: true
```

## Spread specification

```yaml
spread:
  id: 7
  story_function: difficult_choice
  visual_question: "Will Maya admit she broke the kite?"

  composition:
    shot_scale: medium_wide
    camera_angle: child_eye_level
    reading_direction: friend_to_kite_to_maya

  character_emotion:
    maya: guilt_and_hesitation
    friend: confusion

  text_job:
    - show_what_maya_says
    - withhold_complete_motivation

  visual_job:
    - reveal_hidden_torn_kite
    - show_maya_avoiding_gaze

  text_image_relation: complementary
  page_turn_type: decision
  text_safe_area: upper_left

  continuity_in:
    - kite_already_torn
    - maya_has_green_satchel
```

## Stage registry

New functionality is added through stages rather than modifications to every prompt.

```yaml
stage:
  id: bilingual_adaptation
  version: 1
  enabled_if:
    - project.languages.count > 1

  inputs:
    - approved_manuscript
    - reader_profile
    - cultural_context

  outputs:
    - adapted_manuscript

  evaluators:
    - bilingual_language_evaluator
    - layout_density_evaluator

  parent_checkpoint: optional
  maximum_iterations: 2
```

Possible future stages:

- Rhyme and meter
- Bilingual adaptation
- Nonfiction fact verification
- Pronunciation guide
- Child co-creation
- Teacher guide
- Dyslexia-oriented typography
- Audiobook narration
- Motion or interactive edition
- Human illustrator handoff

## Evaluator configuration

```yaml
evaluator_policy:
  score_scale: [0, 4]
  require_evidence: true
  require_confidence: true
  preserve_strengths: true

  structural:
    hard_floors:
      causal_coherence: 2.5
      escalation: 2.5
      earned_resolution: 2.5

  engagement:
    hard_floors:
      character_connection: 2.5
      curiosity_and_momentum: 2.5
      payoff_and_aftertaste: 2.5

  automatic_iterations: 3
  on_unresolved_failure: request_review
```

Thresholds are provisional until calibrated against expert and parent-child evaluation.

## Parent UI simplification

Parents should see:

- A short interpretation of their idea
- A few meaningful choices
- Plain-language explanations of tradeoffs
- Page-level comments
- “Keep this” and “change this” controls
- A clear indication when changing an earlier decision affects later work

Parents should not see:

- Agent names
- Raw prompt chains
- Token counts
- Unexplained numeric quality scores
- Internal model disagreement
- Technical terms such as referential cohesion or conditioning adapter

## Provider independence

Each provider adapter should implement a stable capability interface and declare limitations.

```yaml
image_provider_capabilities:
  reference_images: true
  multiple_character_references: true
  local_editing: true
  deterministic_seed: false
  transparent_background: false
  maximum_resolution: provider_defined
```

The orchestrator should plan around declared capability rather than assuming every image model supports the same controls.

## Cost and latency configuration

```yaml
production_budget:
  storyboard_quality: draft
  final_candidates_per_spread: 2
  maximum_full_spread_regenerations: 2
  prefer_local_repairs: true

  parent_approval_before:
    - final_resolution_illustrations
    - full_book_regeneration
    - paid_print_export
```

Generate expensive assets only after story, reference, and sample approval.
