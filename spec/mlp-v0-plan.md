# MLP V0 Implementation Plan

## Product goal

Build a local-first P0 that lets a parent turn one original family or child idea into a personalized, illustrated, read-aloud storybook PDF. The product is successful when a child recognizes their idea in the book and wants to finish, reread, or extend it.

This plan implements the core flow in [spec/mlp-v0.md](spec/mlp-v0.md). It intentionally validates the lovable experience, not a configurable publishing platform or a multi-agent system.

## Confirmed assumptions

- The app runs on the developer's laptop for facilitated pilot sessions.
- Project data, source images, and generated PDFs stay on the laptop.
- Generation uses the OpenAI API through `OPENAI_API_KEY` in `.env.local`.
- The configured key is a project key, is ignored by Git, and successfully completed both a text request and a `gpt-image-2` image request on 2026-07-20.
- Use `gpt-5.6-luna` as the configurable text default and `gpt-image-2` as the configurable image default. Do not hard-code provider assumptions into product logic.
- The initial reader is ages 7–10, English, parent read-aloud, about 10 minutes, and a screen-quality PDF.
- No child-photo likeness generation, public sharing, printing, accounts, payments, or cloud deployment in P0.
- We will implement a vertical slice at a time: foundation and durable artifacts first, then the text-only approval flow, visual approval, and finally full-book production. Each slice should be runnable before the next begins.
- Use live OpenAI generation from the first functional slice, with fixtures reserved for automated tests and local development failures rather than as the primary product path.
- The parent can begin with all seven agreed entry choices: the five narrative templates below, plus “Help me choose” and “Start from scratch.”
- V0 supports the five narrative templates only. “Discover a real world” (nonfiction) and “Almost wordless visual journey” remain deferred because they need specialized evaluation and production workflows.
- Offer only the six curated art presets in V0. Do not expose a free-form custom art-direction field.
- A V0 book uses a 32-page, landscape, screen-PDF structure with cover, title/copyright front matter, approximately 13 story spreads, and closing/end matter.

## P0 scope

The parent experience is a five-step wizard:

1. **Idea** — choose a story template or “Help me choose,” then provide the original idea, protagonist, character desire, desired feeling, optional value, and exclusions.
2. **Directions** — review three meaningfully different story directions and choose one or ask for alternatives.
3. **Story** — approve characters, story promise, beginning/middle/end, a 13-spread outline, and representative lines.
4. **Look** — choose one of six curated art presets, select a character design, and approve one finished sample spread.
5. **Book** — generate a cover, title page, and approximately 13 story spreads; review them, change an individual spread when needed, read the book, and download a PDF.
6. **Feedback** — capture favorite part, confusion, completion, reread interest, and desire for another story.

The UI must retain and display the parent’s original “must keep” details at every approval checkpoint. The text is always placed separately from the generated artwork so it remains editable.

## Technology choices

| Area | P0 choice | Why |
| --- | --- | --- |
| App | Next.js, React, TypeScript, Tailwind | One local web app with a simple server layer and responsive UI. |
| Validation | Zod | Defines and validates every generation artifact. |
| Persistence | Local JSON, PNG/WebP, and PDF files | No database, migration, or hosted storage needed for single-user pilots. |
| Text generation | OpenAI Responses API | Produces structured story artifacts from schemas. |
| Images | OpenAI Image API with `gpt-image-2` | Supports character references and edits for a consistent visual identity. |
| PDF | HTML/CSS plus Playwright | Uses the same readable spread layout for web preview and PDF export. |
| Jobs | One local worker and file-backed job state | Keeps long image work resumable without Redis or a queue service. |
| Tests | Vitest and Playwright | Covers artifact logic and the end-to-end happy path. |

### Provider boundary

Create narrow adapters from the start:

```text
TextProvider.generateStructured(schema, prompt) -> typed artifact
ImageProvider.generate(request) -> local image asset
ImageProvider.edit(request) -> local image asset
```

Only the OpenAI adapter is required for P0. This preserves the option to add OpenRouter, Bedrock, or a local provider later without changing the product flow.

## Project artifacts

Persist one folder per project under `data/projects/<project-id>/`:

```text
project.json
brief.json
directions.json
story.json
visual-bible.json
character-reference.png
sample-spread.png
spreads/01.json
spreads/01.png
proof.html
proof.pdf
feedback.json
```

Each JSON artifact includes a schema version, status, source artifact IDs, prompt version, model, and generation timestamp. Preserve approved upstream artifacts; mark downstream artifacts stale when the parent changes an approved decision.

## Build sequence

### 1. Foundation and local setup

- Scaffold the Next.js application and add TypeScript, Tailwind, Zod, Vitest, and Playwright.
- Add `.env.example` with variable names only; keep `.env.local` ignored.
- Add `data/` to `.gitignore`.
- Implement app configuration for text model, image model, project root, and a per-book budget limit.

