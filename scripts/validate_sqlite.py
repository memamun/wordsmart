#!/usr/bin/env python3
"""Script to validate the normalized SQLite database (data/wordsmart.db) integrity and row counts against original JSON files."""

import json
import os
import sqlite3
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
DB_PATH = os.path.join(DATA_DIR, "wordsmart.db")

def count_json_entries(filename, key=None, subkey=None):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return 0
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    if key is None:
        return len(data)
    
    entries = data.get(key, [])
    if subkey:
        count = 0
        for entry in entries:
            count += len(entry.get(subkey, []))
        return count
    return len(entries)

def count_nested_json_items(filename, key, nested_key, is_dict=False):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return 0
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    count = 0
    for entry in data.get(key, []):
        val = entry.get(nested_key)
        if val:
            if is_dict:
                count += len(val)
            else:
                count += len(val)
    return count

def count_expected_words():
    core_words = set()
    core_path = os.path.join(DATA_DIR, "core_vocabulary.json")
    if os.path.exists(core_path):
        with open(core_path, "r", encoding="utf-8") as f:
            core_data = json.load(f)
        for w in core_data.get("words", []):
            core_words.add(w.get("word", "").upper())
            
    hp_words = set()
    hp_path = os.path.join(DATA_DIR, "hit_parades.json")
    if os.path.exists(hp_path):
        with open(hp_path, "r", encoding="utf-8") as f:
            hp_data = json.load(f)
        for list_key in ["sat_hit_parade", "gre_hit_parade"]:
            for entry in hp_data.get(list_key, []):
                w_name = entry.get("word", "")
                if w_name:
                    hp_words.add(w_name.upper())
                    
    root_words = set()
    roots_path = os.path.join(DATA_DIR, "word_roots.json")
    if os.path.exists(roots_path):
        with open(roots_path, "r", encoding="utf-8") as f:
            roots_data = json.load(f)
        for rt in roots_data.get("roots", []):
            for w_name in rt.get("words", []):
                if w_name:
                    root_words.add(w_name.upper())
                    
    return len(core_words | hp_words | root_words)

def count_expected_word_roots():
    word_to_id = {}
    core_words = set()
    core_path = os.path.join(DATA_DIR, "core_vocabulary.json")
    if os.path.exists(core_path):
        with open(core_path, "r", encoding="utf-8") as f:
            core_data = json.load(f)
        for w in core_data.get("words", []):
            word_to_id[w["word"].upper()] = w["id"]
            core_words.add(w["word"].upper())
            
    hp_words = set()
    hp_path = os.path.join(DATA_DIR, "hit_parades.json")
    if os.path.exists(hp_path):
        with open(hp_path, "r", encoding="utf-8") as f:
            hp_data = json.load(f)
        for list_key in ["sat_hit_parade", "gre_hit_parade"]:
            for entry in hp_data.get(list_key, []):
                if entry.get("word"):
                    hp_words.add(entry["word"].upper())
                    
    root_words = set()
    roots_path = os.path.join(DATA_DIR, "word_roots.json")
    if os.path.exists(roots_path):
        with open(roots_path, "r", encoding="utf-8") as f:
            roots_data = json.load(f)
        for rt in roots_data.get("roots", []):
            for w_name in rt.get("words", []):
                if w_name:
                    root_words.add(w_name.upper())
                    
    extra_words = (hp_words | root_words) - core_words
    next_id = 823
    for w_word in sorted(extra_words):
        word_to_id[w_word] = next_id
        next_id += 1
        
    root_to_id = {}
    roots_count = 0
    if os.path.exists(roots_path):
        for rt in roots_data.get("roots", []):
            r_name = rt.get("root", "")
            if r_name not in root_to_id:
                roots_count += 1
                root_to_id[r_name] = roots_count
                
        if os.path.exists(core_path):
            for w in core_data.get("words", []):
                for rt in w.get("root_tags", []):
                    r_name = rt.get("root")
                    if r_name and r_name not in root_to_id:
                        roots_count += 1
                        root_to_id[r_name] = roots_count
                        
    unique_connections = set()
    if os.path.exists(roots_path):
        for rt in roots_data.get("roots", []):
            r_name = rt.get("root", "")
            r_id = root_to_id.get(r_name)
            if not r_id:
                continue
            for w_name in rt.get("words", []):
                w_id = word_to_id.get(w_name.upper())
                if w_id:
                    unique_connections.add((w_id, r_id))
                    
    if os.path.exists(core_path):
        for w in core_data.get("words", []):
            w_id = w.get("id")
            for rt in w.get("root_tags", []):
                r_name = rt.get("root")
                r_id = root_to_id.get(r_name)
                if w_id and r_id:
                    unique_connections.add((w_id, r_id))
                    
    return len(unique_connections)

def count_expected_roots():
    roots_set = set()
    roots_path = os.path.join(DATA_DIR, "word_roots.json")
    if os.path.exists(roots_path):
        with open(roots_path, "r", encoding="utf-8") as f:
            roots_data = json.load(f)
        for rt in roots_data.get("roots", []):
            r_name = rt.get("root", "")
            if r_name:
                roots_set.add(r_name)
                
    core_path = os.path.join(DATA_DIR, "core_vocabulary.json")
    if os.path.exists(core_path):
        with open(core_path, "r", encoding="utf-8") as f:
            core_data = json.load(f)
        for w in core_data.get("words", []):
            for rt in w.get("root_tags", []):
                r_name = rt.get("root")
                if r_name:
                    roots_set.add(r_name)
                    
    return len(roots_set)

def count_hit_parade_json():
    filepath = os.path.join(DATA_DIR, "hit_parades.json")
    if not os.path.exists(filepath):
        return 0
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    return len(data.get("sat_hit_parade", [])) + len(data.get("gre_hit_parade", []))

