#!/usr/bin/env python3
"""Script to audit the accuracy of the existing 330 root-tagged vocabulary words using Gemini."""

import json
import os
import urllib.request
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data", "source")
ENV_PATH = os.path.join(PROJECT_ROOT, ".env")
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "docs", "root_accuracy_audit_report.md")

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
    seen = set()
    return [k for k in keys if k and not (k in seen or seen.add(k))]

def main():
    api_keys = load_api_keys()
    if not api_keys:
        print("❌ Error: No API keys found in .env!")
        return

    current_key_idx = 0

    core_path = os.path.join(DATA_DIR, "core_vocabulary.json")
    with open(core_path, "r", encoding="utf-8") as f:
        core_data = json.load(f)

    words = core_data.get("words", [])
    root_tagged_words = [w for w in words if w.get("root_tags")]

    print(f"Loaded {len(root_tagged_words)} root-tagged words for audit.")

    audit_results = {}
    batch_size = 20
    
    for i in range(0, len(root_tagged_words), batch_size):
        batch = root_tagged_words[i:i+batch_size]
        batch_names = [w["word"] for w in batch]
        print(f"\n🔄 Auditing batch {i // batch_size + 1} ({len(batch)} words): {batch_names[:5]}...")

        prompt = """You are a senior etymologist and lexicographer.
We are auditing the accuracy of Latin/Greek root mappings for English vocabulary words.
For each word, we have a list of etymological roots currently mapped to it in our database.
Please verify if the word actually derives from each listed root.
Flag any mapping that is incorrect (e.g. false cognate, superficial prefix matching, or incorrect root meaning/association).

For example:
- "APARTHEID" mapped to "AB/ABS" (off, away from) is INCORRECT. Apartheid is Afrikaans, from Dutch "apart" (from Latin "ad" + "pars") + suffix "-heid". It has no relation to "ab-".
- "AMNESTY" mapped to "A" (without) and "MNE" (to remember) is CORRECT (a- + mnestis = non-remembrance).

Please return the results strictly as a JSON object mapping each word to a list of audit assessments.
Each assessment in the list must correspond to one of the word's listed roots and have:
- "root": The root string (e.g., "AB/ABS").
- "is_accurate": True if the mapping is historically and etymologically correct, False otherwise.
- "explanation": A brief, precise etymological explanation of why the mapping is correct or incorrect.
- "correction": If incorrect, suggest the correct Latin/Greek root if applicable, or state "Remove root mapping".

Do not include any Markdown wrapper or code blocks in the output.

Here are the words and their current roots:
"""
        words_input = []
        for w in batch:
            words_input.append({
                "word": w["word"],
                "definition": w["definition"],
                "roots": [{"root": r["root"], "meaning": r["meaning"]} for r in w["root_tags"]]
            })
        prompt += json.dumps(words_input, indent=2)

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"}
        }

        success = False
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
                    audit_results.update(result)
                    success = True
                    print(f"  ✅ Batch audited successfully.")
                    time.sleep(10.0)
                    break
            except Exception as e:
                print(f"  ❌ Attempt {attempt+1} failed with key index {current_key_idx}: {e}")
                current_key_idx = (current_key_idx + 1) % len(api_keys)
                if "429" in str(e):
                    time.sleep(30.0)
                else:
                    time.sleep(10.0)

        if not success:
            print("Stopping due to repeated errors. Run again to resume.")
            return

    # Now let's generate the markdown audit report
    print("\n✍️ Writing audit report...")
    
    incorrect_mappings = []
    accurate_count = 0
    total_mappings_count = 0

    for word, assessments in audit_results.items():
        for assess in assessments:
            total_mappings_count += 1
            if assess.get("is_accurate"):
                accurate_count += 1
            else:
                incorrect_mappings.append({
                    "word": word,
                    "root": assess.get("root"),
                    "explanation": assess.get("explanation"),
                    "correction": assess.get("correction")
                })

    accuracy_pct = (accurate_count / total_mappings_count * 100) if total_mappings_count > 0 else 0

    report_lines = [
        "# WordSmart Root Accuracy Audit Report",
        "",
        "## Executive Summary",
        "",
        "This audit evaluates the etymological accuracy of the existing Latin and Greek root mappings in the WordSmart vocabulary database.",
        "",
        f"*   **Total Root Mappings Audited:** {total_mappings_count}",
        f"*   **Accurate Mappings:** {accurate_count} ({accuracy_pct:.2f}%)",
        f"*   **Incorrect/Flagged Mappings:** {len(incorrect_mappings)} ({100 - accuracy_pct:.2f}%)",
        "",
        "Quality > Quantity. Removing false cognates and prefix matches ensures high-quality learning outcomes for users preparing for academic exams.",
        "",
        "---",
        "",
        f"## Flagged Mappings for Review ({len(incorrect_mappings)} Mappings)",
        "",
        "These root mappings were flagged as etymologically incorrect or misleading. They should be corrected or removed.",
        ""
    ]

    for item in incorrect_mappings:
        report_lines.extend([
            f"### **{item['word']}** (Root: `{item['root']}`)",
            f"*   **Issue:** {item['explanation']}",
            f"*   **Recommended Action:** **{item['correction']}**",
            ""
        ])

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    # Save details as cache for programmatical correction
    cache_path = os.path.join(PROJECT_ROOT, "archive", "cache", ".root_audit_cache.json")
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(audit_results, f, indent=2, ensure_ascii=False)

    print(f"🎉 Audit complete! Report written to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
