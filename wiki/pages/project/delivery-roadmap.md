# Delivery roadmap

Status summarized from [`tasks/mlp-v0.md`](../../../tasks/mlp-v0.md) at commit
`8f49976` on 2026-07-20. Consult the task board for the current status.

## Current state

- Foundation and reproducible local tooling: done.
- Local project creation, validated persistence, and atomic writes: done.
- Text-only idea, directions, story revision, approval, and recovery flow: done.
- Story-quality evaluation, optional parent disclosure, and one bounded
  automatic revision: done.
- Full schema set, artifact lifecycle/staleness, and resumable job runner:
  partially implemented.

## Next priority

`VIS-01` is the next incomplete product task: define the six structured,
curated art presets that begin the visual identity and sample-spread phase.

## Later phases

1. **Visual identity:** curated art presets, image-provider boundary, character
   options, visual bible, and sample-spread approval gate.
2. **Full-book production:** budgets, sequential page generation, continuity,
   progress/resume, per-spread revision, and preflight.
3. **Reader and PDF:** fullscreen reader, shared layout, PDF rendering, and
   feedback capture.
4. **Pilot readiness:** create internal books, run family sessions, and review
   completion, fidelity, response, latency, revision patterns, and cost.

## Known incomplete foundations

- Visual, proof, and feedback schemas.
- General dependency staleness and artifact lifecycle rules.
- Per-unit job progress, automatic resume, and stop controls.
- Image and PDF adapter implementations.
- Budget accounting and persisted request provenance.
