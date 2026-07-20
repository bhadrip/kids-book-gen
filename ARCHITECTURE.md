# Architecture

**Status: V0 build in progress.** This is the living, navigable map of Kids Book
Builder. It starts at system level and links to the canonical product,
implementation, and verification details as they are introduced. Update it when
a pull request changes an architectural boundary or other documented system
behavior; see [AGENTS.md](AGENTS.md) for the required impact assessment.

## System purpose and V0 boundary

Kids Book Builder is a local-first application that helps a parent or caregiver
turn an original idea into a personalized illustrated children's book. V0 runs
on one developer laptop and stores projects locally. It deliberately excludes
accounts, shared infrastructure, staging, and production hosting.

The authoritative V0 product decisions and research are indexed in
[spec/README.md](spec/README.md). The active delivery plan is
[tasks/mlp-v0.md](tasks/mlp-v0.md).

## System context

```mermaid
flowchart LR
  Parent[Parent or caregiver] --> App[Kids Book Builder\nlocal Next.js app]
  App --> LocalData[(Local project artifacts\ndata/projects)]
  App --> TextProvider[Text provider adapter]
  App --> ImageProvider[Image provider adapter]
  App --> PdfRenderer[PDF renderer adapter]
  TextProvider --> Model[Configured model provider]
  ImageProvider --> Model
  PdfRenderer --> Proof[Local PDF proof]
```

Provider integrations are planned seams, not yet a reason to couple UI or domain
logic to an SDK. The provider, filesystem, clock, and ID boundaries are defined
in [development.md](development.md).

## Product flow

```mermaid
flowchart LR
  Idea[Parent idea and must-keep details] --> Directions[Story directions]
  Directions --> Story[Approved story package]
  Story --> Visual[Approved visual sample and visual bible]
  Visual --> Production[Full-book production]
  Production --> Revision[Per-spread revision and preflight]
  Revision --> Reader[Reader and PDF proof]
  Reader --> Feedback[Pilot feedback]
```

Parent approval is a system boundary: downstream work must preserve approved
details unless the parent explicitly reopens the decision. Artifact lifecycle,
staleness, and provenance requirements are specified in
[development.md](development.md) and will be implemented in the domain model.

## Application architecture

```mermaid
flowchart LR
  UI[UI and route handlers] --> Services[Application services]
  Services --> Domain[Domain schemas and rules]
  Services --> Adapters[Adapters]
  Adapters --> Repo[ProjectRepository]
  Adapters --> Store[ArtifactStore]
  Adapters --> Jobs[JobRunner]
  Adapters --> Text[TextProvider]
  Adapters --> Images[ImageProvider]
  Adapters --> PDF[PdfRenderer]
```

Dependency direction is one-way: UI/routes call application services; application
services coordinate domain rules and adapters; provider SDKs and filesystem
details remain inside adapters. This is the canonical high-level representation
of the code boundaries defined in [development.md](development.md).

## Current implementation status

Foundation and local quality tooling are complete. The domain model, project
storage, parent workflow, provider adapters, full-book production, reader, and
PDF export are planned V0 slices. The authoritative task status and evidence
remain in [tasks/mlp-v0.md](tasks/mlp-v0.md), rather than being duplicated here.

## Architectural invariants

- Product and domain rules do not depend on Next.js, React, local files, or an
  OpenAI SDK.
- All untrusted boundaries are validated; persisted artifacts are schema-versioned.
- Local project data and secrets are not committed to Git.
- Normal verification does not call paid model APIs.
- Approved work is preserved through successor artifacts and explicit staleness.
- Automated tests establish correctness; parent review establishes product
  acceptance.

## Detail map

| Concern | Canonical detail |
| --- | --- |
| Product research, decisions, and terminology | [spec/README.md](spec/README.md) |
| Quality gates, setup, architecture seams, and testing | [development.md](development.md) |
| Agent delivery workflow and context model | [agenticsdlc.md](agenticsdlc.md) |
| Current feature/task status | [tasks/mlp-v0.md](tasks/mlp-v0.md) |
| Durable non-obvious decisions | `spec/adr/` when introduced |
| Executable behavior | Source, Zod schemas, and tests |

## Architecture change log

| Date | Change | Evidence |
| --- | --- | --- |
| 2026-07-20 | Established the living V0 architecture map and architecture-impact policy. | `AGENTS.md`, `agenticsdlc.md` |
