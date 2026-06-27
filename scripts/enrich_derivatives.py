#!/usr/bin/env python3
"""Script to enrich the first 50 words from Category A in core_vocabulary.json using the backlog cache."""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data", "source")

def main():
    core_path = os.path.join(DATA_DIR, "core_vocabulary.json")
    cache_path = os.path.join(PROJECT_ROOT, "archive", "cache", ".backlog_cache.json")

    if not os.path.exists(core_path):
        print("❌ Error: core_vocabulary.json not found!")
        return

    if not os.path.exists(cache_path):
        print("❌ Error: .backlog_cache.json not found!")
        return

    # Load databases
    with open(core_path, "r", encoding="utf-8") as f:
        core_data = json.load(f)

    with open(cache_path, "r", encoding="utf-8") as f:
        cache_data = json.load(f)

    category_a = cache_data.get("category_a", {})
    words = core_data.get("words", [])

    # Find words in Category A that do not have derivatives in core_vocabulary.json yet
    candidates = []
    for w in words:
        word = w["word"]
        dt = w.get("derivatives", {})
        if word in category_a and (not isinstance(dt, dict) or len(dt) == 0):
            candidates.append(w)

    # Sort candidates alphabetically by word to ensure deterministic top 50 selection
    candidates.sort(key=lambda x: x["word"])

    if not candidates:
        print("ℹ️ No pending Category A words to enrich.")
        return

    import sys
    count = int(sys.argv[1]) if len(sys.argv) > 1 else len(candidates)
    enrich_count = min(count, len(candidates))
    words_to_enrich = candidates[:enrich_count]

    print(f"🚀 Enriching {enrich_count} words in core_vocabulary.json from Category A...")

    enriched_words_list = []
    for w in words_to_enrich:
        word = w["word"]
        w["derivatives"] = category_a[word]
        enriched_words_list.append(word)

    # Save core_vocabulary.json
    with open(core_path, "w", encoding="utf-8") as f:
        json.dump(core_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Successfully enriched {enrich_count} words:")
    print(", ".join(enriched_words_list))

if __name__ == "__main__":
    main()
