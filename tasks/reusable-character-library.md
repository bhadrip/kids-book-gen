# Feature: Reuse approved characters across local books

## Outcome and user

As a parent using one local installation, I can reuse a previously approved
character in another book so that I do not pay to generate three equivalent
character drafts again.

## In scope

- Save a selected generated character to an adapter-backed local library.
- List saved characters at the visual-identity checkpoint.
- Copy an exact library revision into another project and generate its sample.
- Preserve origin, art-preset, model, identity, visibility, and revision data.

## Out of scope

- Accounts, authorization, hosted publication, database/S3 storage, deletion,
  editing, multiple renditions, and exact-request generation caching.

## Rules and constraints

- `private` means installation/household-private in V0.
- A destination book receives its own pinned reference copy.
- Reusing a character skips character drafts but retains the sample gate.
- Existing project artifacts and approved books are not migrated or rewritten.

## Acceptance scenarios

1. Selecting a generated design saves one validated library record and asset.
2. A second project lists that character and reuses it without creating a
   `character-designs.json` artifact.
3. Reuse records the exact library ID/revision and copies the image locally.
4. Invalid IDs and path traversal cannot read library assets.

## Architecture impact

**Updated:** introduces a cross-project artifact lifecycle and a new repository
boundary while preserving project-local downstream inputs.
