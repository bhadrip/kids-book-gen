# Page-specific picture-book text placement research

Date captured: 2026-09-09

Provenance: research memo produced in the project conversation in response to a
request about professional text placement over or alongside illustrations for
ages 3–5. This file preserves the research claims, distinctions, and source
inventory used for the project synthesis. It is not a publishing standard.

## Research conclusion

Professional picture-book composition treats words and pictures as one layout
system. Text is considered during thumbnails and roughs, set at approximately
final size, and moved or reshaped while the illustration can still be adjusted.
A nominal corner can be an early preference but is not a dependable final
placement.

A placement is acceptable only when the complete composed page remains
legible, narratively intact, compositionally coherent, and physically
producible. Passing text fit and average contrast alone is insufficient.

No authoritative source located in this research defines a universal safe
corner, universal preschool type size, maximum saliency score, or permitted
percentage of face overlap. Numerical thresholds for complexity, clearance,
candidate ranking, and treatment penalties therefore remain proposed
engineering heuristics that require calibration against professionally reviewed
spreads and physical proofs.

## Evidence-backed findings

- Professional illustrator Lynne Chapman describes obtaining text set in the
  chosen font at actual size, placing it in trim-size spread templates with the
  gutter marked, and revising thumbnail compositions around the true footprint.
  The publisher's designer may subsequently refine the placement.
- SCBWI conference coverage of art director Lauren Rille identifies composition,
  layout variety, room for type, and gutter conflicts as rough-stage concerns;
  illustrators may request a final-trim galley with placed text.
- Picture-book art direction combines typography, pacing, visual themes, art,
  and production. Placement therefore has to be evaluated at spread and book
  level, including page-turn function.
- Eye-tracking research with children aged 50–81 months found that congruent
  pictures substantially supported retelling and that children synchronized
  exploration of illustrations with narration. Other research found that
  irrelevant illustration details can divert attention and reduce comprehension
  for beginning readers. These findings support protecting narrative picture
  information, although they do not prescribe text-box geometry.
- Printer safety measurements vary. KDP specifies 0.125 in/3.2 mm bleed and,
  for bleed interiors, at least 0.375 in/9.6 mm outer margins; inside margins
  vary with page count. IngramSpark recommends 0.5 in/13 mm safety for text and
  0.125 in/3 mm bleed on the three trim edges. These are vendor requirements,
  not universal aesthetic rules.
- For applicable digital fixed-layout publications, WCAG 2.x AA and EPUB
  Accessibility 1.1 address meaningful sequence, live/accessibly represented
  text, contrast, text alternatives, structure, navigation, and metadata.
  WCAG's 4.5:1 normal-text and 3:1 qualifying-large-text contrast thresholds are
  useful measurable baselines for composed print proofs but are not a complete
  print-picture-book accessibility standard.
- Variable image backgrounds must be checked locally behind the rendered
  glyphs. Palette colors or average box luminance cannot establish stable
  contrast.

## Professional placement taxonomy

1. Natural negative space in sky, wall, floor, water, snow, or other calm art.
2. A compositional field deliberately reserved while the art is developed.
3. An upper/lower band or side column.
4. An opaque panel when stable separation from art is needed.
5. A translucent panel, local scrim, or gradient after final-composite checks.
6. A separate text area, facing page, or text page with a spot illustration.
7. Text integrated intentionally into a sign, path, wall, letter, or other
   environmental surface.
8. Expressive typography that participates in sound, action, voice, or emotion.
9. Multiple text blocks following an unambiguous visual and spoken order.
10. A deliberately silent spread when pacing and story permit it.

## Protected regions

Hard-protected by default:

- faces, especially eyes, mouth, and expression contours;
- meaning-bearing hands, arms, and gestures;
- contact and relational space between interacting characters;
- decisive actions;
- story-critical props, clues, and identity/state details;
- page-turn reveals;
- trim, fold, and gutter exclusions;
- existing meaningful lettering.

Soft-protected or strongly penalized:

- bodies and identity-defining silhouettes;
- gaze corridors between characters and targets;
- gesture extensions and movement trajectories;
- leading lines and high-saliency focal regions;
- atmosphere and negative space that creates emphasis;
- page-turn pull and the path between narration and visual referent.

The panel, scrim, gradient, halo, and padding all count as part of the visual
obstruction footprint, not only the glyph bounds.

## Proposed placement algorithm

1. Build production, subject, saliency, detail, luminance, gaze, motion, reveal,
   and intentionally quiet-region maps for the complete spread.
