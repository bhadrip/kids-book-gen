# Reader age configuration gap

## Confirmed current behavior

The V0 parent brief does not store age or reading mode. The text-provider
instructions independently hard-code ages 7–10 and parent read-aloud for story
generation and hidden quality evaluation. Consequently, a PDF alone does not
carry enough provenance to establish its intended reader, and a later reviewer
can accidentally evaluate it against a different age.

## Durable product direction

Age and reading mode must become parent-confirmed, versioned configuration.
Every generation and evaluation artifact must use and identify the same exact
configuration. Changing either value creates a successor configuration,
preserves prior approved work, and makes dependent artifacts stale.

Age-appropriate evaluation means using a documented, versioned profile that
changes expectations for causal complexity, inference, vocabulary support,
text density, participation, emotional intensity, and text-image cooperation.
It does not mean changing only a phrase in a prompt or using readability as the
sole test.

See the canonical proposed feature specification:
[`spec/10-parent-selected-reader-age.md`](../../../spec/10-parent-selected-reader-age.md).

## Evidence boundary

Age fit and engagement remain predictions until observed with children in the
intended reading context. The product must disclose profile calibration status
and must not promise comprehension, enjoyment, or behavioral effects.
