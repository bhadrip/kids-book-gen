# Revision brief - Nora's Noticing Walk

## Provenance

- Project: 2d5fb544-4f95-4d3c-a284-33fc959f1162
- Reader: age 4, parent read-aloud
- Story 3; EmotionalArc 1; VisualBible 1; continuity proof 2; illustration sequence 1
- Reviews: emotional v1 and environment/prop v1
- Parent feedback: 2026-09-10 - avoid bordered boxes and awkward detached bands
- Brief revision: 1

## Repair items

### ILL-01

```yaml
priority: blocker
category: illustration
evidence:
  pages: [9, 10, 11, 12]
  parent_feedback: []
  evaluator_findings: [CONT-01]
root_cause_status: confirmed
primary_owner: final spread illustrations
source_artifact_revision: 1
successor_required: true
repair_instruction: Regenerate spreads 9-12 with one front-facing 2x2 four-box notebook and the exact cumulative mark state.
preserve: [character identity, acting, creek topology, wildlife, weather sequence, borderless text-safe space]
do_not_regenerate: [1, 2, 3, 4, 5, 6, 7, 8]
success_criteria: [same four-box construction on all four pages, correct mark timeline readable at contact-sheet size]
downstream_artifacts_made_stale: [final placement composites, PDF]
rerun_evaluators: [environment-prop continuity, emotional arc regression window, text-image production]
parent_decision_required: false
status: open
```

### ILL-02

```yaml
priority: high
category: illustration
evidence:
  pages: [10]
  parent_feedback: []
  evaluator_findings: [CONT-02]
root_cause_status: confirmed
primary_owner: spread 10 illustration
source_artifact_revision: 1
successor_required: true
repair_instruction: Replace autumn foliage with established green late-summer foliage while retaining dim sky and wind-flipped pale leaf undersides.
preserve: [poses, gaze, question gesture, creek geometry, text-safe region]
do_not_regenerate: [1, 2, 3, 4, 5, 6, 7, 8]
success_criteria: [season matches spreads 9 and 11, weather transition remains readable]
downstream_artifacts_made_stale: [final placement composites, PDF]
rerun_evaluators: [environment-prop continuity, text-image production]
parent_decision_required: false
status: open
```

## Dependency plan

1. Illustration wave: regenerate spreads 9-12; combine ILL-01 and ILL-02 for spread 10.
2. Review wave: inspect 8→9→10→11→12 and full-book contact sheet.
3. Layout wave: reapply approved borderless placement to exact final images and measure contrast.
4. Production wave: compose and export PDF, then run complete text-image-production review.

## Closure

- ILL-01: verified in spreads 9-12 v2 and continuity review v2.
- ILL-02: verified in spread 10 v2 and continuity review v2.
- Emotional regression: clear; no performance-plan successor required.
- Final placement/PDF: verified by text-image-production review v1.

Status: no_revision_needed; all authorized repairs are verified.
