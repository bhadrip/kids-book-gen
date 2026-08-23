#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

RESULTS = {
    "not_evident", "weak", "functional", "strong", "distinctive",
    "not_applicable", "insufficient_evidence",
}
CONFIDENCE = {"low", "medium", "high"}
MODES = {
    "parent_read_aloud", "co_read", "independent_developing",
    "independent_confident",
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("report_json")
    args = parser.parse_args()
    report = json.loads(Path(args.report_json).read_text())
    try:
        require(isinstance(report, dict), "root must be an object")
        require(report.get("schemaVersion") == 1, "schemaVersion must be 1")
        require(report.get("rubricVersion") == "story-quality-text-v1", "invalid rubricVersion")
        require(report.get("readerProfileVersion") == "reader-profiles-v1", "invalid readerProfileVersion")
        artifact = report.get("artifact")
        require(isinstance(artifact, dict), "artifact must be an object")
        require(isinstance(artifact.get("title"), str) and artifact["title"].strip(), "artifact.title is required")
        require(isinstance(artifact.get("unitCount"), int) and artifact["unitCount"] > 0, "artifact.unitCount must be positive")
        digest = artifact.get("sha256")
        require(isinstance(digest, str) and len(digest) == 64 and all(c in "0123456789abcdef" for c in digest), "artifact.sha256 must be lowercase SHA-256")
        reader = report.get("reader")
        require(isinstance(reader, dict), "reader must be an object")
        require(isinstance(reader.get("age"), int) and 3 <= reader["age"] <= 10, "reader.age must be 3 through 10")
        require(reader.get("readingMode") in MODES, "invalid reader.readingMode")
        dimensions = report.get("dimensions")
        require(isinstance(dimensions, list) and dimensions, "dimensions must be non-empty")
        seen = set()
        for index, item in enumerate(dimensions, 1):
            require(isinstance(item, dict), f"dimension {index} must be an object")
            rule = item.get("ruleId")
            require(isinstance(rule, str) and rule and rule not in seen, f"dimension {index} has invalid or duplicate ruleId")
            seen.add(rule)
            require(item.get("result") in RESULTS, f"{rule} has invalid result")
            require(item.get("confidence") in CONFIDENCE, f"{rule} has invalid confidence")
            evidence = item.get("evidence")
            require(isinstance(evidence, list) and evidence, f"{rule} requires evidence")
            for evidence_item in evidence:
                require(isinstance(evidence_item, dict), f"{rule} evidence must be objects")
                require(isinstance(evidence_item.get("unit"), int) and evidence_item["unit"] > 0, f"{rule} evidence requires a positive unit")
                require(isinstance(evidence_item.get("observation"), str) and evidence_item["observation"].strip(), f"{rule} evidence requires an observation")
            require(isinstance(item.get("observation"), str) and item["observation"].strip(), f"{rule} requires an observation")
            require(isinstance(item.get("preserve"), list), f"{rule}.preserve must be an array")
        gates = report.get("hardGates")
        require(isinstance(gates, dict) and gates.get("status") in {"pass", "fail", "human_review"}, "invalid hardGates")
        require(isinstance(gates.get("failures"), list), "hardGates.failures must be an array")
        summary = report.get("summary")
        require(isinstance(summary, dict), "summary must be an object")
        require(summary.get("recommendedAction") in {"ready", "light_revision", "substantive_revision", "human_review"}, "invalid summary.recommendedAction")
        require(isinstance(summary.get("overallProfile"), str) and summary["overallProfile"].strip(), "summary.overallProfile is required")
    except ValueError as error:
        print(f"Output error: {error}")
        raise SystemExit(1)
    print("Output is valid.")


if __name__ == "__main__":
    main()
