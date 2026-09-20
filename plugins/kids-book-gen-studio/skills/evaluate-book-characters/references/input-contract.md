# Character Evaluation Input Contract

## Contents

1. Input levels
2. Manifest shape
3. Artifact authority
4. Stage-gate inputs

## Input levels

| Level | Name              | Available evidence                                           |
| ----: | ----------------- | ------------------------------------------------------------ |
|     1 | `proof_only`      | Proof PDF or ordered page images                             |
|     2 | `story_aware`     | Level 1 plus StoryPackage and BookPlan                       |
|     3 | `plan_aware`      | Level 2 plus EmotionalArc and SpreadMap                      |
|     4 | `reference_aware` | Level 3 plus VisualBible and approved character reference(s) |
|     5 | `regression`      | Level 4 plus previous evaluation and successor pages         |

The evaluator may operate with incomplete planning inputs. It must record the
actual level and must not convert missing optional inputs into book failures.

## Manifest shape

The caller may provide these fields in a JSON manifest or as equivalent prose. When
they arrive as prose, create a temporary manifest for validation; do not require the
caller to author JSON manually.

```json
{
  "schemaVersion": 1,
  "mode": "proof_only",
  "title": "The Last Little Bite",
  "reader": {
    "age": 5,
    "readingMode": "parent_read_aloud"
  },
  "visualSource": {
    "kind": "pdf",
    "path": "/absolute/path/proof.pdf",
    "revision": 1
  },
  "artifacts": [
    {
      "kind": "book_plan",
      "path": "/absolute/path/book-plan.json",
      "revision": 3
    }
  ],
  "scope": {
    "characters": ["milo", "mother"],
    "pages": ["spread-01", "spread-02"]
  }
}
```

For ordered images, use:

```json
{
  "visualSource": {
    "kind": "images",
    "pages": [
      { "pageId": "cover", "path": "/absolute/path/cover.png", "revision": 1 },
      {
        "pageId": "spread-01",
        "path": "/absolute/path/spread-01.png",
        "revision": 2
      }
    ]
  }
}
```

Allowed modes are `proof_only`, `plan_to_image`, `stage_gate`, and `regression`.
Allowed reading modes are `parent_read_aloud`, `co_read`,
`independent_developing`, and `independent_confident`.

Allowed artifact kinds are:

- `project_brief`
- `story_package`
- `emotional_arc`
- `spread_map`
- `book_plan`
- `selected_character`
- `character_reference_set`
- `visual_bible`
- `character_performance_sheet`
- `previous_character_evaluation`

Paths must exist. JSON artifacts must parse as JSON. The validator records hashes
but does not assert application-specific schemas.

Use the title visibly printed on the cover or title page as the evaluation title.
If PDF metadata differs, preserve the visible title and record the metadata mismatch
as a scope limitation. For evidence locators, treat the one-based physical PDF page
number as canonical and also record any visible label, such as `Story Spread 3`.

## Artifact authority

Use inputs in this order when facts conflict:

1. Explicit parent-approved and locked facts.
2. Approved CharacterReferenceSet or SelectedCharacter.
3. Approved VisualBible and CharacterPerformanceSheet.
4. Current approved StoryPackage, EmotionalArc, SpreadMap, and BookPlan.
5. Provisional baseline inferred from early illustrations.

Record contradictions rather than silently selecting the most convenient source.
Do not treat a proposed artifact as approved unless its status says so.

## Stage-gate inputs

| Gate                       | Minimum inputs                                                 | Applicable emphasis       |
| -------------------------- | -------------------------------------------------------------- | ------------------------- |
| Character-design selection | Story characters, VisualBible, character-design images         | A, B expression range, D3 |
| Sample-spread approval     | SelectedCharacter, sample image, SpreadMap/BookPlan entry      | A-E                       |
| BookPlan approval          | StoryPackage, EmotionalArc, SpreadMap, BookPlan, references    | Planned B-F coverage      |
| Production page            | Current page, reference(s), plan entry, adjacent approved page | A-E                       |
| Final proof                | Complete ordered pages plus available plans/references         | A-F and all gates         |
