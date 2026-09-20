#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

RESULTS = {
    "not_evident",
    "weak",
    "functional",
    "strong",
    "distinctive",
    "not_applicable",
    "insufficient_evidence",
}
CONFIDENCE = {"low", "medium", "high"}
MODES = {
    "parent_read_aloud",
    "co_read",
    "independent_developing",
    "independent_confident",
}
TRANSITION_STATUSES = {"clear", "ambiguous", "missing", "not_applicable"}
BLOCKING_RESULTS = {"not_evident", "weak"}
REQUIRED_RULES = {
    "STRUCT-PROMISE-01",
    "STRUCT-GOAL-01",
    "STRUCT-CAUSE-01",
    "STRUCT-ESCALATION-01",
    "STRUCT-CHOICE-01",
    "STRUCT-RESOLUTION-01",
    "STRUCT-CLOSURE-01",
    "STRUCT-THROUGHLINE-01",
    "STRUCT-SPATIAL-01",
    "STRUCT-MOTIVATION-01",
    "ENGAGE-HOOK-01",
    "ENGAGE-CONNECTION-01",
    "ENGAGE-MOMENTUM-01",
    "ENGAGE-RHYTHM-01",
    "ENGAGE-PATTERN-01",
    "ENGAGE-PARTICIPATION-01",
    "ENGAGE-PAYOFF-01",
    "LANG-MODE-01",
    "LANG-ORAL-01",
    "LANG-DECODING-01",
    "LANG-REFERENTS-01",
    "LANG-VOCAB-01",
    "LANG-INFERENCE-01",
    "LANG-VOICE-01",
    "MEANING-INTEGRATION-01",
    "MEANING-CONSEQUENCE-01",
    "MEANING-PERSPECTIVE-01",
    "MEANING-ENACTMENT-01",
    "MEANING-NONPREACHY-01",
    "MEANING-DISCUSSION-01",
    "SAFE-AGE-01",
    "SAFE-AGENCY-01",
    "SAFE-REPRESENTATION-01",
    "SAFE-PUNISHMENT-01",
    "SAFE-BOUNDARY-01",
}
GATE_RULES = {
    "GATE-CAUSE": ("STRUCT-CAUSE-01",),
    "GATE-ESCALATION": ("STRUCT-ESCALATION-01",),
    "GATE-RESOLUTION": ("STRUCT-RESOLUTION-01",),
    "GATE-THROUGHLINE": ("STRUCT-THROUGHLINE-01",),
    "GATE-SPATIAL": ("STRUCT-SPATIAL-01",),
    "GATE-MOTIVATION": ("STRUCT-MOTIVATION-01",),
    "GATE-AGENCY": ("STRUCT-CHOICE-01",),
    "GATE-COMPREHENSION": ("LANG-REFERENTS-01", "LANG-INFERENCE-01"),
}
SAFETY_RULES = {
    "SAFE-AGE-01",
    "SAFE-AGENCY-01",
    "SAFE-REPRESENTATION-01",
    "SAFE-PUNISHMENT-01",
    "SAFE-BOUNDARY-01",
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def non_empty_text(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def validate_transition_check(check: object, label: str) -> str:
    require(isinstance(check, dict), f"{label} must be an object")
    status = check.get("status")
    require(status in TRANSITION_STATUSES, f"{label} has invalid status")
    require(
        non_empty_text(check.get("observation")),
        f"{label}.observation is required",
    )
    bridge = check.get("textualBridge")
    require(
        bridge is None or non_empty_text(bridge),
        f"{label}.textualBridge must be null or non-empty text",
    )
    if status == "clear":
        require(
            non_empty_text(bridge),
            f"{label} with clear status requires a textualBridge",
        )
    if status in {"missing", "not_applicable"}:
        require(
            bridge is None,
            f"{label} with {status} status requires a null textualBridge",
        )
    return status


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("report_json")
    args = parser.parse_args()
    report = json.loads(Path(args.report_json).read_text())
    try:
        require(isinstance(report, dict), "root must be an object")
        require(report.get("schemaVersion") == 1, "schemaVersion must be 1")
        require(
            report.get("rubricVersion") == "story-quality-text-v3",
            "invalid rubricVersion",
        )
        require(
            report.get("readerProfileVersion") == "reader-profiles-v1",
            "invalid readerProfileVersion",
        )

        artifact = report.get("artifact")
        require(isinstance(artifact, dict), "artifact must be an object")
        require(non_empty_text(artifact.get("title")), "artifact.title is required")
        unit_count = artifact.get("unitCount")
        require(
            isinstance(unit_count, int) and unit_count > 0,
            "artifact.unitCount must be positive",
        )
        unit_order = artifact.get("unitOrder")
        require(isinstance(unit_order, list), "artifact.unitOrder must be an array")
        require(
            len(unit_order) == unit_count,
            "artifact.unitOrder must match artifact.unitCount",
        )
        require(
            all(isinstance(unit, int) and unit > 0 for unit in unit_order),
            "artifact.unitOrder must contain positive integers",
        )
        require(
            len(set(unit_order)) == len(unit_order),
            "artifact.unitOrder must be unique",
        )
        unit_numbers = set(unit_order)
        digest = artifact.get("sha256")
        require(
            isinstance(digest, str)
            and len(digest) == 64
            and all(character in "0123456789abcdef" for character in digest),
            "artifact.sha256 must be lowercase SHA-256",
        )

        reader = report.get("reader")
        require(isinstance(reader, dict), "reader must be an object")
        require(
            isinstance(reader.get("age"), int) and 3 <= reader["age"] <= 10,
            "reader.age must be 3 through 10",
        )
        require(reader.get("readingMode") in MODES, "invalid reader.readingMode")

        transition_audit = report.get("transitionAudit")
        require(
            isinstance(transition_audit, list),
            "transitionAudit must be an array",
        )
        require(
            len(transition_audit) == max(unit_count - 1, 0),
            "transitionAudit must contain exactly one entry per adjacent unit pair",
        )
        spatial_statuses = []
        motivation_statuses = []
        for index, transition in enumerate(transition_audit):
            require(
                isinstance(transition, dict),
                f"transitionAudit[{index}] must be an object",
            )
            expected_from = unit_order[index]
            expected_to = unit_order[index + 1]
            require(
                transition.get("fromUnit") == expected_from
                and transition.get("toUnit") == expected_to,
                f"transitionAudit[{index}] must cover {expected_from} to {expected_to}",
            )
            spatial_statuses.append(
                validate_transition_check(
                    transition.get("spatialContinuity"),
                    f"transitionAudit[{index}].spatialContinuity",
                )
            )
            motivation_statuses.append(
                validate_transition_check(
                    transition.get("motivationalBridge"),
                    f"transitionAudit[{index}].motivationalBridge",
                )
            )

        dimensions = report.get("dimensions")
        require(
            isinstance(dimensions, list) and dimensions,
            "dimensions must be non-empty",
        )
        seen = set()
        results_by_rule = {}
        for index, item in enumerate(dimensions, 1):
            require(isinstance(item, dict), f"dimension {index} must be an object")
            rule = item.get("ruleId")
            require(
                isinstance(rule, str) and rule and rule not in seen,
                f"dimension {index} has invalid or duplicate ruleId",
            )
            seen.add(rule)
            require(item.get("result") in RESULTS, f"{rule} has invalid result")
            results_by_rule[rule] = item.get("result")
            require(
                item.get("confidence") in CONFIDENCE,
                f"{rule} has invalid confidence",
            )
            evidence = item.get("evidence")
            require(
                isinstance(evidence, list) and evidence,
                f"{rule} requires evidence",
            )
            for evidence_item in evidence:
                require(
                    isinstance(evidence_item, dict),
                    f"{rule} evidence must be objects",
                )
                evidence_unit = evidence_item.get("unit")
                require(
                    evidence_unit in unit_numbers,
                    f"{rule} evidence references an unknown unit",
                )
                require(
                    non_empty_text(evidence_item.get("observation")),
                    f"{rule} evidence requires an observation",
                )
            require(
                non_empty_text(item.get("observation")),
                f"{rule} requires an observation",
            )
            require(
                isinstance(item.get("preserve"), list),
                f"{rule}.preserve must be an array",
            )
            require(
                item.get("revision") is None
                or non_empty_text(item.get("revision")),
                f"{rule}.revision must be null or non-empty text",
            )

        missing_rules = sorted(REQUIRED_RULES - seen)
        extra_rules = sorted(seen - REQUIRED_RULES)
        require(
            not missing_rules,
            f"dimensions missing required rules: {', '.join(missing_rules)}",
        )
        require(
            not extra_rules,
            f"dimensions contain unknown rules: {', '.join(extra_rules)}",
        )

        spatial_result = results_by_rule["STRUCT-SPATIAL-01"]
        if "missing" in spatial_statuses:
            require(
                spatial_result in BLOCKING_RESULTS,
                "missing spatial continuity requires weak or not_evident "
                "STRUCT-SPATIAL-01",
            )
        elif "ambiguous" in spatial_statuses:
            require(
                spatial_result not in {"strong", "distinctive"},
                "ambiguous spatial continuity caps STRUCT-SPATIAL-01 at functional",
            )

        motivation_result = results_by_rule["STRUCT-MOTIVATION-01"]
        if "missing" in motivation_statuses:
            require(
                motivation_result in BLOCKING_RESULTS,
                "missing motivational bridge requires weak or not_evident "
                "STRUCT-MOTIVATION-01",
            )
        elif "ambiguous" in motivation_statuses:
            require(
                motivation_result not in {"strong", "distinctive"},
                "ambiguous motivational bridge caps STRUCT-MOTIVATION-01 at functional",
            )

        gates = report.get("hardGates")
        require(
            isinstance(gates, dict)
            and gates.get("status") in {"pass", "fail", "human_review"},
            "invalid hardGates",
        )
        failures = gates.get("failures")
        require(
            isinstance(failures, list),
            "hardGates.failures must be an array",
        )
        require(
            all(non_empty_text(item) for item in failures),
            "hardGates.failures must contain text",
        )
        expected_failures = {
            gate
            for gate, rules in GATE_RULES.items()
            if any(results_by_rule[rule] in BLOCKING_RESULTS for rule in rules)
        }
        safety_review = any(
            results_by_rule[rule]
            in BLOCKING_RESULTS | {"insufficient_evidence"}
            for rule in SAFETY_RULES
        )
        if safety_review:
            require(
                gates["status"] == "human_review",
                "safety uncertainty requires human_review",
            )
            require(
                expected_failures.issubset(set(failures)),
                "hardGates.failures omits a failed gate",
            )
        elif expected_failures:
            require(
                gates["status"] == "fail",
                "failed hard gates require fail status",
            )
            require(
                set(failures) == expected_failures,
                "hardGates.failures does not match dimension results",
            )
        else:
            require(
                gates["status"] == "pass",
                "passing dimensions require pass status",
            )
            require(
                not failures,
                "passing hard gates require an empty failures array",
            )

        summary = report.get("summary")
        require(isinstance(summary, dict), "summary must be an object")
        action = summary.get("recommendedAction")
        require(
            action
            in {
                "ready",
                "light_revision",
                "substantive_revision",
                "human_review",
            },
            "invalid summary.recommendedAction",
        )
        require(
            non_empty_text(summary.get("overallProfile")),
            "summary.overallProfile is required",
        )
        has_transition_issue = any(
            status in {"ambiguous", "missing"}
            for status in spatial_statuses + motivation_statuses
        )
        require(
            not (has_transition_issue and action == "ready"),
            "ambiguous or missing transitions prevent a ready recommendation",
        )
        require(
            not (gates["status"] != "pass" and action == "ready"),
            "failed or review gates prevent a ready recommendation",
        )
    except ValueError as error:
        print(f"Output error: {error}")
        raise SystemExit(1)
    print("Output is valid.")


if __name__ == "__main__":
    main()
