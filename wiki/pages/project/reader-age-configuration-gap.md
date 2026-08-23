# Reader age configuration gap

## Implemented behavior

The studio now captures an exact age from 3 through 10 and a separate reading
mode. It maps the age to a 3–5, 6–7, or 8–10 versioned tuning profile and uses
both inputs for directions, story generation, and hidden evaluation. The
configuration is repeated at approval checkpoints and recorded on generated
text and evaluation artifacts. Legacy briefs remain readable but cannot start
new generation until the parent confirms reader details.

Dependency staleness and non-destructive reader-configuration successors remain
unimplemented.

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
