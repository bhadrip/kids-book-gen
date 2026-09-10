# Epic: Add an MCP-backed production service to the children's-book plugin

## Status

Proposed iteration after the skills-only plugin has validated its primary user
journeys. This epic introduces hosted capabilities and therefore requires
explicit architecture, privacy, security, operations, and product decisions
before implementation.

## Outcome and user

As a parent, educator, or author, I can continue a versioned book project across
conversations, approve exact artifacts, generate consistent illustrations,
recover interrupted production, and download a finished proof so that ChatGPT
can provide the managed end-to-end experience demonstrated locally by Tavi and
the Turnip.

## Product hypothesis

Users who value the skills-only workflows will gain substantially more value
when the plugin can safely persist artifacts and perform provider-backed work.
An MCP server is justified only for operations that require live data,
authentication, authorization, durable state, binary assets, cost controls, or
controlled external actions.

## Relationship to Epic 1

Epic 1 remains the workflow and reasoning layer. This epic must not move
rubrics, decision rules, or orchestration guidance unnecessarily into MCP tool
descriptions.

```text
Skill: decides what workflow to follow and what quality means.
MCP tool: performs one authorized, validated system operation.
Service: implements domain behavior behind the tool.
Provider: performs text, image, storage, or rendering work.
```

## In scope

- Deploy a stable public HTTPS MCP endpoint.
- Authenticate users and authorize every project-scoped operation.
- Implement hosted `ProjectRepository`, `ArtifactStore`, and durable `JobRunner`
  adapters behind the existing application-service boundaries.
- Persist versioned stories, plans, references, images, reviews, decisions, and
  proofs with exact provenance.
- Expose a focused MCP tool surface for project, artifact, approval,
  generation, review-support, and export operations.
- Integrate a server-controlled OpenAI image provider with recorded model and
  request provenance.
- Support cost estimation, explicit confirmation, idempotency, pause, resume,
  retry, and partial-result recovery for expensive work.
- Render and store finished PDF proofs.
- Add optional MCP Apps UI only where visual selection, approval, sequencing,
  or progress is materially clearer than chat.
- Meet public MCP plugin review, privacy, security, metadata, and domain
  verification requirements.

## Out of scope

- Silently changing approved stories, plans, images, or proofs.
- Giving MCP tools authority to decide creative quality or product policy.
- Exposing arbitrary filesystem paths, shell execution, prompts, secrets, or
  internal provider payloads.
- Unlimited automatic regeneration.
- Training models on family content as part of this epic.
- Migrating existing local family projects without a separately approved
  import and consent design.

## Target experience

```text
Create project
→ create or import story
→ review and approve exact story revision
→ build and approve performance and visual plans
→ select and approve character reference
→ generate low-cost continuity proof
→ run specialist reviews
→ approve production scope and cost
→ generate or resume final pages
→ revise bounded pages as successors
→ approve exact complete page set
→ render and download PDF
```

## Proposed MCP tool surface

Tool names are provisional and must be validated against user journeys before
implementation.

### Project and artifact reads

| Tool | Purpose |
| --- | --- |
| `create_project` | Create a private project owned by the authenticated user. |
| `get_project` | Return project summary, current stage, and safe next action. |
| `list_project_artifacts` | Return artifact IDs, types, revisions, and status without large binary payloads. |
| `get_artifact` | Retrieve one authorized artifact or a temporary binary URL. |
| `get_current_lineage` | Return the current approved revisions and stale dependencies. |

### Controlled writes and approvals

| Tool | Purpose |
| --- | --- |
| `save_artifact` | Validate and save a numbered successor artifact. |
| `approve_artifact` | Record approval of one exact artifact revision. |
| `record_review` | Persist a specialist review against exact source revisions. |
| `create_revision_brief` | Persist a revision brief without executing its changes. |

### Provider-backed jobs

| Tool | Purpose |
| --- | --- |
| `estimate_generation` | Return page scope, provider assumptions, and estimated cost before spending. |
| `generate_character_options` | Start controlled reference-generation work. |
| `generate_continuity_proof` | Generate economical proof sheets from approved planning artifacts. |
| `generate_book_pages` | Start or resume sequential final-page production. |
| `revise_book_page` | Generate one numbered page successor while preserving siblings. |
| `get_job_status` | Return durable progress, last safe output, failure, and recovery actions. |
| `pause_job` | Prevent future units after the currently active request completes safely. |

### Export

| Tool | Purpose |
| --- | --- |
| `preflight_book` | Validate completeness, lineage, text, references, and layout prerequisites. |
| `render_book_pdf` | Render the exact approved page revisions into a stored PDF. |

## Workstreams

### MCP-1 — Product, data, and trust decisions

- Select the primary user and account model.
- Define project ownership, sharing, deletion, export, and retention policy.
- Define child and family data minimization rules.
- Decide regional availability and data-residency requirements.
- Define provider usage, cost, quotas, refunds, and abuse controls.
- Define support and incident-response ownership.
- Record decisions in canonical specifications or ADRs before implementation.

### MCP-2 — Hosted architecture

- Extract or reuse domain and application services without coupling them to the
  MCP transport.
- Implement hosted repository, binary storage, durable job, clock, and ID
  adapters.
- Preserve schema versions and exact source-revision lineage.
- Add migrations, backup, restore, deletion, and operational observability.
- Keep the existing local adapter usable unless a separate decision retires it.

### MCP-3 — MCP transport and tool contracts

- Define strict input and output schemas for every tool.
- Minimize the tool surface and keep operations composable.
- Add accurate `readOnlyHint`, `openWorldHint`, and `destructiveHint`
  annotations.