**Done when:** the app starts locally, configuration fails clearly when the key is missing, and no secret or generated project asset can be committed.

### 2. Domain model and project storage

- Define Zod schemas for `ProjectBrief`, `StoryDirection`, `StoryPackage`, `VisualBible`, `Spread`, `BookProof`, and feedback.
- Implement file-backed project creation, artifact versioning, statuses, and stale-artifact detection.
- Add a small local job runner with progress persisted to the project folder.

**Done when:** a test project can be created, resumed after an app restart, and inspected entirely from its project folder.

### 3. Idea, directions, and story approval

- Build the wizard shell and parent-friendly idea form using the five visible templates, “Help me choose,” and “Start from scratch.”
- Extract the parent’s intent into a brief and show editable “must keep” details.
- Generate exactly three distinct directions with different story engines, not cosmetic variations.
- Generate a structured story package: character records, promise, beginning/middle/end, 13-spread map, and manuscript draft.
- Run one hidden evaluation pass for idea fidelity, causal structure, age fit, oral flow, and safety. Permit one automatic revision at most.

**Done when:** a parent can approve a complete text-only story without writing prompts or seeing evaluator scores.

### 4. Visual identity and sample-spread gate

- Implement the six art presets from the specification; do not expose unrestricted style prompting.
- Generate two or three character-design options, then save the selected design as a character reference asset.
- Create a `VisualBible` with character invariants, signature props, locations, palette, and text-safe areas.
- Generate one representative illustrated spread using the approved character reference and overlay editable text in HTML/CSS.

**Done when:** the parent explicitly approves the visual identity and sample before any full-book illustration job can start.

### 5. Full-book production and local revision

- Generate the cover, title page, and 12–14 story spreads sequentially, passing the character reference and relevant continuity facts to every request.
- Show per-spread progress and save each successful output immediately.
- Provide page-level controls: keep, edit text, or regenerate image with “what to change” and “what to preserve.”
- Regenerate only the affected spread and re-render the proof; do not restart the whole book.
- Use a simple post-generation check for missing spreads, empty text, and required reference details. Parent review is the primary continuity check in P0.

**Done when:** one approved project produces a readable, complete book and a single spread can be changed without losing approved work.

### 6. Reader, PDF, and pilot feedback

- Build a fullscreen, one-spread-at-a-time reader with obvious previous/next controls.
- Render the same layout to a landscape screen-quality PDF with Playwright.
- Add the lightweight feedback moment after reading.
- Produce a local pilot summary with completion time, number of regenerations, API cost estimate, idea-fidelity rating, and reread/sequel signals.

**Done when:** a parent can download the PDF and submit feedback without leaving the app.

## Cost and quality guardrails

- Do not generate full-book artwork before story and sample-spread approval.
- Generate one candidate per final spread in P0; let the parent explicitly request a retry.
- Use medium-quality landscape output for final spreads and lower-cost outputs only for disposable drafts.
- Set a soft per-book budget of $3 and require explicit confirmation before exceeding $5.
- Keep image requests sequential for predictable cost and progress.
- Treat the current $10 prepaid balance as sufficient for the first complete book and several controlled prototype runs; track actual spend before expanding the pilot.

## Parallel work boundaries

Parallel sessions can work safely if they divide by layer:

| Lane | Owns | Avoids |
| --- | --- | --- |
| Product/UI | routes, pages, components, styles, wizard state presentation | provider implementation and artifact schema changes |
| Domain/pipeline | schemas, local storage, job runner, prompts, provider adapters | visual component styling and route layout |
| Production/QA | HTML book template, PDF rendering, test fixtures, automated tests | changing parent-facing flow without coordination |

Before merging concurrent work, retain a single source of truth for schemas and project lifecycle states. Make additive changes where possible and avoid each lane editing the same app entry files.

## Pilot validation

Create three internal books with distinctly different templates before inviting parents. Then run 8–12 facilitated family sessions and record:

- completion rate and time to approved PDF;
- parent rating that the book still feels like their original idea;
- child attention, confusion, favorite part, reread interest, and sequel interest;
- number and type of parent-requested revisions;
- API latency and actual cost per book.

The P0 has a meaningful signal if most parents complete a book without prompt-writing help, most rate idea fidelity at least 4/5, and several children ask for a reread, sequel, or another story with the character.

## Explicitly defer

- ages 3–5 and independent-reading guarantees;
- bilingual, rhyming, nonfiction, and almost-wordless formats;
- printing, ordering, marketplace, public sharing, and collaboration;
- child-photo likeness generation;
- raw agent controls, exposed evaluator scores, and autonomous multi-agent services;
- account management, deployment, hosted databases, queues, analytics platforms, and payment flows.
