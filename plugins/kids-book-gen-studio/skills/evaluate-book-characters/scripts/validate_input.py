#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path

MODES = {"proof_only", "plan_to_image", "stage_gate", "regression"}
READING_MODES = {
    "parent_read_aloud", "co_read", "independent_developing",
    "independent_confident",
}
ARTIFACT_KINDS = {
    "project_brief", "story_package", "emotional_arc", "spread_map",
    "book_plan", "selected_character", "character_reference_set",
    "visual_bible", "character_performance_sheet",
    "previous_character_evaluation",
}
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}


def fail(message: str) -> None:
    raise SystemExit(f"Input error: {message}")


def resolve_file(value: object, label: str) -> Path:
    if not isinstance(value, str) or not value.strip():
        fail(f"{label} must be a non-empty path")
    path = Path(value).expanduser().resolve()
    if not path.is_file():
        fail(f"{label} not found: {path}")
    return path


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest_json")
    args = parser.parse_args()
    manifest_path = resolve_file(args.manifest_json, "manifest")
    try:
        manifest = json.loads(manifest_path.read_text())
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        fail(f"invalid manifest JSON: {error}")
    if not isinstance(manifest, dict):
        fail("manifest root must be an object")
    if manifest.get("schemaVersion") != 1:
        fail("schemaVersion must be 1")
    if manifest.get("mode") not in MODES:
        fail(f"mode must be one of: {', '.join(sorted(MODES))}")
    title = manifest.get("title")
    if not isinstance(title, str) or not title.strip():
        fail("title must be non-empty")

    reader = manifest.get("reader")
    if reader is not None:
        if not isinstance(reader, dict):
            fail("reader must be an object")
        age = reader.get("age")
        if not isinstance(age, int) or not 3 <= age <= 10:
            fail("reader.age must be an integer from 3 through 10")
        if reader.get("readingMode") not in READING_MODES:
            fail("reader.readingMode is invalid")

    source = manifest.get("visualSource")
    if not isinstance(source, dict):
        fail("visualSource must be an object")
    kind = source.get("kind")
    normalized_source: dict[str, object]
    if kind == "pdf":
        path = resolve_file(source.get("path"), "visualSource.path")
        if path.suffix.lower() != ".pdf":
            fail("visualSource.path must be a PDF")
        normalized_source = {
            "kind": "pdf", "path": str(path), "sha256": digest(path),
            "revision": source.get("revision"),
        }
    elif kind == "images":
        pages = source.get("pages")
        if not isinstance(pages, list) or not pages:
            fail("visualSource.pages must be a non-empty array")
        normalized_pages = []
        seen = set()
        for index, page in enumerate(pages, 1):
            if not isinstance(page, dict):
                fail(f"visualSource.pages[{index}] must be an object")
            page_id = page.get("pageId")
            if not isinstance(page_id, str) or not page_id.strip() or page_id in seen:
                fail(f"visualSource.pages[{index}].pageId is invalid or duplicate")
            seen.add(page_id)
            path = resolve_file(page.get("path"), f"page {page_id}")
            if path.suffix.lower() not in IMAGE_SUFFIXES:
                fail(f"page {page_id} must be PNG, JPEG, or WebP")
            normalized_pages.append({
                "pageId": page_id, "path": str(path), "sha256": digest(path),
                "revision": page.get("revision"),
            })
        normalized_source = {"kind": "images", "pages": normalized_pages}
    else:
        fail("visualSource.kind must be pdf or images")

    normalized_artifacts = []
    for index, artifact in enumerate(manifest.get("artifacts", []), 1):
        if not isinstance(artifact, dict):
            fail(f"artifact {index} must be an object")
        artifact_kind = artifact.get("kind")
        if artifact_kind not in ARTIFACT_KINDS:
            fail(f"artifact {index} has invalid kind")
        path = resolve_file(artifact.get("path"), f"artifact {artifact_kind}")
        if path.suffix.lower() == ".json":
            try:
                json.loads(path.read_text())
            except (UnicodeDecodeError, json.JSONDecodeError) as error:
                fail(f"artifact {artifact_kind} is invalid JSON: {error}")
        normalized_artifacts.append({
            "kind": artifact_kind, "path": str(path), "sha256": digest(path),
            "revision": artifact.get("revision"),
        })

    kinds = {item["kind"] for item in normalized_artifacts}
    if manifest["mode"] == "regression" and "previous_character_evaluation" not in kinds:
        fail("regression mode requires previous_character_evaluation")

    level = "proof_only"
    if {"story_package", "book_plan"}.issubset(kinds):
        level = "story_aware"
    if level == "story_aware" and {"emotional_arc", "spread_map"}.issubset(kinds):
        level = "plan_aware"
    if level == "plan_aware" and "visual_bible" in kinds and kinds.intersection(
        {"selected_character", "character_reference_set"}
    ):
        level = "reference_aware"
    if manifest["mode"] == "regression":
        level = "regression"

    print(json.dumps({
        "schemaVersion": 1,
        "mode": manifest["mode"],
        "title": title.strip(),
        "reader": reader,
        "inputCompleteness": level,
        "visualSource": normalized_source,
        "artifacts": normalized_artifacts,
        "scope": manifest.get("scope"),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
