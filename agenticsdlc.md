# Agentic software delivery philosophy

This repository is designed so that a product manager can request a bounded
feature and receive a working, verifiable implementation without needing to
direct the code. Coding agents are implementation collaborators, not sources of
product authority. They use the repository's versioned product knowledge,
executable constraints, and task-specific specifications to build safely.

The objective is not unsupervised change. It is to move human effort upward:
PMs decide outcomes and accept the product behavior; engineers maintain the
constraints, tools, and architectural boundaries; agents plan, implement,
verify, and document small changes.

## Core philosophy

1. **The repository is the system of record.** Product rules, architecture,
   contracts, decisions, and active plans must be discoverable in versioned
   repository artifacts. A rule that exists only in chat, a ticket comment, or
   someone's memory does not reliably exist for a future agent or teammate.
2. **Context is curated, not accumulated.** Prefer a short map and precise
   links over a single exhaustive instruction file. Load the task, its domain
   rules, and nearby examples first; retrieve deeper material only when needed.
3. **Specifications describe intent; tests and checks enforce it.** Natural
   language guides judgment, but automated checks define the minimum bar for
   correctness. A passing test suite is necessary, not sufficient: a PM still
   accepts observable behavior against the feature's scenarios.
4. **Guardrails define freedom.** Enforce boundaries, schemas, security, and
   quality centrally. Within those boundaries, agents may choose a simple,
   maintainable implementation rather than asking for approval at every line.
5. **Small vertical slices are the unit of autonomy.** A feature must be
   runnable and demonstrable as a bounded user outcome. Do not give an agent a
   broad initiative whose product decisions, interfaces, and dependencies are
   still unresolved.
6. **Every failure improves the harness.** When an agent lacks context or makes
   a repeatable mistake, add the missing test, documentation, command, fixture,
   lint, or template. Do not rely on repeating a better prompt next time.
7. **Preserve approved work and decisions.** Follow the artifact lifecycle in
   `development.md`: create successor artifacts and mark dependents stale rather
   than silently overwriting parent-approved work.

## Context architecture

`AGENTS.md`, if introduced, is the entry point rather than an encyclopedia. It
should remain short and link to the material below. `development.md` is the
current local-development contract and takes precedence for engineering work.

```text
AGENTS.md (map, commands, invariants, escalation)
  -> development.md (environment, seams, verification rules)
  -> spec/README.md (product-specification map and terminology)
  -> spec/<domain documents> (durable product rules and research)
  -> tasks/<feature>.md (current bounded implementation request)
  -> source + tests (existing executable behavior and examples)
```

Maintain this distinction:

| Artifact | Source of truth for | Keep it useful by |
| --- | --- | --- |
| `spec/` | Product rules, research, domain vocabulary, and configurable decisions | Index documents; link rules to relevant schemas/tests; update when a product decision changes. |
| `development.md` | Tooling, architecture, local data/secrets, and test contract | Keep commands executable and constraints concrete. |
| `tasks/` | The currently requested, bounded feature or change | State outcome, scope, acceptance scenarios, dependencies, and evidence. |
| Source, schemas, and tests | Actual executable behavior | Use clear domain names and tests that demonstrate business rules. |
| Decision records (add under `spec/adr/` when needed) | Durable, non-obvious technical or product tradeoffs | Record context, decision, alternatives, consequences, and review date. |

Do not copy the same rule into every file. Keep one canonical source and link to
it. Remove or mark superseded guidance promptly. Stale documentation is worse
than absent documentation because it creates confident, incorrect work.

### Architecture as a living map

[`ARCHITECTURE.md`](ARCHITECTURE.md) is the repository's navigable, living map
of the system. It starts with purpose and boundaries, then links progressively
to feature domains, components, data flows, contracts, decisions, and
executable evidence. It is a map rather than a duplicate product specification:
link to canonical low-level details instead of copying them into architecture
documentation.

Before a non-trivial change, read the relevant architecture section and linked
domain documents. Do not infer a new cross-domain pattern from local code alone.

Every pull request must assess its architecture impact:

- **None:** explain why the change remains inside documented boundaries.
- **Updated:** update `ARCHITECTURE.md` and any affected canonical detail, such
  as a feature specification, ADR, schema/contract, runbook, or test.

Update architecture documentation when a change affects a user journey, feature
boundary, domain responsibility, dependency direction, interface, data model or
lifecycle, external integration, trust boundary, runtime behavior, or operational
constraint. Keep diagrams as versioned text, preferably Mermaid. For V0 this is
a required PR checklist item; changes marked **Updated** should receive relevant
engineer or code-owner review.

## Feature request contract

A PM request must be understandable without implementation knowledge. The agent
may research the codebase and create a plan, but must not invent unresolved
product policy. Use this shape in `tasks/<feature>.md` or a feature-specific
folder when the work is substantial:

