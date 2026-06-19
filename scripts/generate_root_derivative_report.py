import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "docs", "root_derivative_audit_report.md")

def main():
    core_path = os.path.join(DATA_DIR, "core_vocabulary.json")
    with open(core_path, "r", encoding="utf-8") as f:
        core_data = json.load(f)

    words = core_data.get("words", [])
    total_words = len(words)

    both_list = []
    only_root_list = []
    only_deriv_list = []
    neither_list = []

    for w in words:
        has_root = bool(w.get("root_tags"))
        has_deriv = bool(w.get("derivatives"))
        
        info = {
            "word": w["word"],
            "roots": w.get("root_tags", []),
            "derivatives": w.get("derivatives", {})
        }
        
        if has_root and has_deriv:
            both_list.append(info)
        elif has_root:
            only_root_list.append(info)
        elif has_deriv:
            only_deriv_list.append(info)
        else:
            neither_list.append(info)

    # Sort all lists alphabetically by word
    both_list.sort(key=lambda x: x["word"])
    only_root_list.sort(key=lambda x: x["word"])
    only_deriv_list.sort(key=lambda x: x["word"])
    neither_list.sort(key=lambda x: x["word"])

    lines = [
        "# WordSmart Root & Derivative Audit Report",
        "",
        "## Executive Summary",
        "",
        f"This report evaluates the enrichment coverage of the {total_words} core vocabulary words in `data/core_vocabulary.json` focusing on:",
        "1. **Root-Tagged Words**: Words mapped to their etymological roots (via `root_tags` field).",
        "2. **Derivative-Complete Words**: Words that list their inflected/derived forms (via `derivatives` field).",
        "",
        "---",
        "",
        "## Enrichment Coverage Metrics",
        "",
        "| Metric | Word Count | Percentage |",
        "| :--- | :---: | :---: |",
        f"| **Total Vocabulary Size** | {total_words} | 100.00% |",
        f"| **Root-Tagged Words** | {len(both_list) + len(only_root_list)} | {(len(both_list) + len(only_root_list))/total_words*100:.2f}% |",
        f"| **Derivative-Complete Words** | {len(both_list) + len(only_deriv_list)} | {(len(both_list) + len(only_deriv_list))/total_words*100:.2f}% |",
        "",
        "### Intersection Breakdown",
        "",
        "| Category | Word Count | Percentage |",
        "| :--- | :---: | :---: |",
        f"| **Both Root-Tagged & Derivative-Complete** | {len(both_list)} | {len(both_list)/total_words*100:.2f}% |",
        f"| **Only Root-Tagged** | {len(only_root_list)} | {len(only_root_list)/total_words*100:.2f}% |",
        f"| **Only Derivative-Complete** | {len(only_deriv_list)} | {len(only_deriv_list)/total_words*100:.2f}% |",
        f"| **Neither (Pending Enrichment)** | {len(neither_list)} | {len(neither_list)/total_words*100:.2f}% |",
        "",
        "---",
        "",
        "## Detailed Sample Lists",
        ""
    ]

    def format_roots(roots):
        return ", ".join([f"`{r['root']}` ({r['meaning']})" for r in roots])

    # 1. Both
    lines.append(f"### 1. Both Root-Tagged & Derivative-Complete ({len(both_list)} Words)")
    lines.append("Words that have successfully been enriched with both their root etymologies and derivative verb/noun/adjective forms.")
    for item in both_list[:10]:
        lines.append(f"*   **{item['word']}**")
        lines.append(f"    *   *Roots*: {format_roots(item['roots'])}")
        lines.append(f"    *   *Derivatives*: `{json.dumps(item['derivatives'])}`")
    if len(both_list) > 10:
        lines.append(f"*   *... and {len(both_list) - 10} more words.*")
    lines.append("")

    # 2. Only Root
    lines.append(f"### 2. Only Root-Tagged ({len(only_root_list)} Words)")
    lines.append("Words mapped to roots but missing inflected derivatives.")
    for item in only_root_list[:10]:
        lines.append(f"*   **{item['word']}**")
        lines.append(f"    *   *Roots*: {format_roots(item['roots'])}")
    if len(only_root_list) > 10:
        lines.append(f"*   *... and {len(only_root_list) - 10} more words.*")
    lines.append("")

    # 3. Only Deriv
    lines.append(f"### 3. Only Derivative-Complete ({len(only_deriv_list)} Words)")
    lines.append("Words that have inflected derivative forms listed but no root tags.")
    for item in only_deriv_list[:10]:
        lines.append(f"*   **{item['word']}**")
        lines.append(f"    *   *Derivatives*: `{json.dumps(item['derivatives'])}`")
    if len(only_deriv_list) > 10:
        lines.append(f"*   *... and {len(only_deriv_list) - 10} more words.*")
    lines.append("")

    # 4. Neither
    lines.append(f"### 4. Neither ({len(neither_list)} Words)")
    lines.append("Words that currently lack both etymological roots and derivative forms.")
    for item in neither_list[:10]:
        lines.append(f"*   **{item['word']}**")
    if len(neither_list) > 10:
        lines.append(f"*   *... and {len(neither_list) - 10} more words.*")
    lines.append("")

    lines.extend([
        "---",
        "",
        "## Recommendations for Future Enrichment",
        "*   **Map Remaining Roots**: Focus on the 413 'Only Derivative-Complete' words to link them to their appropriate Greek/Latin roots.",
        "*   **Complete the Backlog**: Address the 98 remaining 'Neither' words to add both root tags and derivatives, pushing coverage to 100%.",
        ""
    ])

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"🎉 Successfully regenerated {OUTPUT_PATH}!")

if __name__ == "__main__":
    main()