2. Render the exact copy across permitted type configurations and calculate the
   complete text/treatment footprint. Reject overflow, clipping, prohibited
   breaks, or type below the approved floor.
3. Generate materially different candidates from low-detail connected regions,
   largest empty rectangles, freeform polygons, bands, side columns, planned
   regions, shifted variants, contrast-treatment variants, and separate-area
   templates. Do not restrict generation to four corners.
4. Reject candidates that fail production geometry, capacity, protected-content
   clearance, local contrast, reading order, page-turn integrity, or applicable
   digital semantics.
5. Score survivors for narrative clearance, contrast, quietness, fit, reading
   order, gaze/movement compatibility, hierarchy, production robustness,
   adjacent-spread consistency/variation, and visual integration. Treat weights
   and thresholds as calibratable heuristics, not standards.
6. Render the top candidates. Select only above a calibrated threshold; require
   review for close rankings or narratively sensitive pages. Return an explicit
   layout, illustration, pagination, or manuscript revision request when none
   pass.

## Proposed fallback hierarchy

1. Reposition or reshape the text container.
2. Change legitimate line breaks, width, or alignment without shrinking below
   the approved type floor.
3. Add a restrained local fade, scrim, or panel outside protected content.
4. Use a deliberate separate text band or area.
5. Rebalance text across the spread.
6. Revise illustration composition while locking approved performance and
   continuity.
7. Revise pagination with editorial approval.
8. Revise manuscript length through the story approval process.
9. Block final approval when no acceptable solution exists.

## Automation boundary

Reliable or substantially automatable checks include production geometry, text
fit and overflow, font embedding, rendered contrast, mask intersections,
clearance, edge/entropy measures, candidate enumeration, declared reading
order, and regression comparison.

Gaze estimation, gesture significance, action paths, saliency, and hierarchy
are useful advisory signals. Human judgment remains required for narrative
importance, emotional integrity, interaction clarity, expressive typography,
page-turn payoff, aesthetic integration, book-wide rhythm, and physical-size
proof approval.

## Sources

1. Lynne Chapman, [Designing a Picture Book Spread: Placing Text](https://lynnechapman.blogspot.com/2013/09/designing-picture-book-spread-placing.html), 2013.
2. SCBWI conference coverage, [Lauren Rille—How Designers Bring Your Book to Life](https://scbwiconference.blogspot.com/2010/08/lauren-rille-how-designers-bring-your.html), 2010.
3. Laurent Linn, [Picture Book Design](https://www.laurentlinn.com/picture-book-design).
4. Zsofia K. Takacs and Adriana G. Bus, [How Pictures in Picture Storybooks Support Young Children's Story Comprehension: An Eye-Tracking Experiment](https://www.sciencedirect.com/science/article/pii/S0022096517306586), _Journal of Experimental Child Psychology_ 174, 2018.
5. Anna V. Fisher et al., [Keep It Simple: Streamlining Book Illustrations Improves Attention and Comprehension in Beginning Readers](https://www.nature.com/articles/s41539-020-00073-5), _npj Science of Learning_ 5, 2020.
6. Karen M. Feathers and Poonam Arya, [Exploring Young Children's Use of Illustrations in a Picturebook](https://journals.library.ualberta.ca/langandlit/index.php/langandlit/article/view/21455), _Language and Literacy_.
7. Amazon KDP, [Set Trim Size, Bleed, and Margins](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6).
8. IngramSpark, [File Creation Guide](https://www.ingramspark.com/hubfs/downloads/file-creation-guide.pdf?t=1539973482724).
9. W3C, [EPUB Accessibility—Fixed Layout Challenges and Best Practices](https://www.w3.org/TR/epub-fxl-a11y/).
10. W3C WAI, [Technique G17: Ensuring Contrast Against Backgrounds](https://www.w3.org/WAI/WCAG21/Techniques/general/G17.html).
11. W3C WAI, [Understanding Images of Text](https://www.w3.org/WAI/WCAG21/Understanding/images-of-text).
12. DAISY Consortium, [Reading Order—Accessible Publishing Knowledge Base](https://kb.daisy.org/publishing/docs/metadata/schema.org/accessibilityFeature/readingOrder.html).
13. W3C WAI, [Understanding Non-text Contrast](https://www.w3.org/WAI/WCAG21/understanding/non-text-contrast.html).
14. World Bank, [Guide for Writers, Illustrators, and Designers of Books for Young Readers](https://thedocs.worldbank.org/en/doc/3c02f6956bbc8428ba6b9cf8909438f9-0140012022/related/Read-Home-Writers-and-Illustrators-Guide-World-Bank.pdf), 2022.
