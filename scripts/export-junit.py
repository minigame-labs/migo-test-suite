#!/usr/bin/env python3
"""
Convert migo-test-suite report JSON to JUnit XML format.

Usage:
    python scripts/export-junit.py --input report.json --output report.xml

The input is the JSON payload from POST /report (same format as game.js _buildReportPayload).
"""

import argparse
import json
import sys
import os
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom.minidom import parseString


def load_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"ERROR: {path} not found", file=sys.stderr)
        sys.exit(2)
    except json.JSONDecodeError as e:
        print(f"ERROR: invalid JSON: {e}", file=sys.stderr)
        sys.exit(2)


def report_to_junit(report):
    """Convert report JSON to JUnit XML Element."""
    results = report.get("results", [])
    summary = report.get("summary", {})

    # Group by category
    categories = {}
    for r in results:
        cat = r.get("category", "unknown")
        categories.setdefault(cat, []).append(r)

    testsuites = Element("testsuites")
    testsuites.set("name", "migo-test-suite")
    testsuites.set("tests", str(summary.get("total", len(results))))
    testsuites.set("failures", str(summary.get("failed", 0)))
    testsuites.set("skipped", str(summary.get("skipped", 0)))

    platform = report.get("platform", "unknown")
    device_id = report.get("deviceId", "unknown")

    for cat_name in sorted(categories.keys()):
        cat_results = categories[cat_name]
        cat_failures = sum(1 for r in cat_results if r.get("status") == "failed")
        cat_skipped = sum(1 for r in cat_results if r.get("status") in ("skipped", "manual_pending"))

        ts = SubElement(testsuites, "testsuite")
        ts.set("name", cat_name)
        ts.set("tests", str(len(cat_results)))
        ts.set("failures", str(cat_failures))
        ts.set("skipped", str(cat_skipped))
        ts.set("time", str(sum(r.get("duration", 0) for r in cat_results) / 1000))

        prop_elem = SubElement(ts, "properties")
        p = SubElement(prop_elem, "property")
        p.set("name", "platform")
        p.set("value", platform)
        p = SubElement(prop_elem, "property")
        p.set("name", "deviceId")
        p.set("value", device_id)

        for r in cat_results:
            tc = SubElement(ts, "testcase")
            tc.set("name", r.get("testId", "unknown"))
            tc.set("classname", f"{cat_name}.{r.get('name', 'unknown')}")
            tc.set("time", str(r.get("duration", 0) / 1000))

            status = r.get("status", "failed")
            if status == "failed":
                failure = SubElement(tc, "failure")
                error_msg = r.get("error", "unknown error")
                failure.set("message", str(error_msg)[:500])
                failure.set("type", "AssertionError")

                details = f"Error: {error_msg}\n"
                if r.get("actual") is not None:
                    details += f"Actual: {json.dumps(r['actual'], ensure_ascii=False, indent=2)}\n"
                if r.get("expected") is not None:
                    details += f"Expected: {json.dumps(r['expected'], ensure_ascii=False, indent=2)}\n"
                if r.get("diffs"):
                    details += f"Diffs:\n"
                    for d in r["diffs"][:20]:
                        details += f"  {d.get('path', '?')}: expected={d.get('expected')}, actual={d.get('actual')} ({d.get('reason', '')})\n"
                failure.text = details

            elif status in ("skipped", "manual_pending"):
                skipped_elem = SubElement(tc, "skipped")
                skipped_elem.set("message", r.get("error", status))

    return testsuites


def main():
    parser = argparse.ArgumentParser(description="Convert test report JSON to JUnit XML")
    parser.add_argument("--input", "-i", required=True, help="Input report JSON file")
    parser.add_argument("--output", "-o", required=True, help="Output JUnit XML file")
    args = parser.parse_args()

    report = load_json(args.input)
    root = report_to_junit(report)

    raw_xml = tostring(root, encoding="unicode")
    pretty = parseString(raw_xml).toprettyxml(indent="  ", encoding="utf-8")

    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    with open(args.output, "wb") as f:
        f.write(pretty)

    results = report.get("results", [])
    summary = report.get("summary", {})
    print(f"JUnit XML written to: {args.output}")
    print(f"  Tests: {summary.get('total', len(results))}, Failures: {summary.get('failed', 0)}, Skipped: {summary.get('skipped', 0)}")


if __name__ == "__main__":
    main()