- Require authenticated project scope on every private operation.
- Add idempotency keys to mutations and expensive generation requests.
- Return user-meaningful errors and safe recovery actions without internal
  stack traces or secrets.

### MCP-4 — Image and proof production

- Select and configure explicit image models through `ImageProvider`.
- Record provider, model, snapshot when available, prompt version, request
  settings, references, timestamp, and estimated or actual cost.
- Store character references and generated pages as immutable versioned
  artifacts.
- Supply approved references and continuity facts on every relevant request.
- Support bounded page successors and preserve rejected predecessors.
- Implement deterministic PDF rendering and rendered-page inspection.

### MCP-5 — Authentication, privacy, and security

- Implement the approved authentication flow.
- Enforce authorization server-side, never through skill instructions alone.
- Encrypt data in transit and at rest where required.
- Use scoped temporary URLs for binary assets.
- Redact secrets, personal data, debug payloads, and internal identifiers from
  MCP responses.
- Threat-model prompt injection, cross-project access, insecure direct object
  references, malicious files, denial of wallet, and duplicate generation.
- Publish accurate privacy, support, and terms documentation.

### MCP-6 — Optional user interface

- Add UI only for high-value visual interactions such as character selection,
  contact-sheet review, revision approval, and job progress.
- Keep approval actions explicit and tied to exact revisions.
- Provide accessible loading, success, partial, failed, paused, and stale
  states.
- Restrict the content security policy to the minimum required domains.

### MCP-7 — Evaluation and public review

- Add contract, authorization, concurrency, recovery, and provider-fixture
  tests.
- Add end-to-end journeys with deterministic providers and isolated users.
- Run paid provider smoke tests only through an explicit, bounded recipe.
- Deploy a reviewer-accessible public HTTPS endpoint.
- Verify the MCP domain and scan all tools.
- Supply demo credentials, test cases, policy attestations, and release notes.

## Acceptance scenarios

1. Given an authenticated user, when they create a project and return in a new
   conversation, then the plugin retrieves the same validated project and
   presents its safe next action.
2. Given two users, when either requests the other's project or artifact ID,
   then the server denies access without confirming sensitive project details.
3. Given an approved story revision, when a successor story is saved, then the
   approved predecessor remains immutable and affected downstream artifacts are
   marked stale according to domain rules.
4. Given an expensive image-generation request, when the user has not confirmed
   the current estimate or exceeds policy, then generation does not start.
5. Given an approved Visual Bible and character reference, when a page is
   generated, then the request records exact source revisions, provider/model
   provenance, references, settings, timestamp, and cost information.
6. Given a production job that fails after several pages, when the user resumes,
   then completed pages remain unchanged and work restarts at the first safe
   missing or failed unit without duplicate billing.
7. Given one deficient page, when the user requests a bounded revision, then a
   numbered successor is created and all sibling pages and the predecessor are
   preserved.
8. Given a complete current page set, when any page differs from the exact set
   named by the current approval, then PDF rendering is blocked until the user
   approves the new complete set.
9. Given a valid exact-revision approval and successful preflight, when the user
   requests export, then the server returns a downloadable PDF whose pages match
   those approved revisions.
10. Given malformed, oversized, unsupported, or adversarial input, then the
    server rejects it safely without executing arbitrary code or exposing
    internal details.

## Verification and evidence

- Unit tests cover schemas, lifecycle, staleness, authorization, idempotency,
  budgets, and provider-error mapping.
- Integration tests cover hosted adapters and MCP contracts.
- End-to-end tests cover at least two isolated users and the complete recovery
  journey using deterministic providers.
- Security tests cover cross-project access, malicious files, injection into
  tool inputs, secret redaction, and duplicate-cost prevention.
- A bounded real-provider smoke test records actual model and cost provenance.
- PDF verification renders every page and checks completeness, text presence,
  and layout overflow.
- The deployed MCP server passes OpenAI tool scanning and domain verification.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Child or family data is retained unnecessarily | Minimize inputs, define retention and deletion, and expose clear user controls. |
| Image generation creates unbounded cost | Estimate first, require confirmation, enforce quotas, use idempotency, and cap retries. |
| Cross-user project leakage | Authorize every resource access and test opaque denial behavior. |
| Long-running jobs duplicate or lose work | Persist per-unit progress and use durable claims and idempotency keys. |
| Model changes reduce visual consistency | Record exact provenance, maintain reference-conditioned tests, and version provider configuration. |
| MCP tools become a second domain layer | Keep business rules in application/domain services and MCP as a transport adapter. |
| Hosted work destabilizes local V0 | Preserve existing adapter seams and test both configurations independently. |

## Dependencies and entry criteria

- Epic 1 workflow, routing, and artifact-schema evaluations are stable.
- The team has selected the high-value MCP use cases using skills-only user
  evidence.
- Account, retention, deletion, privacy, regional, billing, and support
  decisions are approved.
- Hosting, database, object storage, durable jobs, secrets, monitoring, and
  incident-response ownership are funded and assigned.
- OpenAI Platform plugin-submission access and a verified publisher identity
  are available.

## Architecture impact

**Updated.** This epic changes the deployment boundary, trust boundary,
storage model, identity model, runtime behavior, external integrations, and
operational constraints. Before implementation, update `ARCHITECTURE.md`,
`development.md`, relevant product specifications, security/privacy guidance,
artifact schemas, and one or more ADRs covering hosted storage, authentication,
jobs, and provider ownership.
