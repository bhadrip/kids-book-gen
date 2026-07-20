# Agent guide

This file is the short entry point for humans and coding agents. It is a map,
not an encyclopedia. Follow links to the authoritative detail before changing a
domain.

## Start here

1. Read [development.md](development.md) for setup, commands, architecture
   seams, security rules, and the verification contract.
2. Read [agenticsdlc.md](agenticsdlc.md) for the product-to-agent delivery
   workflow, feature-request contract, and context-management philosophy.
3. Read [ARCHITECTURE.md](ARCHITECTURE.md) for the system map, then follow its
   links to the relevant product/domain specification in `spec/`, current task
   in `tasks/`, source, schemas, and tests.
4. Run the narrowest relevant checks while working, then the required handoff
   checks from `development.md`.

## Non-negotiable rules

- Keep changes small, runnable, testable, and within the boundaries documented
  in `development.md`.
- Do not invent unresolved product policy. State the question, relevant evidence,
  and options, then escalate to the PM or engineer.
- Do not weaken tests, add `skip`/`only`, suppress type errors, bypass task
  recipes, or expose secrets to achieve a green result.
- Preserve parent-approved artifacts. Create successor artifacts and mark
  dependent artifacts stale instead of silently overwriting approved work.

## Architecture as a living map

`ARCHITECTURE.md` is the repository's navigable, living map of the system. It
starts with purpose and boundaries, then links progressively to feature domains,
components, data flows, contracts, decisions, and executable evidence. It is a
map: link to canonical low-level details rather than duplicating them.

Before a non-trivial change, read the relevant architecture section and its
linked domain documents. Do not infer a new cross-domain pattern from local code
alone.

Every pull request must include an architecture-impact assessment:

- **None:** explain why the change remains within documented boundaries.
- **Updated:** update `ARCHITECTURE.md` and affected canonical detail such as a
  feature spec, ADR, schema/contract, runbook, or test.

Architecture updates are required when a change affects a user journey, feature
boundary, domain responsibility, dependency direction, interface, data model or
lifecycle, external integration, trust boundary, runtime behavior, or
operational constraint. Keep diagrams as versioned text, preferably Mermaid.

For V0, architecture impact is a required PR checklist item. Changes marked
**Updated** should receive the relevant engineer or code-owner review; routine
changes with no architecture impact should not create documentation churn.
