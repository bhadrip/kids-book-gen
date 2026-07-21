# Wiki maintenance log

## 2026-07-20

- Initialized the reusable wiki structure (`raw/`, `pages/`, index, and log).
- Added a repository overview, architecture map, contributor guide, and
  delivery roadmap based on the repository at commit `8f49976`.
- Linked wiki summaries to the canonical development, architecture, product,
  task, source, and test documents.
- Removed the unreferenced `.env.sample` duplicate; `.env.example` remains the
  canonical safe environment template documented by the project.
- Implemented and documented STR-02: versioned hidden story evaluations across
  five dimensions, at most one bounded automatic successor, safe escalation,
  deterministic provider coverage, and a parent-visible test proving evaluator
  details remain hidden.
- Replaced the hidden-only evaluation policy with a parent-controlled disclosure
  showing the model call’s timestamp, outcomes, evidence, preserved strengths,
  and revision instructions while labeling results as AI predictions.
- Fixed real-provider evaluation startup by separating the strict OpenAI
  structured-output schema from the persisted domain schema's preprocessing;
  added a zero-token regression test for schema conversion.
- Added evaluation-only recovery: when a manuscript was saved before an
  evaluator failure, retry reuses that story instead of repeating the paid
  generation call.
- Replaced generic story-failure copy with persisted, safe error classification
  and a parent-facing alert that explains the failed stage, likely recovery,
  and exact saved checkpoint without exposing secrets or raw provider payloads.
