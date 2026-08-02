# Book generation stages

This is the preschool-tuned version of the canonical [agent
pipeline](../../../spec/04-agent-pipeline.md).

## Stage-gated flow

1. **Reader and intent brief**
   - Capture age, reading mode, language, interests, sensitivities, purpose,
     pleasure mode, format, and parent locks.
   - Output: versioned `ProjectBrief`.
   - Gate: parent confirms the system's interpretation.

2. **Concept directions**
   - Generate two or three materially different story engines, not cosmetic
     title variants.
   - State the promise, emotional tone, fantasy/realism choice, and likely
     participation pattern.
   - Gate: parent selects or combines a direction.

3. **Story architecture**
   - Define protagonist, desire, disruption, attempts, consequences, decisive
     action, resolution, and emotional reaction.
   - Output: story bible and causal beat graph.
   - Gate: safety, agency, causality, escalation, and earned-resolution checks.

4. **Spread map**
   - Assign each spread a story job, text job, visual job, before/after state,
     page-turn question, challenge budget, and continuity requirements.
   - Gate: every spread is necessary and the full arc fits the book format.

5. **Manuscript**
   - Draft narration/dialogue for oral delivery, supported vocabulary,
     recurring language, and controlled inference.
   - Gate: recorded or human read-aloud pass plus language, engagement, and
     comprehension evaluation.

6. **Parent story approval**
   - Present the concise story, ending, spread outline, and every “must keep.”
   - Lock approved story facts. Later changes create successor artifacts and
     mark only dependents stale.

7. **Visual bible**
   - Create character model sheets, expressions, proportions, palette, medium,
     locations, props, and a continuity fact graph.
   - Gate: parent approves visual identity before expensive final art.

8. **Storyboard and sample**
   - Produce low-cost thumbnails for the entire sequence, then one or two
     near-final sample spreads with typography.
   - In the implemented parent flow, each of the 16 thumbnails contains only a
     locally drawn line sketch and the positioned final text. Selecting one
     opens a Previous/Next page reader where a parent can change the words or
     picture idea while important reference details and unchanged pages are
     preserved.
   - Story pages reuse the approved Spread Map and Emotional Arc. Their main
     action, emotional movement, visual constraints, and character expression
     drive a bounded local library of SVG poses, props, and settings, so Step 5
     adds no model call.
   - Gate: visual causality, emotional readability, sequence rhythm,
     text-image cooperation, and parent approval.

9. **Final illustrations**
   - Generate using approved references and spread-specific specifications.
   - Store prompts, model/provider versions, seeds/settings when available, and
     references.
   - Gate: identity, prop, world, action, and text-image continuity. Repair
     localized faults instead of regenerating approved siblings.

10. **Typography and layout**
    - Assemble text and image with safe areas, readable type, page turns, bleed,
      and required front/back matter.
    - Gate: no overflow, accidental image text, missing pages, or unsafe margins.

11. **Holistic proof and preflight**
    - Evaluate the complete book, not merely its parts.
    - Gate: safety, story, reader fit, visual sequence, continuity, production,
      accessibility, and parent proof approval.

12. **Export and field learning**
    - Export the approved version and retain provenance.
    - Optionally record observed reactions during real readings and use them for
      bounded revisions or evaluator calibration.

## Revision behavior

- Fix blockers before preferences.
- Change one mechanism or bounded cluster at a time.
- State what must be preserved.
- Rerun affected evaluators, then a holistic regression check.
- Cap automatic revision loops; repeated uncertainty goes to a human.
- Never silently overwrite a parent-approved artifact.
