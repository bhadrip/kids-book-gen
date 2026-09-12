# ChatGPT plugin task board

This board breaks the two plugin epics into small, independently verifiable
tasks. Statuses are **done**, **in progress**, **blocked**, or **not started**.

## Delivery sequence

```text
Epic 1: skills-only plugin
  → validate user demand and workflow reliability
  → approve hosted-product and trust decisions
Epic 2: MCP-backed production service
```

## Epic 1 — Skills-only plugin

Source epic:
[Publish the children's-book workflows as a skills-only plugin](epic-chatgpt-skills-only-plugin.md).

| ID | Task | Status | Dependency | Evidence required |
| --- | --- | --- | --- | --- |
| SKP-01 | Scaffold `kids-book-gen-studio` with compatibility and portable manifests. | **done** | None | The root portable manifest is canonical; the compatibility manifest remains a fallback and both use the same name and version. |
| SKP-02 | Add a repository marketplace entry for local installation. | **done** | SKP-01 | Marketplace validation resolves the plugin path. |
| SKP-03 | Package `preschool-behavior-story` as the first complete workflow. | **done** | SKP-01 | Plugin and packaged skill validators pass with all required resources present. |
| SKP-04 | Add fixture prompts for story creation and negative routing. | **not started** | SKP-03 | Passing fixtures cover valid, underspecified, unsafe, and out-of-scope requests. |
| SKP-05 | Add a synchronization check between canonical and packaged skills. | **not started** | SKP-03 | CI detects missing or stale packaged files. |
| SKP-06 | Package `evaluate-story-quality` and its validators. | **not started** | SKP-05 | Tavi and Turnip evaluations pass from plugin-owned resources. |
| SKP-07 | Package the available specialist book-review skills. | **not started** | SKP-05 | Each reviewer routes correctly and supports its documented fallback mode. |
| SKP-08 | Package performance, Visual Bible, proof, illustration, production-review, and revision-brief skills after they land on `main`. | **not started** | Corresponding skills merged; SKP-05 | Every transitive resource is bundled and every output contract validates. |
| SKP-09 | Add cross-skill routing and handoff evaluations. | **not started** | SKP-06–08 | The canonical workflow's positive and negative routes pass repeatedly. |
| SKP-10 | Test installation and use in fresh ChatGPT and Codex conversations. | **not started** | SKP-09 | Recorded installation, activation, fallback, and output evidence. |
| SKP-11 | Prepare public listing, policies, starter prompts, and submission cases. | **not started** | SKP-10 | Complete listing plus at least five positive and three negative cases. |
| SKP-12 | Submit the skills-only plugin and document release maintenance. | **not started** | SKP-11 | Submission receipt, release notes, and versioning runbook. |

### SKP-03 acceptance scenarios

1. Given the repository marketplace, when the plugin is validated, then its
   manifest resolves the packaged `preschool-behavior-story` skill and all
   referenced resources.
2. Given a parent request containing a desired behavior and child context, when
   the skill runs, then it performs all six development stages and returns a
   complete story package without an MCP server.
3. Given a request for a didactic compliance script or a story for an older
   audience, then the skill does not misrepresent itself as the correct
   workflow.
4. Given no host image-generation capability, then story creation remains
   complete and does not claim that illustrations were generated.

## Epic 2 — MCP-backed production service

Source epic:
[Add an MCP-backed production service](epic-chatgpt-mcp-plugin.md).

Epic 2 remains in planning until Epic 1 evidence identifies the server-backed
operations users need and the required product and trust decisions are
approved.

| ID | Task | Status | Dependency | Evidence required |
| --- | --- | --- | --- | --- |
| MCP-01 | Approve account, ownership, sharing, deletion, retention, regional, billing, and support policies. | **not started** | Epic 1 evidence | Canonical product decisions and named owners. |
| MCP-02 | Write ADRs for hosted storage, authentication, durable jobs, and provider ownership. | **not started** | MCP-01 | Approved ADRs and updated architecture map. |
| MCP-03 | Define minimal MCP use cases and strict tool contracts. | **not started** | MCP-01 | Schemas and annotations reviewed against real journeys. |
| MCP-04 | Implement authenticated project and artifact read tools. | **not started** | MCP-02–03 | Contract, authorization, and cross-user isolation tests. |
| MCP-05 | Implement successor writes, approvals, lineage, and staleness. | **not started** | MCP-04 | Lifecycle and idempotency tests. |
| MCP-06 | Implement cost estimates and durable generation jobs. | **not started** | MCP-05 | Confirmation, pause, retry, resume, and duplicate-cost tests. |
| MCP-07 | Integrate controlled character, proof, and page image generation. | **not started** | MCP-06 | Provider fixtures plus bounded real-provider provenance smoke test. |
| MCP-08 | Implement preflight and exact-revision PDF rendering. | **not started** | MCP-07 | Rendered-page and overflow verification. |
| MCP-09 | Add optional selection, approval, and progress UI. | **not started** | MCP-04–08 | Accessible state and interaction evidence. |
| MCP-10 | Complete privacy, security, abuse, and operational hardening. | **not started** | MCP-04–09 | Threat-model and security-test evidence. |
| MCP-11 | Deploy and complete OpenAI domain and tool scanning. | **not started** | MCP-10 | Stable HTTPS endpoint and clean scan results. |
| MCP-12 | Run public-review cases and submit the combined plugin. | **not started** | MCP-11 | Reviewer credentials, cases, attestations, and submission receipt. |

## Task-board maintenance

Update this board in the same change when a task starts, completes, becomes
blocked, or is split. Do not mark a task complete from prose review alone:
record the validation, test, installation, or submission evidence required by
its row.
