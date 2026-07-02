#!/usr/bin/env python3
"""Script to migrate JSON database files into a single structured, normalized SQLite database (data/database/wordsmart.db)."""

import json
import os
import sqlite3

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data", "source")
DB_PATH = os.path.join(PROJECT_ROOT, "data", "database", "wordsmart.db")

def main():
    print("🚀 Starting SQLite Database Migration...")
    
    # 1. Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Enforce foreign key constraints
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # 2. Drop existing tables to ensure clean rebuild (drop child tables first)
    tables = [
        "bookmarks",
        "progress",
        "final_exam",
        "specialized_vocabulary",
        "word_roots",
        "roots",
        "hit_parades",
        "advanced_sat_gre_quizzes",
        "quick_quizzes",
        "mcq_quizzes",
        "contextual_stories",
        "vocab_drills",
        "flashcards",
        "word_examples",
        "word_synonyms",
        "word_antonyms",
        "word_derivatives",
        "word_collocations",
        "words",
        "core_vocabulary" # Legacy table
    ]
    for table in tables:
        cursor.execute(f"DROP TABLE IF EXISTS {table};")
    
    # 3. Create tables matching relational document schema
    
    # words table (replaces core_vocabulary)
    cursor.execute("""
    CREATE TABLE words (
        id INTEGER PRIMARY KEY,
        word TEXT UNIQUE NOT NULL,
        pronunciation TEXT,
        part_of_speech TEXT,
        definition TEXT,
        bengali_meaning TEXT,
        mnemonic TEXT,
        level TEXT,
        audio TEXT,
        quick_quiz_id INTEGER
    );
    """)
    
    # word_examples
    cursor.execute("""
    CREATE TABLE word_examples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        example_text TEXT NOT NULL,
        translation TEXT,
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
    """)
    
    # word_synonyms
    cursor.execute("""
    CREATE TABLE word_synonyms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        synonym TEXT NOT NULL,
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
    """)
    
    # word_antonyms
    cursor.execute("""
    CREATE TABLE word_antonyms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        antonym TEXT NOT NULL,
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
    """)
    
    # word_derivatives
    cursor.execute("""
    CREATE TABLE word_derivatives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        derivative_word TEXT NOT NULL,
        part_of_speech TEXT NOT NULL,
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
    """)
    
    # word_collocations
    cursor.execute("""
    CREATE TABLE word_collocations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        collocation TEXT NOT NULL,
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
    """)
    
    # roots
    cursor.execute("""
    CREATE TABLE roots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        root TEXT UNIQUE NOT NULL,
        meaning TEXT NOT NULL
    );
    """)
    
    # word_roots (Many-to-Many association)
    cursor.execute("""
    CREATE TABLE word_roots (
        word_id INTEGER NOT NULL,
        root_id INTEGER NOT NULL,
        PRIMARY KEY (word_id, root_id),
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
        FOREIGN KEY (root_id) REFERENCES roots(id) ON DELETE CASCADE
    );
    """)
    
    # flashcards
    cursor.execute("""
    CREATE TABLE flashcards (
        word_id INTEGER PRIMARY KEY,
        additional_example TEXT,
        additional_example_bengali TEXT,
        mnemonic_hint TEXT,
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
    """)
    
    # vocab_drills
    cursor.execute("""
    CREATE TABLE vocab_drills (
        word_id INTEGER PRIMARY KEY,
        bengali_meaning TEXT NOT NULL,
        spelling TEXT NOT NULL,             -- JSON Object
        definition_mcq TEXT NOT NULL,       -- JSON Object
        synonym_mcq TEXT NOT NULL,          -- JSON Object
        antonym_mcq TEXT NOT NULL,          -- JSON Object
        sentence_completion TEXT NOT NULL,  -- JSON Object
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
    """)
    
    # contextual_stories
    cursor.execute("""
    CREATE TABLE contextual_stories (
        quiz_id INTEGER PRIMARY KEY,
        quiz_title TEXT NOT NULL,
        words_covered TEXT NOT NULL,        -- JSON Array
        story_english TEXT NOT NULL,
        story_bengali TEXT NOT NULL,
        vocabulary_mapping TEXT NOT NULL    -- JSON Array
    );
    """)
    
    # mcq_quizzes
    cursor.execute("""
    CREATE TABLE mcq_quizzes (
        quiz_id INTEGER PRIMARY KEY,
        quiz_title TEXT NOT NULL,
        questions TEXT NOT NULL             -- JSON Array
    );
    """)
    
    # quick_quizzes
    cursor.execute("""
    CREATE TABLE quick_quizzes (
        quiz_id INTEGER PRIMARY KEY,
        quiz_title TEXT NOT NULL,
        matches TEXT NOT NULL,              -- JSON Array
        choices TEXT NOT NULL,              -- JSON Object
        answer_key TEXT NOT NULL            -- JSON Object
    );
    """)
    
    # advanced_sat_gre_quizzes
    cursor.execute("""
    CREATE TABLE advanced_sat_gre_quizzes (
        quiz_id INTEGER PRIMARY KEY,
        quiz_title TEXT NOT NULL,
        analogies TEXT NOT NULL,            -- JSON Array
        sentence_completions TEXT NOT NULL, -- JSON Array
        contextual_lexical TEXT NOT NULL    -- JSON Array
    );
    """)
    
    # hit_parades
    cursor.execute("""
    CREATE TABLE hit_parades (
        list_name TEXT NOT NULL,
        word_id INTEGER NOT NULL,
        rank INTEGER NOT NULL,
        PRIMARY KEY (list_name, word_id),
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
    """)
    
    # specialized_vocabulary
    cursor.execute("""
    CREATE TABLE specialized_vocabulary (
        chapter_number INTEGER NOT NULL,
        chapter_title TEXT NOT NULL,
        term TEXT NOT NULL,
        definition TEXT NOT NULL,
        examples TEXT NOT NULL,             -- JSON Array
        PRIMARY KEY (chapter_number, term)
    );
    """)
    
    # final_exam
    cursor.execute("""
    CREATE TABLE final_exam (
        drill_number INTEGER PRIMARY KEY,
        drill_title TEXT NOT NULL,
        drill_type TEXT NOT NULL,
        instructions TEXT NOT NULL,
        questions TEXT NOT NULL,            -- JSON Array
        answers TEXT NOT NULL               -- JSON Object
    );
    """)
    
    # bookmarks
    cursor.execute("""
    CREATE TABLE bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        word_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, word_id),
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
    """)
    
    # progress
    cursor.execute("""
    CREATE TABLE progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        word_id INTEGER NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        is_reviewed BOOLEAN DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        incorrect_count INTEGER DEFAULT 0,
        mastery_score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'unlearned',
        last_reviewed_at TIMESTAMP,
        next_review_at TIMESTAMP,
        UNIQUE(user_id, word_id),
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
    """)
    
    # Create indexes for optimized lookup & join performance
    cursor.execute("CREATE INDEX idx_word_examples_word_id ON word_examples(word_id);")
    cursor.execute("CREATE INDEX idx_word_synonyms_word_id ON word_synonyms(word_id);")
    cursor.execute("CREATE INDEX idx_word_antonyms_word_id ON word_antonyms(word_id);")
    cursor.execute("CREATE INDEX idx_word_derivatives_word_id ON word_derivatives(word_id);")
    cursor.execute("CREATE INDEX idx_word_collocations_word_id ON word_collocations(word_id);")
    cursor.execute("CREATE INDEX idx_word_roots_word_id ON word_roots(word_id);")
    cursor.execute("CREATE INDEX idx_word_roots_root_id ON word_roots(root_id);")
    cursor.execute("CREATE INDEX idx_hit_parades_word_id ON hit_parades(word_id);")
    cursor.execute("CREATE INDEX idx_specialized_term ON specialized_vocabulary(term);")
    cursor.execute("CREATE INDEX idx_bookmarks_user_word ON bookmarks(user_id, word_id);")
    cursor.execute("CREATE INDEX idx_progress_user_word ON progress(user_id, word_id);")
    cursor.execute("CREATE INDEX idx_progress_status ON progress(status);")
    
    print("📁 Table schemas and indexes created successfully.")

    # 4. Scan, load, and perform insertions
    
    # Build word name to id map
    word_to_id = {}
    inserted_words = set()
    
    # Load core vocabulary
    core_path = os.path.join(DATA_DIR, "core_vocabulary.json")
    if os.path.exists(core_path):
        with open(core_path, "r", encoding="utf-8") as f:
            core_data = json.load(f)
            
        for w in core_data.get("words", []):
            w_word = w.get("word", "")
            inserted_words.add(w_word.upper())
            
    # Collect words from hit_parades.json
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
                    
    # Collect words from word_roots.json
    root_words = set()
    roots_path = os.path.join(DATA_DIR, "word_roots.json")
    if os.path.exists(roots_path):
        with open(roots_path, "r", encoding="utf-8") as f:
            roots_data = json.load(f)
        for rt in roots_data.get("roots", []):
            for w_name in rt.get("words", []):
                if w_name:
                    root_words.add(w_name.upper())
                    
    # Determine which words from secondary lists are not in core
    extra_words = (hp_words | root_words) - inserted_words
    print(f"ℹ️ Found {len(inserted_words)} core words and {len(extra_words)} extra words from secondary lists.")

    # 4.1 Insert core words first to preserve explicit IDs
    if os.path.exists(core_path):
        for w in core_data.get("words", []):
            w_word = w.get("word", "")
            w_id = w.get("id")
            word_to_id[w_word.upper()] = w_id
            
            cursor.execute("""
            INSERT INTO words 
            (id, word, pronunciation, part_of_speech, definition, bengali_meaning, mnemonic, level, audio, quick_quiz_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                w_id,
                w_word,
                w.get("pronunciation"),
                w.get("part_of_speech"),
                w.get("definition"),
                w.get("bengali_meaning"),
                w.get("mnemonic"),
                w.get("level"),
                w.get("audio"),
                w.get("quick_quiz_id")
            ))
            
            # Populate 1:N attributes
            examples = w.get("examples", [])
            translations = w.get("example_translations", [])
            for idx, ex in enumerate(examples):
                trans = translations[idx] if idx < len(translations) else ""
                cursor.execute("""
                INSERT INTO word_examples (word_id, example_text, translation)
                VALUES (?, ?, ?)
                """, (w_id, ex, trans))
                
            for syn in w.get("synonyms", []):
                cursor.execute("""
                INSERT INTO word_synonyms (word_id, synonym)
                VALUES (?, ?)
                """, (w_id, syn))
                
            for ant in w.get("antonyms", []):
                cursor.execute("""
                INSERT INTO word_antonyms (word_id, antonym)
                VALUES (?, ?)
                """, (w_id, ant))
                
            for coll in w.get("collocations", []):
                cursor.execute("""
                INSERT INTO word_collocations (word_id, collocation)
                VALUES (?, ?)
                """, (w_id, coll))
                
            # Populate derivatives
            derivatives = w.get("derivatives", {})
            for d_word, d_pos in derivatives.items():
                cursor.execute("""
                INSERT INTO word_derivatives (word_id, derivative_word, part_of_speech)
                VALUES (?, ?, ?)
                """, (w_id, d_word, d_pos))
                
        print("  ✅ Core Vocabulary (normalized tables: words, examples, synonyms, antonyms, derivatives, collocations) migrated.")

    # 4.2 Insert extra words as stubs to satisfy foreign keys
    for w_word in sorted(extra_words):
        cursor.execute("INSERT INTO words (word) VALUES (?)", (w_word,))
        word_to_id[w_word] = cursor.lastrowid
    print(f"  ✅ {len(extra_words)} extra words inserted as stubs.")

    # 4.3 Populate roots & word_roots
    root_to_id = {}
    if os.path.exists(roots_path):
        for rt in roots_data.get("roots", []):
            r_name = rt.get("root", "")
            r_meaning = rt.get("meaning", "")
            cursor.execute("""
            INSERT OR IGNORE INTO roots (root, meaning)
            VALUES (?, ?)
            """, (r_name, r_meaning))
            
            cursor.execute("SELECT id FROM roots WHERE root = ?", (r_name,))
            root_to_id[r_name] = cursor.fetchone()[0]
            
        # Parse root tags from core vocabulary just in case any extra roots exist
        if os.path.exists(core_path):
            for w in core_data.get("words", []):
                for rt in w.get("root_tags", []):
                    r_name = rt.get("root")
                    r_meaning = rt.get("meaning")
                    if r_name and r_name not in root_to_id:
                        cursor.execute("""
                        INSERT OR IGNORE INTO roots (root, meaning)
                        VALUES (?, ?)
                        """, (r_name, r_meaning))
                        cursor.execute("SELECT id FROM roots WHERE root = ?", (r_name,))
                        root_to_id[r_name] = cursor.fetchone()[0]
                        
        # Now establish M:N word_roots relationships
        # 1. From word_roots.json
        for rt in roots_data.get("roots", []):
            r_name = rt.get("root", "")
            r_id = root_to_id.get(r_name)
            if not r_id:
                continue
            for w_name in rt.get("words", []):
                w_id = word_to_id.get(w_name.upper())
                if w_id:
                    cursor.execute("""
                    INSERT OR IGNORE INTO word_roots (word_id, root_id)
                    VALUES (?, ?)
                    """, (w_id, r_id))
                    
        # 2. From core_vocabulary.json root_tags
        if os.path.exists(core_path):
            for w in core_data.get("words", []):
                w_id = w.get("id")
                for rt in w.get("root_tags", []):
                    r_name = rt.get("root")
                    r_id = root_to_id.get(r_name)
                    if w_id and r_id:
                        cursor.execute("""
                        INSERT OR IGNORE INTO word_roots (word_id, root_id)
                        VALUES (?, ?)
                        """, (w_id, r_id))
                        
        print("  ✅ Word Roots (normalized tables: roots, word_roots) migrated.")

    # flashcards.json
    flashcards_path = os.path.join(DATA_DIR, "flashcards.json")
    if os.path.exists(flashcards_path):
        with open(flashcards_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for fc in data.get("flashcards", []):
            fc_word = fc.get("word", "")
            w_id = word_to_id.get(fc_word.upper())
            if not w_id:
                print(f"⚠️ Warning: Word '{fc_word}' in flashcards.json not found.")
                continue
            back_side = fc.get("back_side", {})
            cursor.execute("""
            INSERT INTO flashcards (word_id, additional_example, additional_example_bengali, mnemonic_hint)
            VALUES (?, ?, ?, ?)
            """, (
                w_id,
                back_side.get("additional_example"),
                back_side.get("additional_example_bengali"),
                back_side.get("mnemonic_hint")
            ))
        print("  ✅ Flashcards migrated.")

    # vocab_drills.json
    drills_path = os.path.join(DATA_DIR, "vocab_drills.json")
    if os.path.exists(drills_path):
        with open(drills_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for dr in data.get("drills", []):
            dr_word = dr.get("word", "")
            w_id = word_to_id.get(dr_word.upper())
            if not w_id:
                print(f"⚠️ Warning: Word '{dr_word}' in vocab_drills.json not found.")
                continue
            cursor.execute("""
            INSERT INTO vocab_drills (word_id, bengali_meaning, spelling, definition_mcq, synonym_mcq, antonym_mcq, sentence_completion)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                w_id,
                dr.get("bengali_meaning", ""),
                json.dumps(dr.get("spelling", {}), ensure_ascii=False),
                json.dumps(dr.get("definition_mcq", {}), ensure_ascii=False),
                json.dumps(dr.get("synonym_mcq", {}), ensure_ascii=False),
                json.dumps(dr.get("antonym_mcq", {}), ensure_ascii=False),
                json.dumps(dr.get("sentence_completion", {}), ensure_ascii=False)
            ))
        print("  ✅ Vocab Drills migrated.")

    # contextual_stories.json
    stories_path = os.path.join(DATA_DIR, "contextual_stories.json")
    if os.path.exists(stories_path):
        with open(stories_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for st in data.get("stories", []):
            cursor.execute("""
            INSERT INTO contextual_stories (quiz_id, quiz_title, words_covered, story_english, story_bengali, vocabulary_mapping)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (
                st.get("quiz_id"),
                st.get("quiz_title", ""),
                json.dumps(st.get("words_covered", []), ensure_ascii=False),
                st.get("story_english", ""),
                st.get("story_bengali", ""),
                json.dumps(st.get("vocabulary_mapping", []), ensure_ascii=False)
            ))
        print("  ✅ Contextual Stories migrated.")

    # mcq_quizzes.json
    mcq_path = os.path.join(DATA_DIR, "mcq_quizzes.json")
    if os.path.exists(mcq_path):
        with open(mcq_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for mq in data.get("quizzes", []):
            cursor.execute("""
            INSERT INTO mcq_quizzes (quiz_id, quiz_title, questions)
            VALUES (?, ?, ?)
            """, (
                mq.get("quiz_id"),
                mq.get("quiz_title", ""),
                json.dumps(mq.get("questions", []), ensure_ascii=False)
            ))
        print("  ✅ MCQ Quizzes migrated.")

    # quick_quizzes.json
    quick_path = os.path.join(DATA_DIR, "quick_quizzes.json")
    if os.path.exists(quick_path):
        with open(quick_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for qq in data.get("quizzes", []):
            cursor.execute("""
            INSERT INTO quick_quizzes (quiz_id, quiz_title, matches, choices, answer_key)
            VALUES (?, ?, ?, ?, ?)
            """, (
                qq.get("quiz_id"),
                qq.get("quiz_title", ""),
                json.dumps(qq.get("matches", []), ensure_ascii=False),
                json.dumps(qq.get("choices", {}), ensure_ascii=False),
                json.dumps(qq.get("answer_key", {}), ensure_ascii=False)
            ))
        print("  ✅ Quick Quizzes migrated.")

    # advanced_sat_gre_quizzes.json
    adv_path = os.path.join(DATA_DIR, "advanced_sat_gre_quizzes.json")
    if os.path.exists(adv_path):
        with open(adv_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for aq in data.get("quizzes", []):
            cursor.execute("""
            INSERT INTO advanced_sat_gre_quizzes (quiz_id, quiz_title, analogies, sentence_completions, contextual_lexical)
            VALUES (?, ?, ?, ?, ?)
            """, (
                aq.get("quiz_id"),
                aq.get("quiz_title", ""),
                json.dumps(aq.get("analogies", []), ensure_ascii=False),
                json.dumps(aq.get("sentence_completions", []), ensure_ascii=False),
                json.dumps(aq.get("contextual_lexical", []), ensure_ascii=False)
            ))
        print("  ✅ Advanced SAT/GRE Quizzes migrated.")

    # hit_parades.json
    if os.path.exists(hp_path):
        for list_key in ["sat_hit_parade", "gre_hit_parade"]:
            for idx, entry in enumerate(hp_data.get(list_key, [])):
                hp_word = entry.get("word", "")
                w_id = word_to_id.get(hp_word.upper())
                if not w_id:
                    print(f"⚠️ Warning: Word '{hp_word}' in hit_parades.json not found in resolved mapping.")
                    continue
                cursor.execute("""
                INSERT INTO hit_parades (list_name, word_id, rank)
                VALUES (?, ?, ?)
                """, (
                    list_key,
                    w_id,
                    entry.get("rank", idx + 1)
                ))
        print("  ✅ Hit Parades migrated.")

    # specialized_vocabulary.json
    spec_path = os.path.join(DATA_DIR, "specialized_vocabulary.json")
    if os.path.exists(spec_path):
        with open(spec_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for ch in data.get("chapters", []):
            ch_num = ch.get("chapter_number")
            ch_title = ch.get("chapter_title", "")
            for entry in ch.get("entries", []):
                term = entry.get("term", "")
                if not term:
                    term = entry.get("word", "")
                cursor.execute("""
                INSERT INTO specialized_vocabulary (chapter_number, chapter_title, term, definition, examples)
                VALUES (?, ?, ?, ?, ?)
                """, (
                    ch_num,
                    ch_title,
                    term,
                    entry.get("definition", ""),
                    json.dumps(entry.get("examples", []), ensure_ascii=False)
                ))
        print("  ✅ Specialized Vocabulary migrated.")

    # final_exam.json
    exam_path = os.path.join(DATA_DIR, "final_exam.json")
    if os.path.exists(exam_path):
        with open(exam_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for dr in data.get("drills", []):
            cursor.execute("""
            INSERT INTO final_exam (drill_number, drill_title, drill_type, instructions, questions, answers)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (
                dr.get("drill_number"),
                dr.get("drill_title", ""),
                dr.get("drill_type", ""),
                dr.get("instructions", ""),
                json.dumps(dr.get("questions", []), ensure_ascii=False),
                json.dumps(dr.get("answers", {}), ensure_ascii=False)
            ))
        print("  ✅ Final Exam migrated.")

    # 5. Commit and close
    conn.commit()
    conn.close()
    
    print("\n🎉 SQLite Database Rebuild Complete! Created: data/database/wordsmart.db")

if __name__ == "__main__":
    main()
