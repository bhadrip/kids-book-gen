#!/usr/bin/env python3
"""Render deterministic proof-placement overlays and a whole-book SVG overview."""

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


class PlacementRenderError(ValueError):
    pass


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--story", required=True, type=Path)
    parser.add_argument("--spec", required=True, type=Path)
    parser.add_argument("--production-profile", required=True, type=Path)
    parser.add_argument("--typography-profile", required=True, type=Path)
    parser.add_argument("--decision", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    return parser.parse_args()


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise PlacementRenderError(f"Could not read valid JSON from {path}: {error}") from error
    if not isinstance(value, dict):
        raise PlacementRenderError(f"{path} must contain a JSON object.")
    return value


def require_text(value: Any, name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise PlacementRenderError(f"{name} must be a non-empty string.")
    return value


def require_number(value: Any, name: str, minimum: float = 0) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value < minimum:
        raise PlacementRenderError(f"{name} must be a number >= {minimum}.")
    return float(value)


def require_int(value: Any, name: str, minimum: int = 1) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        raise PlacementRenderError(f"{name} must be an integer >= {minimum}.")
    return value


def png_metadata(path: Path) -> tuple[bytes, int, int, str]:
    try:
        data = path.read_bytes()
    except OSError as error:
        raise PlacementRenderError(f"Could not read source PNG {path}: {error}") from error
    if len(data) < 24 or data[:8] != PNG_SIGNATURE or data[12:16] != b"IHDR":
        raise PlacementRenderError(f"Source image {path} is not a valid PNG with an IHDR chunk.")
    width, height = struct.unpack(">II", data[16:24])
    return data, width, height, hashlib.sha256(data).hexdigest()


def approximate_text_width(text: str, font_size: float) -> float:
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


def wrap_text(text: str, font_size: float, max_width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if not current or approximate_text_width(candidate, font_size) <= max_width:
            current = candidate
        else:
            if approximate_text_width(word, font_size) > max_width:
                raise PlacementRenderError(f"The unbreakable word {word!r} exceeds the candidate width.")
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def box(value: Any, name: str) -> dict[str, float]:
    if not isinstance(value, dict):
        raise PlacementRenderError(f"{name} must be an object.")
    result = {key: require_number(value.get(key), f"{name}.{key}") for key in ("x", "y", "width", "height")}
    if result["width"] <= 0 or result["height"] <= 0:
        raise PlacementRenderError(f"{name} must have positive width and height.")
    if result["x"] + result["width"] > 1.000001 or result["y"] + result["height"] > 1.000001:
        raise PlacementRenderError(f"{name} must fit within normalized page coordinates.")
    return result


def intersects(first: dict[str, float], second: dict[str, float]) -> bool:
    return not (
        first["x"] + first["width"] <= second["x"]
        or second["x"] + second["width"] <= first["x"]
        or first["y"] + first["height"] <= second["y"]
        or second["y"] + second["height"] <= first["y"]
    )


def contains(outer: dict[str, float], inner: dict[str, float]) -> bool:
    return (
        inner["x"] >= outer["x"]
        and inner["y"] >= outer["y"]
        and inner["x"] + inner["width"] <= outer["x"] + outer["width"]
        and inner["y"] + inner["height"] <= outer["y"] + outer["height"]
    )


def svg_text(x: float, y: float, text: str, size: float, weight: str = "normal", fill: str = "#111111") -> str:
    return (
        f'<text x="{x:.2f}" y="{y:.2f}" font-family="Arial, Helvetica, sans-serif" '
        f'font-size="{size:.2f}" font-weight="{weight}" fill="{fill}">{escape(text)}</text>'
    )


def rgba_hex(color: str, opacity: float) -> tuple[str, float]:
    if not isinstance(color, str) or len(color) != 7 or not color.startswith("#"):
        raise PlacementRenderError("Typography treatment color must use #RRGGBB.")
    try:
        int(color[1:], 16)
    except ValueError as error:
        raise PlacementRenderError("Typography treatment color must use #RRGGBB.") from error
    if not 0 <= opacity <= 1:
        raise PlacementRenderError("Typography treatment opacity must be between 0 and 1.")
    return color, opacity


def main() -> int:
    args = parse_args()
    story = load_json(args.story.resolve())
    spec_path = args.spec.resolve()
    spec = load_json(spec_path)
    production = load_json(args.production_profile.resolve())
    typography = load_json(args.typography_profile.resolve())
    decision = load_json(args.decision.resolve())

    if spec.get("schemaVersion") != 1:
        raise PlacementRenderError("spec.schemaVersion must be 1.")
    if production.get("status") != "approved" or typography.get("status") != "approved":
        raise PlacementRenderError("Production and typography profiles must both be approved.")
    if decision.get("status") != "approved":
        raise PlacementRenderError("The parent profile decision must be approved.")
    if decision.get("selectedOptionId") != typography.get("profileId"):
        raise PlacementRenderError("The decision selectedOptionId must match the typography profileId.")

    story_spreads = story.get("spreads")
    if not isinstance(story_spreads, list) or not story_spreads:
        raise PlacementRenderError("Story must contain a non-empty spreads array.")
    story_by_number: dict[int, str] = {}
    for index, spread in enumerate(story_spreads):
        if not isinstance(spread, dict):
            raise PlacementRenderError(f"story.spreads[{index}] must be an object.")
        number = require_int(spread.get("number"), f"story.spreads[{index}].number")
        story_by_number[number] = require_text(spread.get("text"), f"story.spreads[{index}].text")
    expected_numbers = list(range(1, len(story_spreads) + 1))
    if sorted(story_by_number) != expected_numbers:
        raise PlacementRenderError("Story spread numbers must be complete and consecutive.")

    sheet = production.get("sheet")
    if not isinstance(sheet, dict):
        raise PlacementRenderError("productionProfile.sheet must be an object.")
    width_inches = require_number(sheet.get("widthInches"), "productionProfile.sheet.widthInches", 1)
    height_inches = require_number(sheet.get("heightInches"), "productionProfile.sheet.heightInches", 1)
    pixels_per_inch = require_int(spec.get("pixelsPerInch", 100), "spec.pixelsPerInch", 72)
    page_width = round(width_inches * pixels_per_inch)
    page_height = round(height_inches * pixels_per_inch)

    margins = production.get("safeMarginsInches")
    if not isinstance(margins, dict):
        raise PlacementRenderError("productionProfile.safeMarginsInches must be an object.")
    safe = {
        "x": require_number(margins.get("left"), "safeMargins.left") / width_inches,
        "y": require_number(margins.get("top"), "safeMargins.top") / height_inches,
        "width": 1
        - (
            require_number(margins.get("left"), "safeMargins.left")
            + require_number(margins.get("right"), "safeMargins.right")
        )
        / width_inches,
        "height": 1
        - (
            require_number(margins.get("top"), "safeMargins.top")
            + require_number(margins.get("bottom"), "safeMargins.bottom")
        )
        / height_inches,
    }

    font_size_points = require_number(typography.get("selectedStorySizePoints"), "typography.selectedStorySizePoints", 1)
    minimum_size = require_number(typography.get("minimumStorySizePoints"), "typography.minimumStorySizePoints", 1)
    if font_size_points < minimum_size:
        raise PlacementRenderError("Selected story size is below the approved minimum.")
    font_size = font_size_points * pixels_per_inch / 72
    leading = require_number(typography.get("leadingPoints"), "typography.leadingPoints", 1) * pixels_per_inch / 72
    treatment = typography.get("treatment")
    if not isinstance(treatment, dict):
        raise PlacementRenderError("typography.treatment must be an object.")
    fill, fill_opacity = rgba_hex(
        require_text(treatment.get("color"), "typography.treatment.color"),
        require_number(treatment.get("opacity"), "typography.treatment.opacity"),
    )
    if treatment.get("border") != "none":
        raise PlacementRenderError("This renderer only supports the approved border:none treatment.")
    padding_points = treatment.get("paddingPoints")
    if not isinstance(padding_points, dict):
        raise PlacementRenderError("typography.treatment.paddingPoints must be an object.")
    padding = {
        key: require_number(padding_points.get(key), f"paddingPoints.{key}") * pixels_per_inch / 72
        for key in ("top", "right", "bottom", "left")
    }

    spread_specs = spec.get("spreads")
    if not isinstance(spread_specs, list):
        raise PlacementRenderError("spec.spreads must be an array.")
    actual_numbers = [
        require_int(item.get("spreadNumber"), f"spec.spreads[{index}].spreadNumber")
        for index, item in enumerate(spread_specs)
        if isinstance(item, dict)
    ]
    if len(actual_numbers) != len(spread_specs) or actual_numbers != expected_numbers:
        raise PlacementRenderError(
            f"Spec must contain every story spread once in order: expected {expected_numbers}, got {actual_numbers}."
        )

    output_dir = args.output_dir.resolve()
    candidate_dir = output_dir / "candidate-overlays"
    output_dir.mkdir(parents=True, exist_ok=True)
    candidate_dir.mkdir(parents=True, exist_ok=True)
    spec_root = spec_path.parent
    rendered_spreads: list[dict[str, Any]] = []
    overview_pages: list[dict[str, Any]] = []

    for index, spread_spec in enumerate(spread_specs):
        number = actual_numbers[index]
        exact_text = story_by_number[number]
        source_value = require_text(spread_spec.get("sourceImage"), f"spread {number} sourceImage")
        source_path = (spec_root / source_value).resolve()
        source_data, source_width, source_height, source_hash = png_metadata(source_path)
        encoded = base64.b64encode(source_data).decode("ascii")

        protected_value = spread_spec.get("protectedRegions", [])
        if not isinstance(protected_value, list):
            raise PlacementRenderError(f"spread {number} protectedRegions must be an array.")
        protected: list[dict[str, Any]] = []
        for region_index, region in enumerate(protected_value):
            if not isinstance(region, dict):
                raise PlacementRenderError(f"spread {number} protected region {region_index} must be an object.")
            protected.append(
                {
                    "regionId": require_text(region.get("regionId"), f"spread {number} protected region id"),
                    "class": require_text(region.get("class"), f"spread {number} protected region class"),
                    "protection": require_text(region.get("protection"), f"spread {number} protection"),
                    "boundsOrMask": box(region.get("boundsOrMask"), f"spread {number} protected region bounds"),
                    "source": region.get("source", "human_annotation"),
                    "confidence": region.get("confidence", "high"),
                }
            )

        candidates_value = spread_spec.get("candidates", [])
        if not isinstance(candidates_value, list):
            raise PlacementRenderError(f"spread {number} candidates must be an array.")
        selected_id = spread_spec.get("selectedCandidateId")
        decision_value = require_text(spread_spec.get("decision"), f"spread {number} decision")
        candidate_records: list[dict[str, Any]] = []
        selected_overview: dict[str, Any] | None = None

        for candidate_index, candidate in enumerate(candidates_value):
            if not isinstance(candidate, dict):
                raise PlacementRenderError(f"spread {number} candidate {candidate_index} must be an object.")
            candidate_id = require_text(candidate.get("candidateId"), f"spread {number} candidateId")
            candidate_box = box(candidate.get("boundsOrPolygon"), f"spread {number} candidate {candidate_id} bounds")
            rejection_reasons = candidate.get("rejectionReasons", [])
            if not isinstance(rejection_reasons, list) or not all(isinstance(reason, str) for reason in rejection_reasons):
                raise PlacementRenderError(f"spread {number} candidate {candidate_id} rejectionReasons must be strings.")

            hard_overlaps = [
                region["regionId"]
                for region in protected
                if region["protection"] == "hard" and intersects(candidate_box, region["boundsOrMask"])
            ]
            within_safe = contains(safe, candidate_box)
            inner_width = candidate_box["width"] * page_width - padding["left"] - padding["right"]
            inner_height = candidate_box["height"] * page_height - padding["top"] - padding["bottom"]
            unbreakable_overflow = False
            try:
                lines = wrap_text(exact_text, font_size, inner_width) if inner_width > 0 else []
            except PlacementRenderError:
                lines = []
                unbreakable_overflow = True
            text_height = font_size + max(0, len(lines) - 1) * leading
            capacity_pass = inner_width > 0 and not unbreakable_overflow and text_height <= inner_height

            computed_reasons = list(rejection_reasons)
            if hard_overlaps:
                computed_reasons.append(f"treatment overlaps hard-protected regions: {', '.join(hard_overlaps)}")
            if not within_safe:
                computed_reasons.append("treatment crosses approved safe margins or pinned-edge exclusion")
            if not capacity_pass:
                computed_reasons.append("exact copy does not fit at the approved type size and leading")
            computed_reasons = list(dict.fromkeys(computed_reasons))
            is_selected = selected_id == candidate_id
            if is_selected and computed_reasons:
                raise PlacementRenderError(
                    f"Spread {number} selected candidate {candidate_id} fails hard gates: {'; '.join(computed_reasons)}"
                )

            overlay_filename = f"spread-{number:02d}-candidate-{candidate_id}.svg"
            overlay_path = candidate_dir / overlay_filename
            svg = [
                f'<svg xmlns="http://www.w3.org/2000/svg" width="{page_width}" height="{page_height}" viewBox="0 0 {page_width} {page_height}" role="img">',
                f"<title>Spread {number}, candidate {escape(candidate_id)}</title>",
                '<rect width="100%" height="100%" fill="#ffffff"/>',
                f'<image x="0" y="0" width="{page_width}" height="{page_height}" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{encoded}"/>',
            ]
            rect_x = candidate_box["x"] * page_width
            rect_y = candidate_box["y"] * page_height
            rect_width = candidate_box["width"] * page_width
            rect_height = candidate_box["height"] * page_height
            svg.append(
                f'<rect x="{rect_x:.2f}" y="{rect_y:.2f}" width="{rect_width:.2f}" height="{rect_height:.2f}" rx="10" fill="{fill}" fill-opacity="{fill_opacity:.3f}"/>'
            )
            text_x = rect_x + padding["left"]
            baseline = rect_y + padding["top"] + font_size
            for line_index, line in enumerate(lines):
                svg.append(svg_text(text_x, baseline + line_index * leading, line, font_size))
            svg.append("</svg>")
            overlay_path.write_text("".join(svg), encoding="utf-8")

            record = {
                "candidateId": candidate_id,
                "boundsOrPolygon": candidate_box,
                "treatmentBounds": candidate_box,
                "rejectionReasons": computed_reasons,
                "measurements": {
                    "protectedOverlapByClass": {"hard": hard_overlaps},
                    "minimumProtectedClearance": "visually_reviewed_not_pixel_masked",
                    "minimumLocalContrast": None,
                    "contrastStatus": "deferred_to_final_art",
                    "backgroundComplexity": "proof_only",
                    "capacityStatus": "pass" if capacity_pass else "fail",
                    "trimClearance": "pass" if within_safe else "fail",
                    "gutterClearance": "pass" if within_safe else "fail",
                    "readingOrderCompatibility": candidate.get("readingOrderCompatibility", "human_review"),
                    "gazeMovementInterference": candidate.get("gazeMovementInterference", "human_review"),
                    "hierarchyInterference": candidate.get("hierarchyInterference", "human_review"),
                    "lineCount": len(lines),
                    "lines": lines,
                },
                "score": candidate.get("score"),
                "scoreVersion": candidate.get("scoreVersion", "proof-placement-v1"),
                "overlay": str(overlay_path),
            }
            candidate_records.append(record)
            if is_selected:
                selected_overview = {
                    "spreadNumber": number,
                    "candidateId": candidate_id,
                    "decision": decision_value,
                    "overlayData": "".join(svg),
                }

        if selected_id is not None and selected_overview is None:
            raise PlacementRenderError(f"Spread {number} selectedCandidateId does not name a candidate.")
        if selected_id is None and decision_value in {"selected", "human_review_required"}:
            raise PlacementRenderError(f"Spread {number} decision {decision_value} requires selectedCandidateId.")

        if selected_overview is None:
            base_svg = (
                f'<svg xmlns="http://www.w3.org/2000/svg" width="{page_width}" height="{page_height}" viewBox="0 0 {page_width} {page_height}">'
                '<rect width="100%" height="100%" fill="#ffffff"/>'
                f'<image x="0" y="0" width="{page_width}" height="{page_height}" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{encoded}"/>'
                f'<rect x="{page_width * .16:.2f}" y="{page_height * .42:.2f}" width="{page_width * .68:.2f}" height="{page_height * .16:.2f}" rx="12" fill="#fff4e8" fill-opacity=".96" stroke="#a33" stroke-width="3"/>'
                + svg_text(page_width * .20, page_height * .49, "NO SAFE PLACEMENT SELECTED", 31, "bold", "#8b1e1e")
                + svg_text(page_width * .20, page_height * .54, decision_value.replace("_", " ").upper(), 23, "normal", "#8b1e1e")
                + "</svg>"
            )
            selected_overview = {
                "spreadNumber": number,
                "candidateId": None,
                "decision": decision_value,
                "overlayData": base_svg,
            }
        overview_pages.append(selected_overview)
        rendered_spreads.append(
            {
                "spreadId": f"spread-{number:02d}",
                "sequenceIndex": number,
                "exactText": exact_text,
                "sourceImage": str(source_path),
                "sourceImageSha256": source_hash,
                "sourceImageDimensions": {"width": source_width, "height": source_height},
                "sourcePanelLabel": spread_spec.get("sourcePanelLabel", f"SPREAD {number}"),
                "sourcePanelBounds": spread_spec.get("sourcePanelBounds", "full_source_image"),
                "textConfiguration": {
                    "font": typography.get("font"),
                    "weight": typography.get("weight"),
                    "size": font_size_points,
                    "leading": typography.get("leadingPoints"),
                    "alignment": typography.get("alignment"),
                    "treatment": treatment.get("type"),
                    "border": treatment.get("border"),
                    "padding": padding_points,
                },
                "protectedRegions": protected,
                "candidates": candidate_records,
                "selectedCandidateId": selected_id,
                "decision": decision_value,
                "rationale": spread_spec.get("rationale", ""),
                "humanReviewReasons": spread_spec.get("humanReviewReasons", []),
                "preservationLocks": spread_spec.get("preservationLocks", []),
                "neighboringRegressionScope": spread_spec.get("neighboringRegressionScope", []),
            }
        )

    columns = require_int(spec.get("overviewColumns", 4), "spec.overviewColumns")
    rows = math.ceil(len(overview_pages) / columns)
    scale = require_number(spec.get("overviewScale", 0.45), "spec.overviewScale", 0.1)
    label_height = 86
    gap = 26
    margin = 40
    cell_width = page_width * scale
    cell_height = page_height * scale + label_height
    canvas_width = round(margin * 2 + columns * cell_width + max(0, columns - 1) * gap)
    canvas_height = round(margin * 2 + 78 + rows * cell_height + max(0, rows - 1) * gap)
    title = require_text(spec.get("title", "TEXT-PLACEMENT OVERVIEW"), "spec.title")
    overview = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{canvas_width}" height="{canvas_height}" viewBox="0 0 {canvas_width} {canvas_height}" role="img">',
        f"<title>{escape(title)}</title>",
        f'<rect width="{canvas_width}" height="{canvas_height}" fill="#eeeeea"/>',
        svg_text(margin, margin + 34, title, 34, "bold"),
        svg_text(margin, margin + 64, "Exact approved copy over proof art — review placement, not final color contrast", 20, "normal", "#333333"),
    ]
    for index, page in enumerate(overview_pages):
        row, column = divmod(index, columns)
        cell_x = margin + column * (cell_width + gap)
        cell_y = margin + 78 + row * (cell_height + gap)
        number = page["spreadNumber"]
        candidate_label = page["candidateId"] or "none"
        overview.append(f'<rect x="{cell_x:.2f}" y="{cell_y:.2f}" width="{cell_width:.2f}" height="{cell_height:.2f}" fill="#ffffff" stroke="#777" stroke-width="2"/>')
        overview.append(svg_text(cell_x + 12, cell_y + 30, f"SPREAD {number} · candidate {candidate_label}", 23, "bold"))
        overview.append(svg_text(cell_x + 12, cell_y + 59, str(page["decision"]).replace("_", " "), 18, "normal", "#333333"))
        inner = page["overlayData"]
        start = inner.find(">") + 1
        end = inner.rfind("</svg>")
        overview.append(
            f'<svg x="{cell_x:.2f}" y="{cell_y + label_height:.2f}" width="{cell_width:.2f}" height="{page_height * scale:.2f}" viewBox="0 0 {page_width} {page_height}">{inner[start:end]}</svg>'
        )
    overview.append("</svg>")
    overview_path = output_dir / "text-placement-overview-01.svg"
    overview_path.write_text("".join(overview), encoding="utf-8")

    status = "revision_required" if any(
        spread["decision"]
        in {"needs_reproof", "layout_revision_required", "illustration_revision_required", "pagination_revision_required", "not_evaluable"}
        for spread in rendered_spreads
    ) else "ready_for_review"
    manifest = {
        "schemaVersion": 2,
        "projectId": production.get("projectId"),
        "placementRevision": spec.get("placementRevision", 1),
        "mode": "proof_placement",
        "status": status,
        "configuration": {
            "catalogVersion": decision.get("catalogVersion"),
            "offeredOptionIds": decision.get("offeredOptionIds", []),
            "selectedOptionId": decision.get("selectedOptionId"),
            "decisionRevision": decision.get("decisionRevision"),
            "decisionStatus": decision.get("status"),
            "selectionSource": decision.get("selectionSource"),
            "decisionArtifact": str(args.decision.resolve()),
            "productionProfile": production,
            "typographyProfile": typography,
        },
        "sources": spec.get("sources", {}),
        "reading": spec.get("reading", {}),
        "spreads": rendered_spreads,
        "outputs": {
            "wholeBookOverview": str(overview_path),
            "candidateReviewSheets": [
                candidate["overlay"]
                for spread in rendered_spreads
                for candidate in spread["candidates"]
                if not candidate["rejectionReasons"]
            ],
            "finalComposites": [],
        },
        "deferredChecks": [
            "final color contrast",
            "final texture interference",
            "finished lighting",
            "home-printer reproduction",
        ],
    }
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    args.manifest.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "overview": str(overview_path),
                "manifest": str(args.manifest.resolve()),
                "status": status,
                "spreads": len(rendered_spreads),
            }
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except PlacementRenderError as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(2)
