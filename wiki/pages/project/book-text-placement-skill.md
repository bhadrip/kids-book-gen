# Book text-placement skill

[`plan-book-text-placement`](../../../.agents/skills/plan-book-text-placement/SKILL.md)
plans page-specific story-text placement after the economical black-and-white
continuity proof and revalidates it on finished color art.

It consumes the one numbered master proof sheet and its exact panel mapping,
while retaining compatibility with legacy multi-sheet proofs. It crops each
recorded drawing area and excludes any exact-story review caption printed
below it. The caption is proof metadata, not a candidate placement. The skill
then overlays exact story text digitally, protects faces, gestures,
interactions, critical props, focal action, gaze/movement paths, and reveals,
and evaluates several candidate placements. The image model never renders the
story words or spread numbers.

Proof mode approves spatial intent, text capacity, reading path, and book-wide
placement rhythm. It defers final color contrast, texture, lighting, and print
reproduction. Final-art mode reruns those checks on the exact composed pages.

When production or typography values are missing, the skill may present a
matching catalog of complete parent-facing options instead of asking the parent
to invent technical measurements. The first catalog covers home-print US Letter
landscape sheets pinned at the left edge and offers balanced-overlay,
larger-read-aloud, and opaque-panel treatments. Every option exposes exact
margins, type sizes, leading, treatment, and padding. A recommendation remains
a proposal until the parent explicitly selects it; the selected values are
saved as versioned production, typography, and decision artifacts.

The skill can select a mechanically clear routine placement, but requests human
review for close alternatives, expressive or integrated typography, uncertain
protected regions, emotionally critical interactions, climaxes, page-turn
reveals, and upstream illustration or pagination changes. The final composed
book remains subject to the independent text-image production review.

## Related knowledge

- [Page-specific picture-book text placement](../concepts/page-specific-picture-book-text-placement.md)
- [Book continuity proof skill](book-continuity-proof-skill.md)
- [Text-image and production review skill](text-image-production-review-skill.md)
