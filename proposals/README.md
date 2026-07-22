# Design Proposal Log

This directory holds design proposals that are under review or retained for
historical context. Proposals are not canonical product requirements or current
architecture merely because they are present in the repository.

The proposed lifecycle and promotion rules are described in
[DP-0003](0003-proposal-driven-sdlc/proposal.md). Until that process is
accepted, this index is a lightweight convention for reviewing the initial
related proposals in PR #12.

## Proposal index

| ID      | Proposal                                                                               | Type                     | Status   | Discussion                                                 |
| ------- | -------------------------------------------------------------------------------------- | ------------------------ | -------- | ---------------------------------------------------------- |
| DP-0001 | [Artifact-first book experience](0001-artifact-first-book-experience/proposal.md)      | Product and architecture | Proposed | [PR #12](https://github.com/bhadrip/kids-book-gen/pull/12) |
| DP-0002 | [Two-layer book source architecture](0002-two-layer-book-source/proposal.md)           | Architecture             | Proposed | [PR #12](https://github.com/bhadrip/kids-book-gen/pull/12) |
| DP-0003 | [Proposal-driven delivery and decision history](0003-proposal-driven-sdlc/proposal.md) | Process                  | Proposed | [PR #12](https://github.com/bhadrip/kids-book-gen/pull/12) |

## Reading rule

Use this directory to understand alternatives, rationale, review history, and
superseded thinking. Use the following artifacts to determine what currently
governs implementation:

- [`spec/`](../spec/README.md) for accepted product and domain rules
- `spec/adr/` for accepted, architecturally significant decisions when present
- `design/` for accepted low-level designs when introduced
- [`tasks/`](../tasks/mlp-v0.md) for active delivery scope and evidence
- [`ARCHITECTURE.md`](../ARCHITECTURE.md) for the implemented system map
- Source, schemas, and tests for executable behavior

Do not implement a proposal marked **Proposed** without a separate accepted
decision and bounded task.
