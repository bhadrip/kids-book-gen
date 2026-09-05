---
name: review-book-environment-prop-continuity
description: Evaluate environment and prop continuity across a generated children's book using deterministic 0/1/2 checks, exact artifact provenance, and page-level visual evidence. Use when asked to review a book PDF, proof, storyboard, generated page set, or illustrated sequence for location geometry, background landmarks, time, weather, lighting, important-object identity, state, ownership, transfer, movement, disappearance, or cross-page continuity.
---

# Review Book Environment and Prop Continuity

Evaluate only environment and prop continuity unless the user broadens the
scope. Diagnose observable visual evidence; do not grade personal taste or
silently alter pages.

## Choose the review mode

Use **plan-to-image fidelity** when the project supplies planning artifacts and
generated pages. Treat the plans as intended facts, not proof that the images
implemented them.

Use **proof-only continuity** when only a PDF or page images are available.
Infer a fact only after it is visibly established, label inferred expectations,
and do not claim fidelity to an unavailable plan.

Use **planning review** for a `SpreadMap`, storyboard, or `BookPlan` without final
art. Test whether continuity facts are complete and mutually compatible; mark
image-execution checks `not_evaluable`.

## Required workflow

1. Identify the exact book, proof, page, and planning-artifact revisions. Record
   missing, stale, or mismatched lineage before scoring.
2. For a PDF, use the available PDF workflow to render every relevant page and
   inspect the ordered sequence visually. Do not rely only on extracted text.
3. Read `references/evaluation-metric.md` completely before scoring.
4. Build two fact ledgers from explicit plans and observable pages:
   - environment: location, stable geometry, landmarks, entrances/exits,
     viewpoint-dependent visibility, time, weather, lighting, and persistent
     world details;
   - props: identity, defining traits, state, location, holder/owner, transfer,
     movement, damage, repair, consumption, and justified absence.
5. Evaluate every applicable page, then compare neighboring pages and the full
   sequence. Test important pages once with text hidden.
6. Distinguish contradiction from permitted change. Accept a change only when
   the story, plan, or visible action explains it.
7. Separate the likely source: story, continuity plan, spread plan, storyboard,
   illustration execution, sequence, or unknown.
8. Consolidate checks caused by one defect into one finding. Choose one primary
   domain, `environment` or `prop`, and link related domains rather than
   duplicating instructions.
9. Report successful continuity to preserve and bounded revision suggestions.
   Never regenerate, rewrite, or replace an approved artifact without explicit
   user authorization.
10. When asked to save the review, copy `assets/review-template.md`, complete
    only evidence-supported fields, and follow the repository's wiki/index/log
    rules for durable knowledge.

## Evidence and scoring rules

- Use scores `0`, `1`, and `2` exactly as defined in the metric. Use
  `not_applicable` and `not_evaluable` separately; never encode them as zero.
- Cite every non-passing result with page or spread and exact page revision.
- Describe visible evidence before interpretation.
- Give confidence as `high`, `medium`, or `low`; explain ambiguity.
- Apply hard gates independently of totals. Never average a gate failure away.
- Do not calculate an overall artistic-quality score.
- Do not treat changes caused by camera angle, perspective, occlusion, open
  doors, moving light, elapsed time, or explicit action as contradictions.
- Do not infer hidden object state, unseen room geometry, or off-page movement
  without evidence.

## Category boundaries

- Environment owns whether a setting fact is correct across pages.
- Prop owns whether an important object's identity, state, holder, or location
  is correct across pages.
- Composition owns whether correct elements are staged readably.
- Character owns identity, expression, pose, and character-carried clothing.
- Text-image owns agreement or intentional tension between words and pictures.
- Production owns resolution, trim, bleed, safe areas, overflow, and rendering.

When one observation crosses boundaries, issue one primary finding and list the
other evaluator under `relatedEvaluators` and `rerunEvaluators`.

## Output

Lead with lineage status and hard-gate status. Then provide:

1. environment and prop fact ledgers;
2. deterministic check results;
3. findings ordered by severity and reading order;
4. continuity strengths to preserve;
5. the smallest useful readiness result: `ready`, `light_revision_suggested`,
   `revision_required`, or `not_evaluable`.

Each finding must contain exact pages/revisions, domain, check IDs, expected
fact and its source, visible observation, score, confidence, hard gate, likely
source, bounded change, preserve list, success criteria, and reruns.

Keep deterministic results separate from optional higher-level artistic
comments. Use `assets/review-template.md` when a durable report is requested.