```md
# Feature: <short outcome-oriented name>

## Outcome and user
As a <user>, I can <do something> so that <benefit>.

## In scope
- Observable behavior included in this delivery.

## Out of scope
- Explicitly deferred behavior and adjacent requests.

## Rules and constraints
- Business rules, permissions, limits, privacy/safety requirements, and
  existing product decisions the implementation must preserve.

## Acceptance scenarios
1. Given <starting state>, when <action>, then <observable result>.
2. Include unhappy paths, empty states, boundaries, and migration behavior.

## References
- Relevant `spec/` documents, existing flows, screenshots/designs, and task IDs.

## Open questions / escalation
- Decisions that require a PM or engineer; agents must stop rather than guess.

## Evidence required for handoff
- Tests to add or update, commands to run, and how a reviewer can verify the UI.
```

Good requests state the outcome, non-goals, rules, and examples. They do not
prescribe files, libraries, or implementation steps unless that constraint is
important to the product or architecture.

## Agent delivery loop

1. **Orient.** Read `development.md`, the relevant task, linked product specs,
   adjacent source, schemas, and tests. Confirm the scope and list unresolved
   questions.
2. **Plan.** For work larger than a small fix, write a brief plan covering
   affected contracts, data/artifact changes, tests, risks, and rollback or
   recovery behavior. Keep it with the task so another agent can resume.
3. **Implement the smallest complete slice.** Respect the seams in
   `development.md`; do not bypass an adapter, schema, or approval gate merely
   to make the happy path work.
4. **Verify.** Add or update the test that proves each acceptance scenario.
   Run focused checks while iterating, then the required handoff checks. For UI
   work, run focused Playwright coverage and retain failure evidence.
5. **Hand off with evidence.** Summarize behavior, files changed, commands and
   results, user-visible verification steps, migration/configuration needs, and
   known limitations. Update the task/spec only when a durable decision or
   feature fact has changed.
6. **Escalate deliberately.** Stop when product policy is ambiguous, a change
   crosses a protected boundary, a security/privacy issue appears, or bounded
   retries do not resolve a failure. Report evidence and choices; do not make a
   broad speculative rewrite.

## Executable guardrails

Agents are reliable when important constraints are machine-checkable.

- Use Zod at untrusted boundaries and version persisted artifacts.
- Keep domain logic independent of UI routes, filesystem details, clocks, IDs,
  and model-provider SDKs as specified in `development.md`.
- Write unit/integration tests for domain rules and adapters; write Playwright
  tests for complete parent-visible journeys.
- Keep `just ci` as the authoritative local quality gate. It must remain
  reproducible, must not require paid model calls, and must not modify tracked
  files.
- Do not weaken a test, add `skip`/`only`, suppress a type error, or bypass a
  task recipe to obtain a green result.
- Treat configuration, persisted JSON, provider output, and user input as
  untrusted. Do not expose secrets, log them, or place them in client code.
- Prefer explicit schemas, contracts, fixtures, and dependency rules to prose
  reminders. Add custom checks only for recurring, high-value invariants.

## Review and acceptance responsibilities

| Role | Accountable for | Does not need to own |
| --- | --- | --- |
| PM | Outcome, prioritization, scope, acceptance scenarios, and product review | File layout, library selection, or implementation tactics. |
| Coding agent | Code, tests, focused plan, verification evidence, and truthful escalation | Making unresolved product-policy decisions. |
| Engineer / code owner | Architecture, security, migrations, quality gates, and exceptions | Re-explaining documented rules or manually repeating routine checks. |

For this V0 repository, the PM acceptance surface is the local runnable app and
the requested verification evidence; there is intentionally no staging or
production deployment. When hosted delivery is introduced, each pull request
should provide an isolated preview URL, seeded review data, an acceptance
checklist, CI status, feature-flag state, and rollback notes. Production must
remain protected by required checks and human approval appropriate to risk.

## Managing recurring difficulties

| Difficulty | Response |
| --- | --- |
| Ambiguous feature request | Improve scenarios, non-goals, and rules; put genuine unresolved choices in escalation rather than allowing guesses. |
| Too much context | Shorten maps, index canonical docs, link by domain, and retrieve progressively. |
| Spec/code drift | Require task/spec updates when decisions change; cross-link tests and docs; schedule small documentation cleanup work. |
| Agents repeat poor local patterns | Establish a golden example, refactor the pattern, and enforce it with tests or lint where valuable. |
| Environment or fixture failures | Improve `just` commands, `doctor`, deterministic fixtures, and local setup instead of adding workarounds to feature code. |
| Tests pass but the experience is wrong | Make acceptance scenarios user-observable and require PM review of the runnable flow. |
| Feature is too large | Split it into independently testable vertical slices; decide shared contracts before parallel work. |
| Review throughput becomes the bottleneck | Automate routine checks and focus human attention on product judgment, security, migrations, and boundary changes. |

## Maintenance cadence

- During each feature: update the task evidence and any durable rule affected by
  the change.
- After an agent failure or review correction: promote the lesson to the
  smallest durable artifact that prevents recurrence.
- Periodically: check links, remove stale guidance, refresh examples, and open
  focused debt/refactoring tasks. Do not let a large cleanup backlog become the
  only way to restore context quality.

This document establishes a working agreement: **make the next correct action
discoverable, bounded, testable, and reviewable.**
