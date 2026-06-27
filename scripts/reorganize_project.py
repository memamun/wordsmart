#!/usr/bin/env python3
"""Helper script to automate folder structure reorganization and path updates in python scripts."""

import os
import shutil
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

def create_dirs():
    dirs = [
        "data/source",
        "data/generated",
        "data/database",
        "archive/cache",
        "assets"
    ]
    for d in dirs:
        path = os.path.join(PROJECT_ROOT, d)
        if not os.path.exists(path):
            os.makedirs(path)
            print(f"Created directory: {path}")

def move_files():
    # 1. Move 12 primary JSON files
    json_files = [
        "core_vocabulary.json",
        "flashcards.json",
        "vocab_drills.json",
        "mnemonics_database.json",
        "mcq_quizzes.json",
        "quick_quizzes.json",
        "contextual_stories.json",
        "word_roots.json",
        "hit_parades.json",
        "specialized_vocabulary.json",
        "advanced_sat_gre_quizzes.json",
        "final_exam.json"
    ]
    for f in json_files:
        src = os.path.join(PROJECT_ROOT, "data", f)
        dst = os.path.join(PROJECT_ROOT, "data", "source", f)
        if os.path.exists(src):
            shutil.move(src, dst)
            print(f"Moved {f} to data/source/")

    # 2. Move cache files
    cache_files = [
        ".story_cache.json",
        ".translation_cache.json",
        ".backlog_cache.json",
        ".gemini_cache.json",
        ".synonyms_antonyms_cache.json",
        ".advanced_cache.json",
        ".example_translation_cache.json",
        ".collocations_cache.json",
        ".root_audit_cache.json",
        "draft_translations.json",
        "refined_translations.json"
    ]
    for f in cache_files:
        src = os.path.join(PROJECT_ROOT, "data", f)
        dst = os.path.join(PROJECT_ROOT, "archive", "cache", f)
        if os.path.exists(src):
            shutil.move(src, dst)
            print(f"Moved {f} to archive/cache/")

    # Move scratch file from root to archive/cache
    scratch_src = os.path.join(PROJECT_ROOT, "scratch_affected_sentences.json")
    scratch_dst = os.path.join(PROJECT_ROOT, "archive", "cache", "scratch_affected_sentences.json")
    if os.path.exists(scratch_src):
        shutil.move(scratch_src, scratch_dst)
        print("Moved scratch_affected_sentences.json to archive/cache/")

    # 3. Move wordsmart.db
    db_src = os.path.join(PROJECT_ROOT, "data", "wordsmart.db")
    db_dst = os.path.join(PROJECT_ROOT, "data", "database", "wordsmart.db")
    if os.path.exists(db_src):
        shutil.move(db_src, db_dst)
        print("Moved wordsmart.db to data/database/")

    # 4. Move audio files directory
    audio_src = os.path.join(PROJECT_ROOT, "data", "audio")
    audio_dst = os.path.join(PROJECT_ROOT, "assets", "audio")
    if os.path.exists(audio_src):
        if os.path.exists(audio_dst):
            shutil.rmtree(audio_dst)
        shutil.move(audio_src, audio_dst)
        print("Moved data/audio/ to assets/audio/")

def update_script_paths():
    scripts_dir = os.path.join(PROJECT_ROOT, "scripts")
    for fn in os.listdir(scripts_dir):
        if not fn.endswith(".py") or fn == "reorganize_project.py":
            continue
            
        fp = os.path.join(scripts_dir, fn)
        with open(fp, "r", encoding="utf-8") as f:
            content = f.read()

        # Update DATA_DIR
        new_content = content.replace(
            'DATA_DIR = os.path.join(PROJECT_ROOT, "data")',
            'DATA_DIR = os.path.join(PROJECT_ROOT, "data", "source")'
        )

        # Update DB_PATH
        new_content = new_content.replace(
            'DB_PATH = os.path.join(DATA_DIR, "wordsmart.db")',
            'DB_PATH = os.path.join(PROJECT_ROOT, "data", "database", "wordsmart.db")'
        )
        new_content = new_content.replace(
            '"data/wordsmart.db"',
            '"data/database/wordsmart.db"'
        )
        new_content = new_content.replace(
            'data/wordsmart.db',
            'data/database/wordsmart.db'
        )

        # Update Cache paths
        new_content = new_content.replace(
            'CACHE_PATH = os.path.join(DATA_DIR, ".collocations_cache.json")',
            'CACHE_PATH = os.path.join(PROJECT_ROOT, "archive", "cache", ".collocations_cache.json")'
        )
        new_content = new_content.replace(
            'CACHE_PATH = os.path.join(DATA_DIR, ".example_translation_cache.json")',
            'CACHE_PATH = os.path.join(PROJECT_ROOT, "archive", "cache", ".example_translation_cache.json")'
        )
        new_content = new_content.replace(
            'REFINED_PATH = os.path.join(DATA_DIR, "refined_translations.json")',
            'REFINED_PATH = os.path.join(PROJECT_ROOT, "archive", "cache", "refined_translations.json")'
        )
        new_content = new_content.replace(
            'cache_path = os.path.join(DATA_DIR, ".backlog_cache.json")',
            'cache_path = os.path.join(PROJECT_ROOT, "archive", "cache", ".backlog_cache.json")'
        )
        new_content = new_content.replace(
            'cache_path = os.path.join(DATA_DIR, ".root_audit_cache.json")',
            'cache_path = os.path.join(PROJECT_ROOT, "archive", "cache", ".root_audit_cache.json")'
        )
        new_content = new_content.replace(
            'CACHE_PATH = os.path.join(DATA_DIR, ".synonyms_antonyms_cache.json")',
            'CACHE_PATH = os.path.join(PROJECT_ROOT, "archive", "cache", ".synonyms_antonyms_cache.json")'
        )
        new_content = new_content.replace(
            'CACHE_PATH = os.path.join(DATA_DIR, ".translation_cache.json")',
            'CACHE_PATH = os.path.join(PROJECT_ROOT, "archive", "cache", ".translation_cache.json")'
        )
        new_content = new_content.replace(
            'CACHE_PATH = os.path.join(DATA_DIR, ".story_cache.json")',
            'CACHE_PATH = os.path.join(PROJECT_ROOT, "archive", "cache", ".story_cache.json")'
        )
        new_content = new_content.replace(
            'draft_path = os.path.join(DATA_DIR, "draft_translations.json")',
            'draft_path = os.path.join(PROJECT_ROOT, "archive", "cache", "draft_translations.json")'
        )
        new_content = new_content.replace(
            'refined_path = os.path.join(DATA_DIR, "refined_translations.json")',
            'refined_path = os.path.join(PROJECT_ROOT, "archive", "cache", "refined_translations.json")'
        )

        # Update validate_collocations.py specifically
        new_content = new_content.replace(
            'CORE_PATH = os.path.join(PROJECT_ROOT, "data", "core_vocabulary.json")',
            'CORE_PATH = os.path.join(PROJECT_ROOT, "data", "source", "core_vocabulary.json")'
        )

        if new_content != content:
            with open(fp, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated paths in script: {fn}")

def main():
    print("🚀 Starting project reorganization...")
    create_dirs()
    move_files()
    update_script_paths()
    print("🎉 Project reorganization completed successfully!")

if __name__ == "__main__":
    main()
