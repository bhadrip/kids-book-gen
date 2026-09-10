# Book revision brief output contract

## Provenance

Record project/book ID, reader configuration, source artifact revisions,
approval states, review report revisions, parent-feedback date, and brief
revision. Never imply that direct feedback came from an automated evaluator.

## Repair item

Each root issue requires:

```yaml
id:
priority: blocker | high | medium | low
category: story | performance | visual_plan | illustration | text_image | production
evidence:
  pages: []
  parent_feedback: []
  evaluator_findings: []
root_cause_status: confirmed | likely | needs_evaluation
primary_owner:
source_artifact_revision:
successor_required: true | false
repair_instruction:
preserve: []
do_not_regenerate: []
success_criteria: []
downstream_artifacts_made_stale: []
rerun_evaluators: []
parent_decision_required: true | false
status: open | blocked | verified
```

## Dependency plan

List waves in execution order. A wave may contain independent repairs at the
same layer. Do not put dependent story, plan, image, and PDF changes into the
same wave.

## Completion gate

The brief is usable only when every item has one primary owner, a bounded repair,
preservation locks, measurable success criteria, and reruns; dependencies do not
produce work on stale artifacts; and unresolved parent decisions are explicit.
