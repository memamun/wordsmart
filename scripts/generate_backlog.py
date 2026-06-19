#!/usr/bin/env python3
"""Script to analyze database words and classify them into derivative enrichment categories."""

import json
import os
import urllib.request
import urllib.error

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
ENV_PATH = os.path.join(PROJECT_ROOT, ".env")
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "docs", "derivative_enrichment_backlog.md")

def load_api_keys():
    keys = []
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GEMINI_API_KEY="):
                    keys.append(line.split("=", 1)[1].strip())
                elif line.startswith("GEMINI_API_KEY_FALLBACK="):
                    keys.append(line.split("=", 1)[1].strip())
                elif line.startswith("GOOGLE_API_KEY="):
                    keys.append(line.split("=", 1)[1].strip())
    # remove duplicates and empty keys but preserve order
    seen = set()
    return [k for k in keys if k and not (k in seen or seen.add(k))]

def main():
    api_keys = load_api_keys()
    if not api_keys:
        print("❌ Error: No API keys found in .env!")
        return

    print(f"Loaded {len(api_keys)} API keys for rotation.")
    current_key_idx = 0

    print("📖 Loading core_vocabulary.json...")
    core_path = os.path.join(DATA_DIR, "core_vocabulary.json")
    with open(core_path, "r", encoding="utf-8") as f:
        core_data = json.load(f)

    words = core_data.get("words", [])
    
    category_b = [] # Already complete
    no_deriv_words = [] # Candidates for A or C

    for w in words:
        word = w["word"]
        dt = w.get("derivatives", {})
        if isinstance(dt, dict) and len(dt) > 0:
            category_b.append(w)
        else:
            no_deriv_words.append(w)

    print(f"Total words: {len(words)}")
    print(f"Category B (Already Complete): {len(category_b)}")
    print(f"Candidates for A/C: {len(no_deriv_words)}")

    # Load cache
    cache_path = os.path.join(DATA_DIR, ".backlog_cache.json")
    cache = {}
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cache = json.load(f)
        except Exception:
            pass

    # Separate candidates that are already classified in cache
    category_a = cache.get("category_a", {})
    category_c = cache.get("category_c", [])
    no_derivative_needed = cache.get("no_derivative_needed", [])

    # Filter out words that are now in Category B (already complete in core_vocabulary.json)
    complete_words = {w["word"] for w in category_b}
    category_a = {k: v for k, v in category_a.items() if k not in complete_words}
    category_c = [w for w in category_c if w not in complete_words]
    no_derivative_needed = [w for w in no_derivative_needed if w not in complete_words]

    already_processed = set(category_a.keys()) | set(category_c) | set(no_derivative_needed)
    words_to_process = [w for w in no_deriv_words if w["word"] not in already_processed]
    print(f"Remaining candidates to classify: {len(words_to_process)}")

    batch_size = 15
    completed = 0
    total_to_process = len(words_to_process)

    for i in range(0, total_to_process, batch_size):
        batch = words_to_process[i:i+batch_size]
        batch_names = [w["word"] for w in batch]
        print(f"\n🔄 Classifying batch {i // batch_size + 1} ({len(batch)} words): {batch_names[:5]}...")
        
        prompt = """You are a senior lexicographer and curriculum designer for vocabulary study software.
We have a list of English vocabulary words that currently have empty derivatives in our database.
We need to categorize these words into:
- Category A: Words that clearly deserve derivatives (high value for vocabulary growth, having common, useful, exam-relevant, and real-world English derived forms like nouns, verbs, adjectives, or adverbs).
- Category C (Low Priority): Words where derivative enrichment is low priority (either because they have no common derived forms, or the only derived forms are less common/rare).

For each word in Category A, please also suggest 1 to 3 highly useful, common, exam-relevant, and real-world English derived forms with their part of speech (e.g. {"abhorrent": "adj", "abhorrence": "n"}). Avoid any obscure, archaic, or medieval forms that native speakers do not use.

Please return the results strictly as a JSON object with two keys:
- "category_a": A dictionary mapping each word in Category A to a dictionary of its suggested derivatives.
- "category_c": An array of words in Category C.

Do not include any Markdown wrapper or code blocks in the output.

Here are the words with their definitions and parts of speech:
"""
        words_input = []
        for w in batch:
            words_input.append({
                "word": w["word"],
                "pos": w["part_of_speech"],
                "definition": w["definition"]
            })
        prompt += json.dumps(words_input, indent=2)

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"}
        }

        # Attempt call with retries and key rotation
        success = False
        import time
        for attempt in range(15):
            api_key = api_keys[current_key_idx]
            try:
                time.sleep(1.0)
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
                data_payload = json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(url, data=data_payload, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=60) as res:
                    res_body = json.loads(res.read().decode("utf-8"))
                    text = res_body["candidates"][0]["content"]["parts"][0]["text"].strip()
                    result = json.loads(text)
                    
                    # Merge results
                    category_a.update(result.get("category_a", {}))
                    category_c.extend(result.get("category_c", []))
                    
                    # Save cache
                    cache["category_a"] = category_a
                    cache["category_c"] = list(set(category_c)) # unique
                    with open(cache_path, "w", encoding="utf-8") as f:
                        json.dump(cache, f, indent=2, ensure_ascii=False)
                    
                    success = True
                    print(f"  ✅ Batch classified. Current Category A: {len(category_a)}, Category C: {len(category_c)}")
                    time.sleep(15.0)  # Cooldown between successful calls to stay under limits
                    break
            except Exception as e:
                print(f"  ❌ Attempt {attempt+1} failed with key index {current_key_idx}: {e}")
                current_key_idx = (current_key_idx + 1) % len(api_keys)
                if "429" in str(e):
                    print(f"  Detected 429 rate limit. Rotating to key index {current_key_idx} and sleeping for 30s...")
                    time.sleep(30.0)
                else:
                    print(f"  Error encountered. Rotating to key index {current_key_idx} and sleeping for 10s...")
                    time.sleep(10.0)

        if not success:
            print("Stopping due to repeated errors. Run the script again to resume.")
            return

    # Now let's generate the markdown report in the requested format
    print("\n✍️ Generating derivative_enrichment_backlog.md...")
    
    report_lines = [
        "# Derivative Enrichment Backlog",
        "",
        "## Overview",
        "",
        "This backlog outlines the strategy for expanding derivative coverage across the WordSmart database, moving from **250** derivative-complete words to a targeted **500+** words, prioritizing high-value vocabulary growth.",
        "",
        f"*   **Category A (High Priority / Backlog):** {len(category_a)} words that clearly deserve derivatives but currently lack them.",
        f"*   **Category B (Already Complete):** {len(category_b)} words that have derivatives populated.",
        f"*   **Category C (Low Priority):** {len(category_c)} words where derivative enrichment is a lower priority.",
        f"*   **No Derivative Required:** {len(no_derivative_needed)} words that do not have common, useful, or exam-relevant derivatives (prioritizing Data Value over Data Completeness).",
        "",
        "### Engineering Guidelines & Review Rules",
        "",
        "1.  **High-Quality & Useful Derivatives (Category A):** We only include derivatives that are common, useful, exam-relevant, and present in real-world English. Obscure, archaic, or medieval forms are avoided.",
        "2.  **Derivative Completeness (Category B):** Future audits should check derivative counts. For example, `ABATE` currently only maps `\"abated\": \"v\"`, which is not complete. In future cycles, this should be expanded to `{\"abated\": \"v\", \"abatement\": \"n\"}` for higher completeness.",
        "3.  **Low Priority vs. No Derivative Required (Category C):** Instead of permanently tracking words with zero learner value, we prioritize Data Value and user perception. Words with no useful derivatives are completely excluded from backlog tracking (marked as 'No Derivative Required'). Only words with actual educational value are moved to Category A and enriched.",
        "",
        "---",
        "",
        f"## Category A: Words Deserving Derivatives ({len(category_a)} Words)",
        "",
        "These words have common, high-value derived forms (nouns, verbs, adjectives, or adverbs) that directly support vocabulary expansion and real-world English contextual comprehension.",
        ""
    ]

    # Sort Category A words alphabetically
    for word in sorted(category_a.keys()):
        derivs = category_a[word]
        deriv_strs = [f"`{k}` ({v})" for k, v in derivs.items()]
        report_lines.append(f"*   **{word}** ➔ Suggested derivatives: {', '.join(deriv_strs)}")

    report_lines.extend([
        "",
        "---",
        "",
        f"## Category B: Already Complete ({len(category_b)} Words)",
        "",
        "These words already have established derivative mappings in the database.",
        ""
    ])

    # Sort Category B words alphabetically
    for w in sorted(category_b, key=lambda x: x["word"]):
        word = w["word"]
        derivs = w["derivatives"]
        deriv_strs = [f"`{k}` ({v})" for k, v in derivs.items()]
        report_lines.append(f"*   **{word}** ➔ Existing derivatives: {', '.join(deriv_strs)}")

    report_lines.extend([
        "",
        "---",
        "",
        f"## Category C: Low Priority Derivative Enrichment ({len(category_c)} Words)",
        "",
        "These words either do not have common derived forms, or their derived forms are rare/less common, meaning enrichment is a lower priority.",
        ""
    ])

    # Sort Category C words alphabetically
    for word in sorted(category_c):
        report_lines.append(f"*   **{word}**")

    report_lines.extend([
        "",
        "---",
        "",
        f"## No Derivative Required ({len(no_derivative_needed)} Words)",
        "",
        "Based on an audit prioritizing Data Value and learner utility over pure Data Completeness, these words do not have common, useful, or exam-relevant derivatives (such as obscure historical forms or no derived forms at all). They are excluded from backlog enrichment.",
        ""
    ])

    # Sort No Derivative Required words alphabetically
    for word in sorted(no_derivative_needed):
        report_lines.append(f"*   **{word}**")

    report_lines.extend([
        "",
        "---",
        "",
        "## Current Status",
        "",
        "| Metric              | Count   |",
        "|---------------------|---------|",
        f"| Total Vocabulary    | {len(words)}     |",
        f"| Derivative Complete | {len(category_b)}     |",
        f"| High Priority       | {len(category_a)}     |",
        f"| Low Priority        | {len(category_c)}     |",
        f"| No Derivative Needed| {len(no_derivative_needed)}     |",
        "",
        "Strategic Goal",
        "",
        "Increase derivative coverage from 250 words to 500+ words while maintaining educational quality and real-world usefulness.",
        "",
        "The goal is not to achieve 100% derivative coverage.",
        "",
        "Instead, the goal is to maximize learner value by prioritizing derivatives that:",
        "",
        "Frequently appear in real-world English",
        "Are useful for academic and competitive examinations",
        "Help learners recognize word families",
        "Improve reading comprehension",
        "Improve vocabulary retention",
        "",
        "Engineering Principles",
        "1. Quality Over Coverage",
        "",
        "A derivative should not be added simply because it exists.",
        "",
        "Example:",
        "",
        "Good:",
        "",
        "```json",
        "{",
        "  \"word\": \"ABHOR\",",
        "  \"derivatives\": {",
        "    \"abhorrent\": \"adj\",",
        "    \"abhorrence\": \"n\"",
        "  }",
        "}",
        "```",
        "",
        "Poor:",
        "",
        "```json",
        "{",
        "  \"word\": \"ABHOR\",",
        "  \"derivatives\": {",
        "    \"obsolete_form_x\": \"adj\"",
        "  }",
        "}",
        "```",
        "",
        "Coverage alone does not create user value.",
        "",
        "2. User Value First",
        "",
        "Derivative enrichment should prioritize words that create immediate learning benefits.",
        "",
        "Priority order:",
        "",
        "Exam-relevant derivatives",
        "Frequently used derivatives",
        "Common academic derivatives",
        "Rare derivatives",
        "Obscure derivatives",
        "",
        "3. Incremental Enrichment",
        "",
        "The backlog should be implemented in batches.",
        "",
        "Recommended workflow:",
        "",
        f"{len(category_a)} Words",
        "    ↓",
        "Top 50",
        "    ↓",
        "Review",
        "    ↓",
        "Top 50",
        "    ↓",
        "Review",
        "    ↓",
        "Continue",
        "",
        "Avoid large-scale enrichment without review.",
        "",
        "4. Future Audit Cycles",
        "",
        "Words currently marked as complete should be re-audited periodically.",
        "",
        "Example:",
        "",
        "Current:",
        "",
        "```json",
        "{",
        "  \"abated\": \"v\"",
        "}",
        "```",
        "",
        "Potential future expansion:",
        "",
        "```json",
        "{",
        "  \"abated\": \"v\",",
        "  \"abatement\": \"n\"",
        "}",
        "```",
        "",
        "Completeness is an evolving target.",
        "",
        "5. Low Priority Is Not Excluded",
        "",
        "Words in Category C are intentionally retained.",
        "",
        "These words may be revisited during future optimization cycles when:",
        "",
        "Category A is substantially complete",
        "Additional educational value is identified",
        "New WordSmart features require broader derivative coverage",
        "",
        "Success Criteria",
        "",
        "Phase 1 Target:",
        "",
        "350+ derivative-complete words",
        "",
        "Phase 2 Target:",
        "",
        "500+ derivative-complete words",
        "",
        "Phase 3 Target:",
        "",
        "Comprehensive derivative coverage for all high-value vocabulary entries",
        "",
        "Success is measured by educational usefulness rather than percentage coverage alone."
    ])

    # Write report
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    print(f"🎉 Backlog successfully written to {OUTPUT_PATH}!")

if __name__ == "__main__":
    main()
