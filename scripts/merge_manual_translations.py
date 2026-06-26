#!/usr/bin/env python3
import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
CACHE_PATH = os.path.join(DATA_DIR, ".example_translation_cache.json")

def clean_sentence(s):
    return re.sub(r"\s+", " ", s.replace("**", "").replace("*", "")).strip().lower()

def merge_file(chunk_path):
    if not os.path.exists(chunk_path):
        print(f"Error: {chunk_path} does not exist.")
        return

    with open(chunk_path, "r", encoding="utf-8") as f:
        new_translations = json.load(f)

    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, "r", encoding="utf-8") as f:
            cache = json.load(f)
    else:
        cache = {}

    merged = 0
    for eng, beng in new_translations.items():
        key = clean_sentence(eng)
        if key not in cache or cache[key] != beng:
            cache[key] = beng.strip()
            merged += 1

    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

    print(f"Successfully merged {merged} translations from {chunk_path} into cache. New cache size: {len(cache)}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/merge_manual_translations.py <chunk_json_path>")
    else:
        merge_file(sys.argv[1])
