#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path

RESULT_SCORES = {"fail": 0, "partial": 1, "pass": 2}
NULL_RESULTS = {"not_applicable", "insufficient_evidence"}
CONFIDENCE = {"low", "medium", "high"}
SOURCES = {
    "story", "emotional_plan", "spread_plan", "reference",
    "illustration", "sequence", "uncertain",
}
MODES = {"proof_only", "plan_to_image", "stage_gate", "regression"}
LEVELS = {"proof_only", "story_aware", "plan_aware", "reference_aware", "regression"}
CHECK_ID_PATTERN = r"(?:A[1-7]|B[1-6]|C[1-7]|D[1-7]|E[1-6]|F[1-7])"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def valid_sha(value: object) -> bool:
    return isinstance(value, str) and bool(re.fullmatch(r"[a-f0-9]{64}", value))


def validate_check(item: object, location: str) -> str:
    require(isinstance(item, dict), f"{location} must be an object")
    check_id = item.get("checkId")
    require(isinstance(check_id, str) and re.fullmatch(CHECK_ID_PATTERN, check_id), f"{location}.checkId is invalid")
    require(isinstance(item.get("check"), str) and item["check"].strip(), f"{location}.check is required")
    result = item.get("result")
    require(result in RESULT_SCORES or result in NULL_RESULTS, f"{location}.result is invalid")
    expected_score = RESULT_SCORES.get(result)
    require(item.get("score") == expected_score, f"{location}.score must match result")
    require(item.get("confidence") in CONFIDENCE, f"{location}.confidence is invalid")
    evidence = item.get("observedEvidence")
    require(isinstance(evidence, list) and evidence and all(isinstance(x, str) and x.strip() for x in evidence), f"{location}.observedEvidence is required")
    require(item.get("likelySource") in SOURCES, f"{location}.likelySource is invalid")
    preserve = item.get("preserve")
    rerun = item.get("rerunChecks")
    require(isinstance(preserve, list), f"{location}.preserve must be an array")
    require(isinstance(rerun, list) and all(isinstance(x, str) and re.fullmatch(CHECK_ID_PATTERN, x) for x in rerun), f"{location}.rerunChecks is invalid")
    if result in {"fail", "partial"}:
        require(isinstance(item.get("revisionInstruction"), str) and item["revisionInstruction"].strip(), f"{location} requires revisionInstruction")
        require(bool(preserve), f"{location} requires preserve items")
        require(bool(rerun), f"{location} requires rerunChecks")
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("report_json")
    args = parser.parse_args()
    try:
        report = json.loads(Path(args.report_json).read_text())
        require(isinstance(report, dict), "root must be an object")
        require(report.get("schemaVersion") == 1, "schemaVersion must be 1")
        require(report.get("rubricVersion") == "character-evaluation-v1", "rubricVersion is invalid")
        require(report.get("mode") in MODES, "mode is invalid")
        require(report.get("inputCompleteness") in LEVELS, "inputCompleteness is invalid")
        artifact = report.get("artifact")
        require(isinstance(artifact, dict), "artifact must be an object")
        require(isinstance(artifact.get("title"), str) and artifact["title"].strip(), "artifact.title is required")
        require(valid_sha(artifact.get("sha256")), "artifact.sha256 is invalid")
        require(isinstance(artifact.get("referenceInputs"), list), "artifact.referenceInputs must be an array")
        require(isinstance(artifact.get("limitations"), list), "artifact.limitations must be an array")
        characters = report.get("characters")
        require(isinstance(characters, list) and characters, "characters must be non-empty")
        character_ids = set()
        for index, character in enumerate(characters, 1):
            require(isinstance(character, dict), f"character {index} must be an object")
            character_id = character.get("characterId")
            require(isinstance(character_id, str) and character_id and character_id not in character_ids, f"character {index} has invalid or duplicate characterId")
            character_ids.add(character_id)
            require(character.get("role") in {"protagonist", "supporting"}, f"character {character_id} has invalid role")
            require(character.get("baselineAuthority") in {"approved_reference", "approved_plan", "observed_baseline"}, f"character {character_id} has invalid baselineAuthority")

        actual_counts = {"pass": 0, "partial": 0, "fail": 0, "not_applicable": 0, "insufficient_evidence": 0}
        page_results = report.get("pageResults")
        require(isinstance(page_results, list), "pageResults must be an array")
        page_ids = set()
        for page_index, page in enumerate(page_results, 1):
            require(isinstance(page, dict), f"pageResult {page_index} must be an object")
            page_id = page.get("pageId")
            require(isinstance(page_id, str) and page_id and page_id not in page_ids, f"pageResult {page_index} has invalid or duplicate pageId")
            page_ids.add(page_id)
            physical_page = page.get("physicalPageNumber")
            require(
                physical_page is None
                or (isinstance(physical_page, int) and physical_page > 0),
                f"page {page_id}.physicalPageNumber must be positive or null",
            )
            visible_label = page.get("visibleLabel")
            require(
                visible_label is None
                or (isinstance(visible_label, str) and visible_label.strip()),
                f"page {page_id}.visibleLabel must be non-empty or null",
            )
            checks = page.get("checks")
            require(isinstance(checks, list), f"page {page_id}.checks must be an array")
            seen_checks = set()
            for check_index, check in enumerate(checks, 1):
                key = (check.get("checkId"), check.get("characterId")) if isinstance(check, dict) else None
                require(key not in seen_checks, f"page {page_id} has duplicate check/character")
                seen_checks.add(key)
                result = validate_check(check, f"page {page_id} check {check_index}")
                actual_counts[result] += 1

        whole = report.get("wholeBookResults")
        require(isinstance(whole, list), "wholeBookResults must be an array")
        for index, check in enumerate(whole, 1):
            result = validate_check(check, f"wholeBookResults[{index}]")
            require(check["checkId"].startswith("F"), "whole-book checks must use F IDs")
            actual_counts[result] += 1

        gates = report.get("hardGates")
        require(isinstance(gates, dict) and gates.get("status") in {"pass", "fail", "human_review"}, "hardGates.status is invalid")
        results = gates.get("results")
        require(isinstance(results, list) and results, "hardGates.results must be non-empty")
        seen_gates = set()
        for gate in results:
            require(isinstance(gate, dict), "hard gate must be an object")
            gate_id = gate.get("gateId")
            require(isinstance(gate_id, str) and re.fullmatch(r"HG[1-6]", gate_id) and gate_id not in seen_gates, "hard gate ID is invalid or duplicate")
            seen_gates.add(gate_id)
            require(gate.get("result") in {"pass", "fail", "human_review", "not_applicable"}, f"{gate_id} result is invalid")
            require(isinstance(gate.get("evidence"), str) and gate["evidence"].strip(), f"{gate_id} requires evidence")
        if any(gate["result"] == "fail" for gate in results):
            require(gates["status"] == "fail", "hardGates.status must fail when a gate fails")
        if any(gate["result"] == "human_review" for gate in results):
            require(gates["status"] in {"human_review", "fail"}, "hardGates.status must reflect human review")

        summary = report.get("summary")
        require(isinstance(summary, dict), "summary must be an object")
        require(summary.get("status") in {"ready", "light_revision", "revision_required", "human_review"}, "summary.status is invalid")
        counts = summary.get("counts")
        require(isinstance(counts, dict), "summary.counts must be an object")
        expected_counts = {
            "pass": actual_counts["pass"],
            "partial": actual_counts["partial"],
            "fail": actual_counts["fail"],
            "notApplicable": actual_counts["not_applicable"],
            "insufficientEvidence": actual_counts["insufficient_evidence"],
        }
        require(counts == expected_counts, f"summary.counts must equal {expected_counts}")
        if actual_counts["fail"] > 0 or gates["status"] == "fail":
            require(summary["status"] == "revision_required", "failures require revision_required summary")
    except (OSError, json.JSONDecodeError, ValueError) as error:
        print(f"Output error: {error}")
        raise SystemExit(1)
    print("Output is valid.")


if __name__ == "__main__":
    main()