def main():
    print("🔍 Starting SQLite Integrity & Validation Checks...")
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Error: SQLite database file not found at {DB_PATH}")
        sys.exit(1)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Row Count Validation Mappings
    validation_queries = [
        ("words", "SELECT COUNT(*) FROM words", count_expected_words),
        ("word_examples", "SELECT COUNT(*) FROM word_examples", lambda: count_nested_json_items("core_vocabulary.json", "words", "examples")),
        ("word_synonyms", "SELECT COUNT(*) FROM word_synonyms", lambda: count_nested_json_items("core_vocabulary.json", "words", "synonyms")),
        ("word_antonyms", "SELECT COUNT(*) FROM word_antonyms", lambda: count_nested_json_items("core_vocabulary.json", "words", "antonyms")),
        ("word_derivatives", "SELECT COUNT(*) FROM word_derivatives", lambda: count_nested_json_items("core_vocabulary.json", "words", "derivatives", is_dict=True)),
        ("word_collocations", "SELECT COUNT(*) FROM word_collocations", lambda: count_nested_json_items("core_vocabulary.json", "words", "collocations")),
        ("roots", "SELECT COUNT(*) FROM roots", count_expected_roots),
        ("word_roots", "SELECT COUNT(*) FROM word_roots", count_expected_word_roots),
        ("flashcards", "SELECT COUNT(*) FROM flashcards", lambda: count_json_entries("flashcards.json", "flashcards")),
        ("vocab_drills", "SELECT COUNT(*) FROM vocab_drills", lambda: count_json_entries("vocab_drills.json", "drills")),
        ("contextual_stories", "SELECT COUNT(*) FROM contextual_stories", lambda: count_json_entries("contextual_stories.json", "stories")),
        ("mcq_quizzes", "SELECT COUNT(*) FROM mcq_quizzes", lambda: count_json_entries("mcq_quizzes.json", "quizzes")),
        ("quick_quizzes", "SELECT COUNT(*) FROM quick_quizzes", lambda: count_json_entries("quick_quizzes.json", "quizzes")),
        ("advanced_sat_gre_quizzes", "SELECT COUNT(*) FROM advanced_sat_gre_quizzes", lambda: count_json_entries("advanced_sat_gre_quizzes.json", "quizzes")),
        ("hit_parades", "SELECT COUNT(*) FROM hit_parades", count_hit_parade_json),
        ("specialized_vocabulary", "SELECT COUNT(*) FROM specialized_vocabulary", lambda: count_json_entries("specialized_vocabulary.json", "chapters", "entries")),
        ("final_exam", "SELECT COUNT(*) FROM final_exam", lambda: count_json_entries("final_exam.json", "drills")),
        ("bookmarks", "SELECT COUNT(*) FROM bookmarks", lambda: 0),
        ("progress", "SELECT COUNT(*) FROM progress", lambda: 0)
    ]
    
    failures = 0
    
    for table, query, count_func in validation_queries:
        try:
            cursor.execute(query)
            db_count = cursor.fetchone()[0]
            expected = count_func()
            
            if db_count != expected:
                print(f"❌ Failure in '{table}': SQLite row count ({db_count}) does not match JSON count ({expected})")
                failures += 1
            else:
                print(f"  ✅ Table '{table}' verified: {db_count} rows match JSON.")
        except Exception as e:
            print(f"❌ Error querying table '{table}': {e}")
            failures += 1
            
    # 2. Referential Constraint Verification
    print("\n🔗 Testing Foreign Key Constraints...")
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Try inserting a flashcard with a non-existent word to verify foreign key throws error
    try:
        cursor.execute("""
        INSERT INTO flashcards (word_id, additional_example, additional_example_bengali, mnemonic_hint)
        VALUES (99999, 'xyz', 'xyz', 'xyz')
        """)
        print("❌ Failure: Foreign key validation failed! Allowed inserting orphan flashcard.")
        failures += 1
    except sqlite3.IntegrityError:
        print("  ✅ Foreign Key constraint blocks orphaned flashcards successfully.")
    except Exception as e:
        print(f"❌ Unexpected error testing foreign keys: {e}")
        failures += 1
        
    # Try inserting a bookmark with a non-existent word to verify foreign key throws error
    try:
        cursor.execute("""
        INSERT INTO bookmarks (user_id, word_id)
        VALUES (1, 99999)
        """)
        print("❌ Failure: Foreign key validation failed! Allowed inserting orphan bookmark.")
        failures += 1
    except sqlite3.IntegrityError:
        print("  ✅ Foreign Key constraint blocks orphaned bookmarks successfully.")
    except Exception as e:
        print(f"❌ Unexpected error testing foreign keys for bookmarks: {e}")
        failures += 1

    # Try inserting a progress record with a non-existent word to verify foreign key throws error
    try:
        cursor.execute("""
        INSERT INTO progress (user_id, word_id)
        VALUES (1, 99999)
        """)
        print("❌ Failure: Foreign key validation failed! Allowed inserting orphan progress.")
        failures += 1
    except sqlite3.IntegrityError:
        print("  ✅ Foreign Key constraint blocks orphaned progress successfully.")
    except Exception as e:
        print(f"❌ Unexpected error testing foreign keys for progress: {e}")
        failures += 1
        
    conn.close()
    
    print("\n--- Summary ---")
    if failures == 0:
        print("🎉 SQLite Database validation completed successfully with 0 errors!")
        sys.exit(0)
    else:
        print(f"❌ Database validation failed with {failures} errors.")
        sys.exit(1)

if __name__ == "__main__":
    main()
