#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path

MODES = {
    "parent_read_aloud",
    "co_read",
    "independent_developing",
    "independent_confident",
}


def fail(message: str) -> None:
    raise SystemExit(f"Input error: {message}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("story_json")
    parser.add_argument("--age", required=True, type=int)
    parser.add_argument("--reading-mode", required=True)
    args = parser.parse_args()

    path = Path(args.story_json).resolve()
    if not path.is_file():
        fail(f"story file not found: {path}")
    if not 3 <= args.age <= 10:
        fail("age must be an integer from 3 through 10")
    if args.reading_mode not in MODES:
        fail(f"reading mode must be one of: {', '.join(sorted(MODES))}")

    raw = path.read_bytes()
    try:
        story = json.loads(raw)
    except json.JSONDecodeError as error:
        fail(f"invalid JSON: {error}")
    if not isinstance(story, dict):
        fail("story.json must contain a JSON object")
    title = story.get("title")
    if not isinstance(title, str) or not title.strip():
        fail("story.json must contain a non-empty title")
    spreads = story.get("spreads")
    if not isinstance(spreads, list) or not spreads:
        fail("story.json must contain a non-empty spreads array")

    units = []
    seen = set()
    for index, spread in enumerate(spreads, 1):
        if not isinstance(spread, dict):
            fail(f"spread {index} must be an object")
        number = spread.get("number", index)
        text = spread.get("text")
        if not isinstance(number, int) or number < 1 or number in seen:
            fail(f"spread {index} has an invalid or duplicate number")
        if not isinstance(text, str) or not text.strip():
            fail(f"spread {number} must contain non-empty text")
        seen.add(number)
        units.append({"unit": number, "text": text.strip()})

    age_band = "ages_3_5" if args.age <= 5 else "ages_6_7" if args.age <= 7 else "ages_8_10"
    print(json.dumps({
        "artifact": {
            "path": str(path),
            "sha256": hashlib.sha256(raw).hexdigest(),
            "title": title.strip(),
            "revision": story.get("revision"),
            "unitCount": len(units),
        },
        "reader": {
            "age": args.age,
            "ageBand": age_band,
            "readingMode": args.reading_mode,
        },
        "units": units,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
