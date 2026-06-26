import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
REPORT_PATH = os.path.join(PROJECT_ROOT, "docs", "database_audit_report.md")

def check_spaces(text):
    if not isinstance(text, str):
        return []
    issues = []
    if text != text.strip():
        issues.append("leading/trailing whitespace")
    if "  " in text:
        issues.append("double spaces")
    if "\r" in text or "\n" in text:
        issues.append("newlines in text")
    return issues

_book_words_cached = None
_book_text_cached = None

def is_valid_word(word_str, valid_set):
    global _book_words_cached, _book_text_cached
    w = word_str.upper().strip(".,;:!?()[]{}\"'")
    if not w:
        return True

    if _book_words_cached is None:
        _book_words_cached = set()
        _book_text_cached = ""
        book_path = os.path.join(PROJECT_ROOT, "docs", "Word Smart I.md")
        if os.path.exists(book_path):
            try:
                with open(book_path, "r", encoding="utf-8") as f:
                    _book_text_cached = f.read().upper()
                _book_words_cached = set(re.findall(r'\b[A-ZÀ-ÿ-]+\b', _book_text_cached))
            except Exception as e:
                print(f"Error reading book text: {e}")

    def in_sets(s):
        if s in valid_set:
            return True
        if s in _book_words_cached:
            return True
        if " " in s and _book_text_cached and s in _book_text_cached:
            return True
        if s in {"IMPECUNIOUS"}:
            return True
        return False

    if in_sets(w):
        return True
    # Strip plural 'S'
    if w.endswith('S') and in_sets(w[:-1]):
        return True
    # Strip 'ED' or replace with 'E'
    if w.endswith('ED'):
        if in_sets(w[:-2]):
            return True
        if in_sets(w[:-2] + 'E'):
            return True
    # Strip 'ING' or replace with 'E'
    if w.endswith('ING'):
        if in_sets(w[:-3]):
            return True
        if in_sets(w[:-3] + 'E'):
            return True
    # Strip 'D' (like scrutinized -> scrutinize)
    if w.endswith('D') and in_sets(w[:-1]):
        return True
    # Strip 'LY'
    if w.endswith('LY') and in_sets(w[:-2]):
        return True
    return False

