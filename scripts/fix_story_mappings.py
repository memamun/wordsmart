#!/usr/bin/env python3
"""Script to synchronize and correct Bengali meanings in contextual_stories.json's vocabulary mapping with core_vocabulary.json."""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data", "source")

CORE_PATH = os.path.join(DATA_DIR, "core_vocabulary.json")
STORIES_PATH = os.path.join(DATA_DIR, "contextual_stories.json")

def main():
    if not os.path.exists(CORE_PATH) or not os.path.exists(STORIES_PATH):
        print("❌ Error: Missing core_vocabulary.json or contextual_stories.json")
        return

    print("📖 Loading core_vocabulary.json...")
    with open(CORE_PATH, "r", encoding="utf-8") as f:
        core_data = json.load(f)

    # Map word.upper() -> bengali_meaning
    word_to_bengali = {}
    for w in core_data.get("words", []):
        word_str = w.get("word", "").upper().strip()
        if word_str:
            word_to_bengali[word_str] = w.get("bengali_meaning", "").strip()

    print("📖 Loading contextual_stories.json...")
    with open(STORIES_PATH, "r", encoding="utf-8") as f:
        stories_data = json.load(f)

    updated_count = 0
    missing_count = 0
    stories = stories_data.get("stories", [])
    
    for s in stories:
        vocab_mapping = s.get("vocabulary_mapping", [])
        for item in vocab_mapping:
            word_str = item.get("word", "").upper().strip()
            if word_str in word_to_bengali:
                old_val = item.get("bengali_meaning", "")
                new_val = word_to_bengali[word_str]
                if old_val != new_val:
                    item["bengali_meaning"] = new_val
                    updated_count += 1
            else:
                missing_count += 1

    if updated_count > 0:
        with open(STORIES_PATH, "w", encoding="utf-8") as f:
            json.dump(stories_data, f, indent=2, ensure_ascii=False)
        print(f"🎉 Successfully updated {updated_count} Bengali meanings in contextual_stories.json!")
    else:
        print("🎉 No updates were needed. All mappings are already synchronized!")

    if missing_count > 0:
        print(f"ℹ️ Total of {missing_count} words in story mappings are supplementary words (not in core vocabulary).")

if __name__ == "__main__":
    main()
