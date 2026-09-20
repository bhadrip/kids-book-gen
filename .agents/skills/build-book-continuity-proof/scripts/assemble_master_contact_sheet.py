#!/usr/bin/env python3
"""Assemble one captioned continuity-proof contact sheet from PNG panels."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import math
import struct
import sys
from html import escape
from pathlib import Path
from typing import Any


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


class AssemblyError(ValueError):
    pass


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--story", required=True, type=Path)
    parser.add_argument("--spec", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--mapping", required=True, type=Path)
    return parser.parse_args()


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise AssemblyError(f"Could not read valid JSON from {path}: {error}") from error
    if not isinstance(value, dict):
        raise AssemblyError(f"{path} must contain a JSON object.")
    return value


def require_int(value: Any, name: str, minimum: int = 1) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        raise AssemblyError(f"{name} must be an integer >= {minimum}.")
    return value


def require_text(value: Any, name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise AssemblyError(f"{name} must be a non-empty string.")
    return value


def png_metadata(path: Path) -> tuple[bytes, int, int, str]:
    try:
        data = path.read_bytes()
    except OSError as error:
        raise AssemblyError(f"Could not read source PNG {path}: {error}") from error
    if len(data) < 24 or data[:8] != PNG_SIGNATURE or data[12:16] != b"IHDR":
        raise AssemblyError(f"Source image {path} is not a valid PNG with an IHDR chunk.")
    width, height = struct.unpack(">II", data[16:24])
    if width < 1 or height < 1:
        raise AssemblyError(f"Source image {path} has invalid dimensions.")
    return data, width, height, hashlib.sha256(data).hexdigest()


def approximate_text_width(text: str, font_size: int) -> float:
    units = 0.0
    narrow = " ilI.,'’‘\"“”:;!|"
    wide = "MW@%&—"
    for character in text:
        if character in narrow:
            units += 0.3
        elif character in wide:
            units += 0.9
        elif character.isupper():
            units += 0.64
        else:
            units += 0.54
    return units * font_size


def wrap_text(text: str, font_size: int, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if not current or approximate_text_width(candidate, font_size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def resolve_story(story: dict[str, Any]) -> tuple[int | None, list[dict[str, Any]]]:
    spreads = story.get("spreads")
    if not isinstance(spreads, list) or not spreads:
        raise AssemblyError("Story must contain a non-empty spreads array.")
    result: list[dict[str, Any]] = []
    for index, spread in enumerate(spreads):
        if not isinstance(spread, dict):
            raise AssemblyError(f"story.spreads[{index}] must be an object.")
        number = require_int(spread.get("number"), f"story.spreads[{index}].number")
        text = require_text(spread.get("text"), f"story.spreads[{index}].text")
        result.append({"number": number, "text": text})
    expected = list(range(1, len(result) + 1))
    actual = [spread["number"] for spread in result]
    if actual != expected:
        raise AssemblyError(f"Story spreads must be consecutive in reading order: expected {expected}, got {actual}.")
    revision = story.get("revision")
    if revision is not None:
        revision = require_int(revision, "story.revision")
    return revision, result


def pixel_box(x: int, y: int, width: int, height: int) -> dict[str, int]:
    return {"x": x, "y": y, "width": width, "height": height}


def normalized(box: dict[str, int], width: int, height: int) -> dict[str, float]:
    return {
        "x": round(box["x"] / width, 7),
        "y": round(box["y"] / height, 7),
        "width": round(box["width"] / width, 7),
        "height": round(box["height"] / height, 7),
    }


def svg_text(x: int, y: int, text: str, size: int, weight: str = "normal", fill: str = "#111111") -> str:
    return (
        f'<text x="{x}" y="{y}" font-family="Arial, Helvetica, sans-serif" '
        f'font-size="{size}" font-weight="{weight}" fill="{fill}">{escape(text)}</text>'
    )


def main() -> int:
    args = parse_args()
    if args.output.suffix.lower() != ".svg":
        raise AssemblyError("--output must end in .svg; rasterize the deterministic SVG separately when needed.")

    story = load_json(args.story.resolve())
    spec_path = args.spec.resolve()
    spec = load_json(spec_path)
    story_revision, spreads = resolve_story(story)

    if spec.get("schemaVersion") != 1:
        raise AssemblyError("spec.schemaVersion must be 1.")
    title = require_text(spec.get("title", "BLACK-AND-WHITE CONTINUITY PROOF"), "spec.title")
    subtitle = require_text(
        spec.get("subtitle", "Review text only — not final-book text placement"),
        "spec.subtitle",
    )
    columns = require_int(spec.get("columns", 4), "spec.columns")
    cell_width = require_int(spec.get("cellWidth", 1000), "spec.cellWidth", 320)
    drawing_height = require_int(spec.get("drawingHeight", 600), "spec.drawingHeight", 180)
    caption_height = require_int(spec.get("captionHeight", 300), "spec.captionHeight", 100)
    margin = require_int(spec.get("margin", 44), "spec.margin", 0)
    gap_x = require_int(spec.get("gapX", 28), "spec.gapX", 0)
    gap_y = require_int(spec.get("gapY", 34), "spec.gapY", 0)
    header_height = require_int(spec.get("headerHeight", 72), "spec.headerHeight", 40)
    card_padding = require_int(spec.get("cardPadding", 22), "spec.cardPadding", 8)
    label_height = require_int(spec.get("labelHeight", 52), "spec.labelHeight", 30)
    label_font_size = require_int(spec.get("labelFontSize", 34), "spec.labelFontSize", 12)
    caption_font_size = require_int(spec.get("captionFontSize", 30), "spec.captionFontSize", 12)
    minimum_caption_font_size = require_int(
        spec.get("minimumCaptionFontSize", 22), "spec.minimumCaptionFontSize", 10
    )
    caption_gap = require_int(spec.get("captionGap", 18), "spec.captionGap", 0)

    panels = spec.get("panels")
    if not isinstance(panels, list):
        raise AssemblyError("spec.panels must be an array.")
    expected_numbers = [spread["number"] for spread in spreads]
    actual_numbers = []
    for index, panel in enumerate(panels):
        if not isinstance(panel, dict):
            raise AssemblyError(f"spec.panels[{index}] must be an object.")
        actual_numbers.append(require_int(panel.get("spreadNumber"), f"spec.panels[{index}].spreadNumber"))
    if actual_numbers != expected_numbers:
        raise AssemblyError(
            "Spec must contain exactly one panel for every story spread in reading order: "
            f"expected {expected_numbers}, got {actual_numbers}."
        )

    card_height = card_padding * 2 + label_height + drawing_height + caption_gap + caption_height
    rows = math.ceil(len(panels) / columns)
    canvas_width = margin * 2 + columns * cell_width + max(0, columns - 1) * gap_x
    canvas_height = margin * 2 + header_height + rows * card_height + max(0, rows - 1) * gap_y

    svg: list[str] = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{canvas_width}" height="{canvas_height}" viewBox="0 0 {canvas_width} {canvas_height}" role="img">',
        f"<title>{escape(title)}</title>",
        f'<rect width="{canvas_width}" height="{canvas_height}" fill="#ffffff"/>',
        svg_text(margin, margin, title, 34, "bold"),
        svg_text(margin, margin + 30, subtitle, 20, "normal", "#333333"),
    ]
    mapping_panels: list[dict[str, Any]] = []
    spec_root = spec_path.parent

    for index, (panel, spread) in enumerate(zip(panels, spreads)):
        row, column = divmod(index, columns)
        card_x = margin + column * (cell_width + gap_x)
        card_y = margin + header_height + row * (card_height + gap_y)
        drawing_x = card_x + card_padding
        drawing_y = card_y + card_padding + label_height
        drawing_width = cell_width - card_padding * 2
        caption_x = drawing_x
        caption_y = drawing_y + drawing_height + caption_gap
        caption_width = drawing_width

        source_text = require_text(panel.get("sourceImage"), f"spec.panels[{index}].sourceImage")
        source_path = (spec_root / source_text).resolve()
        source_data, source_width, source_height, source_hash = png_metadata(source_path)
        crop = panel.get("sourceCropPixels")
        if crop is None:
            crop_x, crop_y, crop_width, crop_height = 0, 0, source_width, source_height
        else:
            if not isinstance(crop, dict):
                raise AssemblyError(f"spec.panels[{index}].sourceCropPixels must be an object.")
            crop_x = require_int(crop.get("x", 0), f"panel {index + 1} crop.x", 0)
            crop_y = require_int(crop.get("y", 0), f"panel {index + 1} crop.y", 0)
            crop_width = require_int(crop.get("width"), f"panel {index + 1} crop.width")
            crop_height = require_int(crop.get("height"), f"panel {index + 1} crop.height")
            if crop_x + crop_width > source_width or crop_y + crop_height > source_height:
                raise AssemblyError(f"Panel {index + 1} crop exceeds {source_width}x{source_height} source bounds.")

        encoded = base64.b64encode(source_data).decode("ascii")
        label = f"SPREAD {spread['number']}"
        svg.extend(
            [
                f'<rect x="{card_x}" y="{card_y}" width="{cell_width}" height="{card_height}" fill="#ffffff" stroke="#666666" stroke-width="2"/>',
                svg_text(card_x + card_padding, card_y + card_padding + label_font_size, label, label_font_size, "bold"),
                f'<svg x="{drawing_x}" y="{drawing_y}" width="{drawing_width}" height="{drawing_height}" viewBox="{crop_x} {crop_y} {crop_width} {crop_height}" preserveAspectRatio="xMidYMid meet">',
                f'<image x="0" y="0" width="{source_width}" height="{source_height}" href="data:image/png;base64,{encoded}"/>',
                "</svg>",
                f'<rect x="{drawing_x}" y="{drawing_y}" width="{drawing_width}" height="{drawing_height}" fill="none" stroke="#999999" stroke-width="1"/>',
                f'<line x1="{caption_x}" y1="{caption_y - 9}" x2="{caption_x + caption_width}" y2="{caption_y - 9}" stroke="#bbbbbb" stroke-width="1"/>',
            ]
        )

        selected_size = caption_font_size
        while True:
            lines = wrap_text(spread["text"], selected_size, caption_width)
            line_height = math.ceil(selected_size * 1.28)
            if len(lines) * line_height <= caption_height or selected_size <= minimum_caption_font_size:
                break
            selected_size -= 1
        if len(lines) * line_height > caption_height:
            raise AssemblyError(
                f"Spread {spread['number']} caption does not fit at the minimum font size. Increase captionHeight."
            )
        for line_index, line in enumerate(lines):
            baseline = caption_y + selected_size + line_index * line_height
            svg.append(svg_text(caption_x, baseline, line, selected_size))

        drawing_box = pixel_box(drawing_x, drawing_y, drawing_width, drawing_height)
        caption_box = pixel_box(caption_x, caption_y, caption_width, caption_height)
        mapping_panels.append(
            {
                "spreadId": f"spread-{spread['number']:02d}",
                "label": label,
                "reviewCaption": spread["text"],
                "reviewCaptionSourceRevision": story_revision,
                "sourceImage": source_text,
                "sourceImageDimensions": {"width": source_width, "height": source_height},
                "sourceImageSha256": source_hash,
                "sourceCropPixels": pixel_box(crop_x, crop_y, crop_width, crop_height),
                "masterDrawingBoundsPixels": drawing_box,
                "masterDrawingBoundsNormalized": normalized(drawing_box, canvas_width, canvas_height),
                "masterReviewCaptionBoundsPixels": caption_box,
                "masterReviewCaptionBoundsNormalized": normalized(caption_box, canvas_width, canvas_height),
                "reviewCaptionFontSizePixels": selected_size,
            }
        )

    svg.append("</svg>")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.mapping.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("".join(svg), encoding="utf-8")
    mapping = {
        "schemaVersion": 1,
        "assembler": "assemble_master_contact_sheet.py",
        "storyRevision": story_revision,
        "outputFilename": args.output.name,
        "pixelSize": {"width": canvas_width, "height": canvas_height},
        "rows": rows,
        "columns": columns,
        "spreadOrder": [panel["spreadId"] for panel in mapping_panels],
        "labelPolicy": "deterministic_above_drawing",
        "reviewCaptionPolicy": "deterministic_exact_story_text_below_drawing_not_final_placement",
        "accepted": False,
        "panels": mapping_panels,
    }
    args.mapping.write_text(json.dumps(mapping, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "output": str(args.output),
                "mapping": str(args.mapping),
                "spreads": len(mapping_panels),
                "pixelSize": mapping["pixelSize"],
            }
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssemblyError as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(2)
