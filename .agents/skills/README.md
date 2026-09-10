# Children's-book skill workflow

This is the canonical map of how the reusable skills in this repository fit
together. Arrows show the usual artifact handoff, not a requirement to run
every optional review on every iteration.

```mermaid
flowchart TB
    Idea["Child's interests,<br/>desired behavior,<br/>parent preferences"]

    Idea --> Story["preschool-behavior-story"]
    Story --> StoryReview["evaluate-story-quality"]
    StoryReview --> StoryGate{"Story approved?"}
    StoryGate -->|Revise| Story
    StoryGate -->|Yes| Performance["build-character-performance-plan"]

    Performance --> Bible["build-visual-bible"]
    Bible --> Proof["build-book-continuity-proof"]

    Proof --> ProofEmotion["review-book-emotional-arc"]
    Proof --> ProofProps["review-book-environment-prop-continuity"]
    ProofEmotion --> ProofBrief["build-book-revision-brief"]
    ProofProps --> ProofBrief
    ProofBrief --> ContinuityGate{"Continuity ready?"}
    ContinuityGate -->|Fix planning| Performance
    ContinuityGate -->|Yes| Illustrate["illustrate-preschool-story"]

    Illustrate --> CharacterReview["evaluate-book-characters"]
    Illustrate --> FinalEmotion["review-book-emotional-arc"]
    Illustrate --> FinalProps["review-book-environment-prop-continuity"]
    Illustrate --> ProductionReview["review-book-text-image-production"]

    CharacterReview --> FinalBrief["build-book-revision-brief"]
    FinalEmotion --> FinalBrief
    FinalProps --> FinalBrief
    ProductionReview --> FinalBrief
    FinalBrief --> FinalGate{"Book ready?"}
    FinalGate -->|Fix planning| Performance
    FinalGate -->|Fix art or layout| Illustrate
    FinalGate -->|Yes| Book["Printable book or PDF"]
```

## Keeping this map current

When adding, removing, renaming, or changing the inputs, outputs, or routing of
a skill under `.agents/skills/`, update this diagram in the same change. Check
the affected `SKILL.md` contracts rather than inferring the flow from directory
names, represent every repository skill at least once, and keep review loops and
approval gates explicit.
