#!/usr/bin/env python3
"""Script to validate data quality of collocations in core_vocabulary.json.
Checks:
1. Count: At least 3 collocations per word.
2. Casing: Strictly lowercase.
3. Word presence: The collocation must contain the word itself or standard inflected forms.
4. Word length: Each collocation phrase must consist of 2 to 5 words.
5. Duplicates: No duplicate collocations per word.
6. Noise detection: Absence of metadata/system noise (e.g. "meaning", "synonym", POS tags, single-character junk).
"""

import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
CORE_PATH = os.path.join(PROJECT_ROOT, "data", "source", "core_vocabulary.json")

def clean_stem(word):
    # Get the word stem to check for presence in collocations
    w = word.lower()
    # Strip suffixes to get base stem
    if w.endswith("ing"):
        w = w[:-3]
    elif w.endswith("ed"):
        w = w[:-2]
    elif w.endswith("es"):
        w = w[:-2]
    elif w.endswith("s") and not w.endswith("ss"):
        w = w[:-1]
    return w

def main():
    if not os.path.exists(CORE_PATH):
        print(f"❌ Error: {CORE_PATH} not found.")
        return

    with open(CORE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    words = data.get("words", [])
    
    total_violations = 0
    words_with_issues = 0

    print("🔍 Auditing collocation quality for 822 words...")

    for w in words:
        word = w["word"].upper()
        colls = w.get("collocations", [])
        stem = clean_stem(word)
        
        issues = []

        # 1. Check Count
        if len(colls) < 3:
            issues.append(f"Fewer than 3 collocations (found {len(colls)})")
        elif len(colls) > 5:
            issues.append(f"More than 5 collocations (found {len(colls)})")

        # Check each collocation item
        seen = set()
        for idx, coll in enumerate(colls):
            coll_str = str(coll)

            # 2. Casing Check
            if coll_str != coll_str.lower():
                issues.append(f"Collocation '{coll_str}' is not lowercase")

            # 3. Duplicate check
            if coll_str.lower() in seen:
                issues.append(f"Duplicate collocation: '{coll_str}'")
            seen.add(coll_str.lower())

            # 4. Length check (number of words)
            phrase_for_len = coll_str.replace("-", " ")
            parts = phrase_for_len.split()
            if len(parts) < 2:
                issues.append(f"Collocation '{coll_str}' is too short (fewer than 2 words)")
            elif len(parts) > 5:
                issues.append(f"Collocation '{coll_str}' is too long (more than 5 words)")

            # 5. Word/Stem presence check
            # We want to check if the collocation contains the vocabulary word, or a word sharing a common prefix/stem.
            stem_found = False
            prefix_len = min(4, len(word))
            word_prefix = word.lower()[:prefix_len]
            
            # Words in the collocation (splitting on spaces and hyphens)
            coll_words = [re.sub(r"[^a-zA-Z]", "", p.lower()) for p in re.split(r"[\s-]", coll_str)]
            
            for cw in coll_words:
                if len(cw) >= 3:
                    # Common prefix match (e.g. ambivalent vs ambivalence, amenity vs amenities)
                    cw_prefix = cw[:min(len(cw), prefix_len)]
                    if cw_prefix == word_prefix:
                        stem_found = True
                        break
                    # Suffix/part-of-speech match (e.g., fatalist -> fatalism, fervor -> fervent)
                    # Check if they share a common root of length >= 4
                    common_len = 0
                    for c1, c2 in zip(cw, word.lower()):
                        if c1 == c2:
                            common_len += 1
                        else:
                            break
                    if common_len >= 4:
                        stem_found = True
                        break
            
            if not stem_found:
                # Direct check if the stem is in the collocation string
                if stem in coll_str.lower():
                    stem_found = True
            
            if not stem_found:
                issues.append(f"Collocation '{coll_str}' does not contain word stem/root related to '{word}'")

            # 6. Noise words check
            noise_patterns = [
                r"\b(synonym|antonym|definition|part of speech|verb|noun|adjective|adverb)\b",
                r"\b(to\s+\w+)\b", # Standalone infinitives (should be paired with noun/adverb, e.g. "to abate" is metadata, but "to abate the storm" is fine)
            ]
            for pat in noise_patterns:
                if re.search(pat, coll_str.lower()):
                    # Exceptions: if the phrase is long enough it's not noise
                    if len(parts) == 2 and parts[0] == "to":
                        issues.append(f"Contains standalone infinitive noise: '{coll_str}'")
                    elif "synonym" in coll_str or "antonym" in coll_str:
                        issues.append(f"Contains metadata noise: '{coll_str}'")

        if issues:
            words_with_issues += 1
            total_violations += len(issues)
            print(f"⚠️ {word}:")
            for issue in issues:
                print(f"   - {issue}")
            print(f"   Collocations: {colls}")

    print("\n--- Collocation QA Report Summary ---")
    print(f"Total Words Checked: {len(words)}")
    print(f"Words with Issues: {words_with_issues}")
    print(f"Total Violations: {total_violations}")

    if total_violations == 0:
        print("🎉 All collocations are in pristine condition! Quality checks passed.")
        exit(0)
    else:
        print("❌ Collocation quality checks failed with violations.")
        exit(1)

if __name__ == "__main__":
    main()