def main():
    files = [
        "core_vocabulary.json",
        "flashcards.json",
        "mnemonics_database.json",
        "vocab_drills.json",
        "mcq_quizzes.json",
        "quick_quizzes.json",
        "advanced_sat_gre_quizzes.json",
        "hit_parades.json",
        "specialized_vocabulary.json",
        "contextual_stories.json",
        "final_exam.json",
        "word_roots.json"
    ]

    db_data = {}
    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                db_data[filename] = json.load(f)
        else:
            db_data[filename] = None

    violations = []

    # Collect valid words (core words + their derivatives)
    core = db_data.get("core_vocabulary.json")
    core_words = {}
    valid_words_set = set()
    if core:
        for w in core.get("words", []):
            word = w.get("word", "").upper()
            if word:
                core_words[word] = w
                valid_words_set.add(word)
                # Add derivatives
                for deriv in w.get("derivatives", {}).keys():
                    valid_words_set.add(deriv.upper())

    # 1. Core Vocabulary Audit
    if core:
        for idx, w in enumerate(core.get("words", [])):
            word = w.get("word", "").upper()
            
            # Format/space check
            for field in ["word", "pronunciation", "part_of_speech", "definition", "bengali_meaning"]:
                val = w.get(field, "")
                sp_issues = check_spaces(val)
                if sp_issues:
                    violations.append({
                        "file": "core_vocabulary.json",
                        "type": "Formatting",
                        "context": f"word '{word}' field '{field}'",
                        "issue": f"Contains {', '.join(sp_issues)}: '{val}'"
                    })
            
            # Casing check for word
            if w.get("word", "") != w.get("word", "").upper():
                violations.append({
                    "file": "core_vocabulary.json",
                    "type": "Casing",
                    "context": f"word '{word}'",
                    "issue": f"Word key is not fully uppercase: '{w.get('word')}'"
                })

            # Check part of speech standardization
            pos = w.get("part_of_speech", "").lower().strip()
            valid_pos = ["n", "v", "adj", "adv", "noun", "verb", "adjective", "adverb", "preposition", "conjunction", "pronoun", "interjection"]
            if pos not in valid_pos:
                violations.append({
                    "file": "core_vocabulary.json",
                    "type": "Invalid POS",
                    "context": f"word '{word}'",
                    "issue": f"Non-standard part of speech '{w.get('part_of_speech')}'"
                })

            # Examples check
            for ex_idx, ex in enumerate(w.get("examples", [])):
                sp_issues = check_spaces(ex)
                if sp_issues:
                    violations.append({
                        "file": "core_vocabulary.json",
                        "type": "Formatting",
                        "context": f"word '{word}' example {ex_idx}",
                        "issue": f"Contains {', '.join(sp_issues)}: '{ex}'"
                    })

    # 2. Flashcards Audit
    flashcards = db_data.get("flashcards.json")
    if flashcards and core_words:
        for f in flashcards.get("flashcards", []):
            word = f.get("word", "").upper()
            if word not in core_words:
                violations.append({
                    "file": "flashcards.json",
                    "type": "Referential",
                    "context": f"word '{word}'",
                    "issue": "Not found in core_vocabulary.json"
                })
                continue
            
            cw = core_words[word]
            
            # Cross-file definition check
            bs = f.get("back_side", {})
            f_def = bs.get("definition", "").strip()
            c_def = cw.get("definition", "").strip()
            if f_def != c_def:
                violations.append({
                    "file": "flashcards.json",
                    "type": "Cross-File Inconsistency",
                    "context": f"word '{word}' definition",
                    "issue": f"Flashcard definition differs from core_vocabulary.json\n  Core: '{c_def}'\n  Flash: '{f_def}'"
                })

            # Cross-file POS check
            f_pos = f.get("part_of_speech", "").strip().lower()
            c_pos = cw.get("part_of_speech", "").strip().lower()
            if f_pos != c_pos:
                violations.append({
                    "file": "flashcards.json",
                    "type": "Cross-File Inconsistency",
                    "context": f"word '{word}' part of speech",
                    "issue": f"Flashcard POS '{f_pos}' differs from core '{c_pos}'"
                })

            # Cross-file pronunciation check
            f_pron = f.get("pronunciation", "").strip()
            c_pron = cw.get("pronunciation", "").strip()
            if f_pron != c_pron:
                violations.append({
                    "file": "flashcards.json",
                    "type": "Cross-File Inconsistency",
                    "context": f"word '{word}' pronunciation",
                    "issue": f"Flashcard pronunciation '{f_pron}' differs from core '{c_pron}'"
                })

            # Whitespace checking
            for field in ["word", "pronunciation", "part_of_speech", "front_side"]:
                sp_issues = check_spaces(f.get(field, ""))
                if sp_issues:
                    violations.append({
                        "file": "flashcards.json",
                        "type": "Formatting",
                        "context": f"word '{word}' field '{field}'",
                        "issue": f"Contains {', '.join(sp_issues)}: '{f.get(field)}'"
                    })

    # 3. Vocab Drills Audit
    drills = db_data.get("vocab_drills.json")
    if drills and core_words:
        for d in drills.get("drills", []):
            word = d.get("word", "").upper()
            if word not in core_words:
                violations.append({
                    "file": "vocab_drills.json",
                    "type": "Referential",
                    "context": f"word '{word}'",
                    "issue": "Not found in core_vocabulary.json"
                })
                continue
            
            # Check MCQ structures
            for mcq_key in ["definition_mcq", "synonym_mcq", "antonym_mcq", "sentence_completion"]:
                sub_d = d.get(mcq_key)
                if sub_d:
                    options = sub_d.get("options", [])
                    correct = sub_d.get("correct_answer", "")
                    
                    if correct not in options:
                        violations.append({
                            "file": "vocab_drills.json",
                            "type": "Data Error",
                            "context": f"word '{word}' sub-drill '{mcq_key}'",
                            "issue": f"Correct answer '{correct}' is not in options list: {options}"
                        })
                    
                    if len(options) != len(set(options)):
                        violations.append({
                            "file": "vocab_drills.json",
                            "type": "Data Error",
                            "context": f"word '{word}' sub-drill '{mcq_key}' options",
                            "issue": f"Contains duplicate options: {options}"
                        })

    # 4. MCQ Quizzes Audit
    mcq = db_data.get("mcq_quizzes.json")
    if mcq and core_words:
        for qz in mcq.get("quizzes", []):
            qz_id = qz.get("quiz_id", "?")
            for q_idx, q in enumerate(qz.get("questions", [])):
                q_num = q.get("question_number", f"q-{q_idx}")
                correct = q.get("correct_answer", "")
                options = q.get("options", [])
                
                if correct not in options:
                    violations.append({
                        "file": "mcq_quizzes.json",
                        "type": "Data Error",
                        "context": f"quiz '{qz_id}' question {q_num} answer",
                        "issue": f"Correct answer '{correct}' is not in choices: {options}"
                    })

                if len(options) != len(set(options)):
                    violations.append({
                        "file": "mcq_quizzes.json",
                        "type": "Data Error",
                        "context": f"quiz '{qz_id}' question {q_num} options",
                        "issue": f"Contains duplicate choices: {options}"
                    })

                if correct and not is_valid_word(correct, valid_words_set):
                    violations.append({
                        "file": "mcq_quizzes.json",
                        "type": "Referential",
                        "context": f"quiz '{qz_id}' question {q_num} word '{correct}'",
                        "issue": f"Correct answer word is not found in core vocabulary (or derivatives)"
                    })

                sp_issues = check_spaces(q.get("question", ""))
                if sp_issues:
                    violations.append({
                        "file": "mcq_quizzes.json",
                        "type": "Formatting",
                        "context": f"quiz '{qz_id}' question {q_num} text",
                        "issue": f"Question text contains {', '.join(sp_issues)}"
                    })

    # 5. Quick Quizzes Audit
    qq = db_data.get("quick_quizzes.json")
    if qq and core_words:
        for qz in qq.get("quizzes", []):
            qz_id = qz.get("quiz_id", "?")
            matches = qz.get("matches", [])
            choices = qz.get("choices", {})
            answer_key = qz.get("answer_key", {})

            for match in matches:
                word = match.get("word", "")
                if word and not is_valid_word(word, valid_words_set):
                    violations.append({
                        "file": "quick_quizzes.json",
                        "type": "Referential",
                        "context": f"quiz '{qz_id}' match word '{word}'",
                        "issue": f"Word is not found in core vocabulary (or derivatives)"
                    })

            for w_num_str, opt_letter in answer_key.items():
                if opt_letter not in choices:
                    violations.append({
                        "file": "quick_quizzes.json",
                        "type": "Data Error",
                        "context": f"quiz '{qz_id}' answer key word {w_num_str}",
                        "issue": f"Mapped option key '{opt_letter}' not found in choices keys: {list(choices.keys())}"
                    })

    # 6. Advanced SAT/GRE Quizzes Audit
    adv_quizzes = db_data.get("advanced_sat_gre_quizzes.json")
    if adv_quizzes and core_words:
        for qz in adv_quizzes.get("quizzes", []):
            qz_id = qz.get("quiz_id", "?")
            
            sub_sections = [
                ("analogies", "stem"),
                ("sentence_completions", "sentence"),
                ("contextual_lexical", "sentence")
            ]
            
            for section_key, text_key in sub_sections:
                questions = qz.get(section_key, [])
                for q in questions:
                    q_num = q.get("question_number", "?")
                    stem_text = q.get(text_key, "")
                    options = q.get("options", [])
                    answer = q.get("correct_answer", "")
                    target_w = q.get("target_word", "")

                    if target_w and not is_valid_word(target_w, valid_words_set):
                        violations.append({
                            "file": "advanced_sat_gre_quizzes.json",
                            "type": "Referential",
                            "context": f"quiz '{qz_id}' {section_key} q-{q_num} target_word '{target_w}'",
                            "issue": "Word not found in core vocabulary (or derivatives)"
                        })

                    if len(options) != len(set(options)):
                        violations.append({
                            "file": "advanced_sat_gre_quizzes.json",
                            "type": "Data Error",
                            "context": f"quiz '{qz_id}' {section_key} q-{q_num} options",
                            "issue": f"Contains duplicate options: {options}"
                        })

                    if answer not in options:
                        violations.append({
                            "file": "advanced_sat_gre_quizzes.json",
                            "type": "Data Error",
                            "context": f"quiz '{qz_id}' {section_key} q-{q_num} correct_answer",
                            "issue": f"Correct answer '{answer}' is not present in options: {options}"
                        })

                    sp_issues = check_spaces(stem_text)
                    if sp_issues:
                        violations.append({
                            "file": "advanced_sat_gre_quizzes.json",
                            "type": "Formatting",
                            "context": f"quiz '{qz_id}' {section_key} q-{q_num} text",
                            "issue": f"Contains {', '.join(sp_issues)}: '{stem_text}'"
                        })

    # 7. Contextual Stories Audit
    stories = db_data.get("contextual_stories.json")
    if stories:
        for s_idx, s in enumerate(stories.get("stories", [])):
            s_id = s.get("quiz_id", f"idx-{s_idx}")
            title = s.get("quiz_title", "")
            covered = s.get("words_covered", [])
            eng_text = s.get("story_english", "")

            for w in covered:
                if not is_valid_word(w, valid_words_set):
                    violations.append({
                        "file": "contextual_stories.json",
                        "type": "Referential",
                        "context": f"story ID '{s_id}' word '{w}'",
                        "issue": "Covered word not found in core vocabulary"
                    })
                
                # Check presence in english text (case-insensitive boundary check)
                # Try multiple suffix variations for inflected forms (e.g. perfidy -> perfidious, proscribe -> proscription)
                w_clean = w.strip()
                patterns_to_try = [
                    re.compile(r'\b' + re.escape(w_clean) + r'\w*\b', re.IGNORECASE)
                ]
                if w_clean.upper().endswith('Y'):
                    patterns_to_try.append(re.compile(r'\b' + re.escape(w_clean[:-1]) + r'\w*\b', re.IGNORECASE))
                if w_clean.upper().endswith('E'):
                    patterns_to_try.append(re.compile(r'\b' + re.escape(w_clean[:-1]) + r'\w*\b', re.IGNORECASE))

                found_in_text = False
                for pat in patterns_to_try:
                    if pat.search(eng_text):
                        found_in_text = True
                        break

                if not found_in_text:
                    violations.append({
                        "file": "contextual_stories.json",
                        "type": "Content Mismatch",
                        "context": f"story '{title}' (ID {s_id}) covered word '{w}'",
                        "issue": "Word is listed as covered but not found in story text."
                    })

            # Check spaces in story text
            sp_issues = check_spaces(eng_text)
            if "double spaces" in sp_issues:
                violations.append({
                    "file": "contextual_stories.json",
                    "type": "Formatting",
                    "context": f"story '{title}' text",
                    "issue": "Contains double spaces"
                })

    # 8. Final Exam Audit
    exam = db_data.get("final_exam.json")
    if exam and core_words:
        for d in exam.get("drills", []):
            drill_num = d.get("drill_number", "?")
            drill_type = d.get("drill_type", "")
            questions = d.get("questions", [])
            answers = d.get("answers", {})

            for q in questions:
                q_num = str(q.get("question_number", ""))
                correct = answers.get(q_num, "")

                if drill_type == "completions":
                    options = q.get("options", {})
                    if correct not in options:
                        violations.append({
                            "file": "final_exam.json",
                            "type": "Data Error",
                            "context": f"drill {drill_num} completions q-{q_num}",
                            "issue": f"Correct answer key '{correct}' is not in options: {list(options.keys())}"
                        })
                    opt_vals = list(options.values())
                    if len(opt_vals) != len(set(opt_vals)):
                        violations.append({
                            "file": "final_exam.json",
                            "type": "Data Error",
                            "context": f"drill {drill_num} completions q-{q_num} options",
                            "issue": f"Contains duplicate choices: {opt_vals}"
                        })
                elif drill_type == "buddy check":
                    # buddy check is matching
                    right_letters = [item.get("right_choice_letter", "") for item in questions]
                    if correct not in right_letters:
                        violations.append({
                            "file": "final_exam.json",
                            "type": "Data Error",
                            "context": f"drill {drill_num} buddy check q-{q_num}",
                            "issue": f"Correct matching letter '{correct}' is not one of the choice letters: {right_letters}"
                        })
                elif drill_type == "odd man out":
                    words_list = q.get("words", [])
                    if correct not in words_list:
                        violations.append({
                            "file": "final_exam.json",
                            "type": "Data Error",
                            "context": f"drill {drill_num} odd man out q-{q_num}",
                            "issue": f"Correct answer word '{correct}' is not in the choices: {words_list}"
                        })
                elif drill_type == "relationships":
                    if correct not in ["S", "O", "U"]:
                        violations.append({
                            "file": "final_exam.json",
                            "type": "Data Error",
                            "context": f"drill {drill_num} relationships q-{q_num}",
                            "issue": f"Answer '{correct}' must be 'S', 'O', or 'U'"
                        })

    # 9. Word Roots Audit
    roots = db_data.get("word_roots.json")
    if roots and core_words:
        for r in roots.get("roots", []):
            root_str = r.get("root", "")
            for w in r.get("words", []):
                if w and not is_valid_word(w, valid_words_set):
                    violations.append({
                        "file": "word_roots.json",
                        "type": "Referential",
                        "context": f"root '{root_str}' word '{w}'",
                        "issue": "Word is not found in core vocabulary"
                    })

    # 10. Hit Parades Audit
    hp = db_data.get("hit_parades.json")
    if hp and core_words:
        for hp_key in ["sat_hit_parade", "gre_hit_parade"]:
            for entry in hp.get(hp_key, []):
                word = entry.get("word", "")
                if word and not is_valid_word(word, valid_words_set):
                    violations.append({
                        "file": "hit_parades.json",
                        "type": "Referential",
                        "context": f"hit parade '{hp_key}' word '{word}'",
                        "issue": "Word is not found in core vocabulary"
                    })

    # Output to markdown file
    print(f"Total violations found: {len(violations)}")
    
    report_lines = [
        "# WordSmart Database Deep Audit Report",
        "",
        "## Executive Summary",
        "",
        "This report is generated by `scripts/deep_audit_databases.py` to identify data inconsistencies, formatting anomalies (whitespace, double spaces), casing issues, and referential errors across all JSON databases.",
        "",
        f"*   **Total Issues Identified:** {len(violations)}",
        "",
        "---",
        "",
        "## Summary of Violations by Category",
        ""
    ]

    by_type = {}
    by_file = {}
    for v in violations:
        by_type[v["type"]] = by_type.get(v["type"], 0) + 1
        by_file[v["file"]] = by_file.get(v["file"], 0) + 1

    report_lines.append("### By Issue Type")
    for t, count in sorted(by_type.items()):
        report_lines.append(f"*   **{t}:** {count}")
    report_lines.append("")

    report_lines.append("### By Database File")
    for f, count in sorted(by_file.items()):
        report_lines.append(f"*   **{f}:** {count}")
    report_lines.append("")

    report_lines.append("---")
    report_lines.append("")
    report_lines.append("## Detailed Violation Logs")
    report_lines.append("")

    if not violations:
        report_lines.append("🎉 **No inconsistencies or formatting issues found! All databases are in pristine condition.**")
    else:
        # Group violations by file
        by_file_violations = {}
        for v in violations:
            by_file_violations.setdefault(v["file"], []).append(v)
            
        for f, vlist in sorted(by_file_violations.items()):
            report_lines.append(f"### 📂 **{f}** ({len(vlist)} issues)")
            report_lines.append("")
            report_lines.append("| Type | Location / Context | Description |")
            report_lines.append("| :--- | :--- | :--- |")
            for item in vlist:
                desc = item["issue"].replace("\n", " ")
                report_lines.append(f"| {item['type']} | {item['context']} | {desc} |")
            report_lines.append("")

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    print(f"🎉 Deep audit report written to {REPORT_PATH}")

if __name__ == "__main__":
    main()
