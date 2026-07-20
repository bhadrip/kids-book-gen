# Kids Book Builder

**Status: V0 build in progress.**

Kids Book Builder is a local-first application for helping parents and caregivers
turn an original idea into a high-quality, personalized illustrated children's
book. The product guides a parent through story intent, story and character
approval, visual direction, book generation, revision, reading, and PDF export.

V0 is intentionally built for local use on a developer's laptop. It does not
yet include accounts, shared infrastructure, staging, or production hosting.
The current product decisions, research, and implementation roadmap live in
[`spec/`](spec/README.md) and [`tasks/mlp-v0.md`](tasks/mlp-v0.md).
The living system map is in [ARCHITECTURE.md](ARCHITECTURE.md).

## How to contribute or run the project

Start with [local development guidance](development.md). It is the authoritative
guide to setup, supported `just` commands, architecture boundaries, local data
and secrets, testing, and the required quality gate before handoff.

For agent-assisted work, read [the agentic software delivery guide](agenticsdlc.md).
It explains how project context is organized, how to write a PM-ready feature
request, and how agents should plan, implement, verify, and escalate work.

## Project principles

- Preserve the parent's original idea and approved decisions throughout the
  creation process.
- Build one runnable, testable vertical slice at a time.
- Keep domain rules independent of UI, filesystem, and model-provider details.
- Store structured, versioned artifacts rather than relying on an ever-growing
  chat transcript.
- Use automated checks for correctness and parent review for product acceptance.
