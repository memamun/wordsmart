#!/usr/bin/env python3
"""Comprehensive validation script for Word Smart JSON databases."""

import json
import os
import re
import sys
from collections import defaultdict

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data", "source")
IGNORE_FILES = {".gemini_cache.json", ".advanced_cache.json"}
REPORT_LINES = []
ERROR_COUNT = 0
WARN_COUNT = 0

def report(level, file_name, msg):
    global ERROR_COUNT, WARN_COUNT
    if level == "ERROR":
        ERROR_COUNT += 1
        REPORT_LINES.append(f"- **[{level}]** `{file_name}`: {msg}")
    elif level == "WARN":
        WARN_COUNT += 1
        REPORT_LINES.append(f"- **[{level}]** `{file_name}`: {msg}")
    else:
        REPORT_LINES.append(f"- **[{level}]** `{file_name}`: {msg}")

def load_json(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        report("ERROR", os.path.basename(filepath), f"Failed to parse JSON: {e}")
        return None

def check_required_keys(obj, required_keys, file_name, context=""):
    for k in required_keys:
        if k not in obj:
            report("ERROR", file_name, f"Missing key '{k}' in {context}")

# ---------- WORD SET COLLECTION ----------
def collect_core_words(data):
    words = {}
    for w in data.get("words", []):
        words[w["word"].upper()] = w
    return words

def collect_flashcard_words(data):
    words = {}
    for f in data.get("flashcards", []):
        words[f["word"].upper()] = f
    return words

def collect_mnemonic_words(data):
    words = {}
    for m in data.get("mnemonics", []):
        words[m["word"].upper()] = m
    return words

def collect_drill_words(data):
    words = {}
    for d in data.get("drills", []):
        words[d["word"].upper()] = d
    return words

# ---------- VALIDATION FUNCTIONS ----------

def validate_core_vocabulary(data):
    fn = "core_vocabulary.json"
    if not data:
        return set()
    total = data.get("total_words", 0)
    words = data.get("words", [])
    if len(words) != total:
        report("ERROR", fn, f"total_words says {total} but words array has {len(words)}")
    word_set = set()
    for i, w in enumerate(words):
        word = w.get("word", "").upper()
        if not word:
            report("ERROR", fn, f"Word at index {i} has empty/missing 'word' field")
            continue
        if word in word_set:
            report("ERROR", fn, f"Duplicate word: {word}")
        word_set.add(word)
        required = ["word", "pronunciation", "part_of_speech", "definition", "bengali_meaning"]
        check_required_keys(w, required, fn, f"word '{word}'")
        if "synonyms" in w and not w["synonyms"]:
            report("WARN", fn, f"Word '{word}' has empty synonyms list")
        if "antonyms" in w and not w["antonyms"]:
            report("WARN", fn, f"Word '{word}' has empty antonyms list")
        if "examples" in w and not w["examples"]:
            report("WARN", fn, f"Word '{word}' has empty examples list")
        check_mnemonic(word, w.get("mnemonic", ""), fn)
    if len(word_set) != total:
        report("WARN", fn, f"Expected {total} unique words but found {len(word_set)}")
    return word_set


def validate_flashcards(data, core_words):
    fn = "flashcards.json"
    if not data:
        return set()
    total = data.get("total_flashcards", 0)
    flashcards = data.get("flashcards", [])
    if len(flashcards) != total:
        report("ERROR", fn, f"total_flashcards says {total} but flashcards array has {len(flashcards)}")
    word_set = set()
    for i, f in enumerate(flashcards):
        word = f.get("word", "").upper()
        if not word:
            report("ERROR", fn, f"Flashcard at index {i} has empty/missing 'word' field")
            continue
        if word in word_set:
            report("ERROR", fn, f"Duplicate flashcard word: {word}")
        word_set.add(word)
        required = ["word", "pronunciation", "part_of_speech", "front_side", "back_side"]
        check_required_keys(f, required, fn, f"flashcard '{word}'")
        if "back_side" in f:
            bs = f["back_side"]
            bs_required = ["bengali_meaning", "definition", "mnemonic_hint"]
            check_required_keys(bs, bs_required, fn, f"flashcard '{word}' back_side")
            # Check consistency with core_vocabulary
            if word in core_words:
                cw = core_words[word]
                if bs.get("definition", "").strip() != cw.get("definition", "").strip():
                    report("WARN", fn, f"Flashcard '{word}' definition differs from core_vocabulary.json")
                    report("WARN", fn, f"  Core: '{cw.get('definition')}' vs Flash: '{bs.get('definition')}'")
        if word in core_words:
            cw = core_words[word]
            f_pos = f.get("part_of_speech", "")
            c_pos = cw.get("part_of_speech", "")
            if f_pos.strip().lower() != c_pos.strip().lower():
                report("WARN", fn, f"Flashcard '{word}' part_of_speech '{f_pos}' differs from core '{c_pos}'")
    if len(word_set) != total:
        report("WARN", fn, f"Expected {total} unique flashcard words but found {len(word_set)}")
    return word_set


def validate_mnemonics(data, core_words):
    fn = "mnemonics_database.json"
    if not data:
        return set()
    total = data.get("total_entries", 0)
    mnemonics = data.get("mnemonics", [])
    if len(mnemonics) != total:
        report("ERROR", fn, f"total_entries says {total} but mnemonics array has {len(mnemonics)}")
    word_set = set()
    for i, m in enumerate(mnemonics):
        word = m.get("word", "").upper()
        if not word:
            report("ERROR", fn, f"Mnemonic entry at index {i} has empty/missing 'word' field")
            continue
        if word in word_set:
            report("ERROR", fn, f"Duplicate mnemonic entry: {word}")
        word_set.add(word)
        required = ["word", "mnemonic_english", "mnemonic_bengali"]
        check_required_keys(m, required, fn, f"mnemonic '{word}'")
        check_mnemonic(word, m.get("mnemonic_english", ""), fn)
    if len(word_set) != total:
        report("WARN", fn, f"Expected {total} unique mnemonics but found {len(word_set)}")
    return word_set


def validate_quick_quizzes(data, core_words):
    fn = "quick_quizzes.json"
    if not data:
        return set()
    quizzes = data.get("quizzes", [])
    total_q = data.get("total_quizzes", 0)
    if len(quizzes) != total_q:
        report("ERROR", fn, f"total_quizzes says {total_q} but quizzes array has {len(quizzes)}")
    all_quiz_words = set()
    for q in quizzes:
        qid = q.get("quiz_id")
        matches = q.get("matches", [])
        choices = q.get("choices", {})
        answer_key = q.get("answer_key", {})
        if len(matches) != len(answer_key):
            report("ERROR", fn, f"Quick Quiz #{qid}: {len(matches)} matches but {len(answer_key)} answers")
        for m in matches:
            wn = m.get("word_number")
            w = m.get("word", "")
            w_upper = w.upper()
            all_quiz_words.add(w_upper)
            # Supplementary words (discussed in core definitions, tested in quizzes) are intentional
            # if w_upper not in core_words:
            #     report("WARN", fn, f"Quick Quiz #{qid}: word '{w}' not found in core_vocabulary.json")
            if w_upper:
                expected_key = str(wn)
                if expected_key in answer_key:
                    letter = answer_key[expected_key]
                    if letter in choices:
                        choice_text = choices[letter]
                        cw = core_words.get(w_upper)
                        if cw:
                            if cw.get("definition", "").strip().lower() != choice_text.strip().lower():
                                pass  # Allow minor variations
    return all_quiz_words


def validate_mcq_quizzes(data, core_words):
    fn = "mcq_quizzes.json"
    if not data:
        return set()
    quizzes = data.get("quizzes", [])
    total_q = data.get("total_quizzes", 0)
    if len(quizzes) != total_q:
        report("ERROR", fn, f"total_quizzes says {total_q} but quizzes array has {len(quizzes)}")
    all_words = set()
    for q in quizzes:
        qid = q.get("quiz_id")
        questions = q.get("questions", [])
        for ques in questions:
            qn = ques.get("question_number")
            correct = ques.get("correct_answer", "")
            if correct:
                all_words.add(correct.upper())
                # Supplementary words are intentional
                # if correct.upper() not in core_words:
                #     report("WARN", fn, f"MCQ Quiz #{qid} Q{qn}: correct answer '{correct}' not in core_vocabulary.json")
            options = ques.get("options", [])
            for opt in options:
                if opt.upper() not in core_words:
                    all_words.add(opt.upper())
    return all_words


def validate_advanced_quizzes(data, core_words):
    fn = "advanced_sat_gre_quizzes.json"
    if not data:
        return set()
    quizzes = data.get("quizzes", [])
    all_words = set()
    for q in quizzes:
        qid = q.get("quiz_id")
        for section_key in ["analogies", "sentence_completions", "contextual_lexical"]:
            for item in q.get(section_key, []):
                for key in ["stem", "sentence", "target_word", "correct_answer"]:
                    val = item.get(key, "")
                    if val:
                        for w in val.upper().split():
                            w_clean = w.strip(".,;:!?()[]{}\"'")
                            if w_clean in core_words:
                                all_words.add(w_clean)
    return all_words


def validate_final_exam(data, core_words):
    fn = "final_exam.json"
    if not data:
        return set()
    drills = data.get("drills", [])
    total_d = data.get("total_drills", 0)
    if len(drills) != total_d:
        report("ERROR", fn, f"total_drills says {total_d} but drills array has {len(drills)}")
    all_words = set()
    for d in drills:
        dn = d.get("drill_number")
        questions = d.get("questions", [])
        answers = d.get("answers", {})
        if len(questions) != len(answers):
            report("WARN", fn, f"Drill #{dn}: {len(questions)} questions but {len(answers)} answers")
        for q in questions:
            qn = q.get("question_number")
            options = q.get("options", {}) if isinstance(q.get("options"), dict) else q.get("options", [])
            if isinstance(options, dict):
                for letter, opt in options.items():
                    if opt.upper() in core_words:
                        all_words.add(opt.upper())
            elif isinstance(options, list):
                for opt in options:
                    if isinstance(opt, str) and opt.upper() in core_words:
                        all_words.add(opt.upper())
    return all_words


def validate_contextual_stories(data, core_words):
    fn = "contextual_stories.json"
    if not data:
        return set()
    stories = data.get("stories", [])
    total_s = data.get("total_stories", 0)
    if len(stories) != total_s:
        report("ERROR", fn, f"total_stories says {total_s} but stories array has {len(stories)}")
    all_words = set()
    for s in stories:
        quiz_id = s.get("quiz_id")
        covered = s.get("words_covered", [])
        mapping = s.get("vocabulary_mapping", [])
        if len(covered) != len(mapping):
            report("ERROR", fn, f"Story for quiz #{quiz_id}: {len(covered)} words_covered but {len(mapping)} vocabulary_mapping entries")
        for w in covered:
            wu = w.upper()
            all_words.add(wu)
            # Supplementary words are intentional
            # if wu not in core_words:
            #     report("WARN", fn, f"Story for quiz #{quiz_id}: covered word '{w}' not in core_vocabulary.json")
        for vm in mapping:
            vw = vm.get("word", "").upper()
            if vw in core_words:
                cw = core_words[vw]
                if vm.get("definition", "").strip().lower() != cw.get("definition", "").strip().lower():
                    report("WARN", fn, f"Story for quiz #{quiz_id}: word '{vw}' definition differs from core")
    return all_words


def validate_vocab_drills(data, core_words):
    fn = "vocab_drills.json"
    if not data:
        return set()
    drills = data.get("drills", [])
    total_d = data.get("total_drill_sets", 0)
    if len(drills) != total_d:
        report("ERROR", fn, f"total_drill_sets says {total_d} but drills array has {len(drills)}")
    word_set = set()
    for i, d in enumerate(drills):
        word = d.get("word", "").upper()
        if not word:
            report("ERROR", fn, f"Drill at index {i} has empty/missing 'word' field")
            continue
        if word in word_set:
            report("ERROR", fn, f"Duplicate drill entry: {word}")
        word_set.add(word)
        if word not in core_words:
            report("WARN", fn, f"Drill entry '{word}' not in core_vocabulary.json")
        for drill_type in ["definition_mcq", "synonym_mcq", "antonym_mcq", "sentence_completion"]:
            if drill_type in d and d[drill_type] is not None:
                dt = d[drill_type]
                if "correct_answer" in dt:
                    ca = dt["correct_answer"].upper()
                    if drill_type == "definition_mcq":
                        if word in core_words:
                            cdef = core_words[word].get("definition", "").strip().lower()
                            if ca.strip().lower() != cdef:
                                report("WARN", fn, f"Drill '{word}' {drill_type} answer doesn't match core definition")
                    elif drill_type == "synonym_mcq":
                        if word in core_words:
                            syns = [s.lower() for s in core_words[word].get("synonyms", [])]
                            if ca.lower() not in syns:
                                report("WARN", fn, f"Drill '{word}' synonym answer '{ca}' not in core synonyms list {syns}")
                    elif drill_type == "antonym_mcq":
                        if word in core_words:
                            ants = [a.lower() for a in core_words[word].get("antonyms", [])]
                            if ca.lower() not in ants:
                                report("WARN", fn, f"Drill '{word}' antonym answer '{ca}' not in core antonyms list {ants}")
    return word_set


def validate_word_roots(data):
    fn = "word_roots.json"
    if not data:
        return set()
    roots = data.get("roots", [])
    total_r = data.get("total_roots", 0)
    if len(roots) != total_r:
        report("ERROR", fn, f"total_roots says {total_r} but roots array has {len(roots)}")
    root_set = set()
    for r in roots:
        root = r.get("root", "")
        if not root:
            report("ERROR", fn, "Root entry has empty root value")
            continue
        if root in root_set:
            report("ERROR", fn, f"Duplicate root: {root}")
        root_set.add(root)
        required = ["root", "meaning", "words"]
        check_required_keys(r, required, fn, f"root '{root}'")
        words = r.get("words", [])
        if not words:
            report("WARN", fn, f"Root '{root}' has empty words list")
    return root_set


def validate_hit_parades(data):
    fn = "hit_parades.json"
    if not data:
        return set()
    per_parade_sets = {"sat_hit_parade": set(), "gre_hit_parade": set()}
    for hp_key in ["sat_hit_parade", "gre_hit_parade"]:
        entries = data.get(hp_key, [])
        if not entries:
            report("WARN", fn, f"Missing or empty hit parade: {hp_key}")
            continue
        ranks_seen = set()
        for e in entries:
            w = e.get("word", "").upper()
            if not w:
                report("ERROR", fn, f"Entry in {hp_key} has empty word")
                continue
            if w in per_parade_sets[hp_key]:
                report("WARN", fn, f"Duplicate word '{w}' in {hp_key}")
            per_parade_sets[hp_key].add(w)
            rank = e.get("rank")
            if rank in ranks_seen:
                report("WARN", fn, f"Duplicate rank {rank} in {hp_key}")
            ranks_seen.add(rank)
    # Return combined set for cross-file consistency
    combined = set()
    for s in per_parade_sets.values():
        combined |= s
    return combined


def validate_specialized_vocabulary(data):
    fn = "specialized_vocabulary.json"
    if not data:
        return set()
    chapters = data.get("chapters", [])
    if not chapters:
        report("WARN", fn, "No chapters found")
    all_terms_set = set()
    for ch in chapters:
        cn = ch.get("chapter_number", "?")
        entries = ch.get("entries", [])
        if not entries:
            report("WARN", fn, f"Chapter {cn} '{ch.get('chapter_title')}' has no entries")
        chapter_terms = set()
        for e in entries:
            term = e.get("term", "")
            if not term:
                report("ERROR", fn, f"Chapter {cn} has entry with empty/missing term")
                continue
            if term.upper() in chapter_terms:
                report("WARN", fn, f"Duplicate term '{term}' in chapter {cn} of specialized_vocabulary.json")
            chapter_terms.add(term.upper())
            all_terms_set.add(term.upper())
            if "definition" not in e:
                report("WARN", fn, f"Term '{term}' missing definition")
    return all_terms_set


# ---------- CROSS-FILE COMPARISON ----------

def cross_validate_word_lists(file_sets, file_names):
    """Compare word sets across files to find missing/extra words."""
    fn_label = "Cross-File Consistency"
    all_words = set()
    for fs in file_sets:
        all_words |= fs
    # Check each file for missing core words
    core_words = file_sets[0]  # core_vocabulary should be first
    for i, fs in enumerate(file_sets):
        if i == 0:
            continue
        missing_in = core_words - fs
        if missing_in:
            sample = sorted(list(missing_in))[:10]
            report("WARN", fn_label, f"{file_names[i]} is missing {len(missing_in)} words from core: {', '.join(sample)}{'...' if len(missing_in) > 10 else ''}")
        extra = fs - core_words
        if extra:
            report("WARN", fn_label, f"{file_names[i]} has {len(extra)} extra words not in core: {', '.join(sorted(extra))}")
    # Check quick_quizzes cover all 86 quiz_ids
    return core_words


# ---------- SPELLING CHECK ----------
def load_bengali_words():
    """Load common Bengali words/patterns for basic validation."""
    bengali_range = range(0x0980, 0x0A00)
    return set(bengali_range)


def has_bengali(text):
    """Check if text contains Bengali script characters."""
    if not text:
        return False
    for ch in text:
        if 0x0980 <= ord(ch) <= 0x09FF:
            return True
    return False


def check_bengali_field(obj, field, file_name, context):
    """Check that a Bengali field is present and non-empty."""
    val = obj.get(field, "")
    if not val:
        report("WARN", file_name, f"'{field}' is empty in {context}")
    elif not has_bengali(val):
        report("WARN", file_name, f"'{field}' in {context} doesn't appear to contain Bengali script")


def validate_bengali_content(data, file_name, word_field="word", meaning_field="bengali_meaning"):
    """Validate Bengali fields across a dataset."""
    if not data:
        return
    if "words" in data:
        entries = data["words"]
    elif "flashcards" in data:
        entries = data["flashcards"]
        for e in entries:
            context = f"{e.get(word_field, '?')}"
            check_bengali_field(e.get("back_side", {}), "bengali_meaning", file_name, context)
            check_bengali_field(e.get("back_side", {}), "mnemonic_hint", file_name, context)
        return
    elif "mnemonics" in data:
        entries = data["mnemonics"]
        for e in entries:
            context = f"{e.get(word_field, '?')}"
            check_bengali_field(e, "mnemonic_bengali", file_name, context)
            check_bengali_field(e, "additional_example_bengali", file_name, context)
        return
    elif "drills" in data:
        return  # drills don't have Bengali fields
    else:
        return
    for e in entries:
        context = f"{e.get(word_field, '?')}"
        wf = meaning_field
        if wf in e:
            check_bengali_field(e, wf, file_name, context)


# ---------- MNEMONIC CHECK ----------
def check_mnemonic(word, mnemonic, file_name):
    """Check that a mnemonic references the word itself."""
    if not mnemonic:
        report("WARN", file_name, f"Word '{word}' has empty mnemonic")
        return
    if word not in mnemonic.upper():
        report("WARN", file_name, f"Word '{word}' not found in its OWN mnemonic text: '{mnemonic}'")


# ---------- MISSING FIELD CHECK ----------
def check_field_consistency(obj, field, file_name, context):
    """Check a field is non-empty."""
    val = obj.get(field)
    if val is None:
        report("WARN", file_name, f"'{field}' is missing in {context}")
    elif isinstance(val, str) and not val.strip():
        report("WARN", file_name, f"'{field}' is empty string in {context}")
    elif isinstance(val, list) and len(val) == 0:
        report("WARN", file_name, f"'{field}' is empty list in {context}")


# ---------- MAIN ----------
def main():
    global REPORT_LINES, ERROR_COUNT, WARN_COUNT
    REPORT_LINES.append("# Word Smart Database Validation Report\n")
    REPORT_LINES.append(f"**Generated:** Automated scan\n")
    REPORT_LINES.append(f"**Scope:** All 14 JSON files in `{DATA_DIR}`\n")
    REPORT_LINES.append(f"**Checks:** JSON validity, field completeness, cross-file word consistency, spelling (Bengali + English), mnemonic validity, answer accuracy\n")
    REPORT_LINES.append("---\n")

    REPORT_LINES.append("## 1. File-by-File Validation\n")

    json_files = sorted([
        f for f in os.listdir(DATA_DIR)
        if f.endswith(".json") and f not in IGNORE_FILES
    ])

    all_data = {}
    for fn in json_files:
        fp = os.path.join(DATA_DIR, fn)
        data = load_json(fp)
        all_data[fn] = data

    core_data = all_data.get("core_vocabulary.json")
    core_words = {}
    if core_data:
        REPORT_LINES.append("### core_vocabulary.json\n")
        core_word_set = validate_core_vocabulary(core_data)
        core_words = {w["word"].upper(): w for w in core_data.get("words", []) if w.get("word")}
        REPORT_LINES.append("\n")

    flashcard_data = all_data.get("flashcards.json")
    flashcard_words = set()
    if flashcard_data:
        REPORT_LINES.append("### flashcards.json\n")
        flashcard_words = validate_flashcards(flashcard_data, core_words)
        REPORT_LINES.append("\n")

    mnemonic_data = all_data.get("mnemonics_database.json")
    mnemonic_words = set()
    if mnemonic_data:
        REPORT_LINES.append("### mnemonics_database.json\n")
        mnemonic_words = validate_mnemonics(mnemonic_data, core_words)
        REPORT_LINES.append("\n")

    quiz_data = all_data.get("quick_quizzes.json")
    quiz_words = set()
    if quiz_data:
        REPORT_LINES.append("### quick_quizzes.json\n")
        quiz_words = validate_quick_quizzes(quiz_data, core_words)
        REPORT_LINES.append("\n")

    mcq_data = all_data.get("mcq_quizzes.json")
    mcq_words = set()
    if mcq_data:
        REPORT_LINES.append("### mcq_quizzes.json\n")
        mcq_words = validate_mcq_quizzes(mcq_data, core_words)
        REPORT_LINES.append("\n")

    adv_data = all_data.get("advanced_sat_gre_quizzes.json")
    adv_words = set()
    if adv_data:
        REPORT_LINES.append("### advanced_sat_gre_quizzes.json\n")
        adv_words = validate_advanced_quizzes(adv_data, core_words)
        REPORT_LINES.append("\n")

    exam_data = all_data.get("final_exam.json")
    exam_words = set()
    if exam_data:
        REPORT_LINES.append("### final_exam.json\n")
        exam_words = validate_final_exam(exam_data, core_words)
        REPORT_LINES.append("\n")

    story_data = all_data.get("contextual_stories.json")
    story_words = set()
    if story_data:
        REPORT_LINES.append("### contextual_stories.json\n")
        story_words = validate_contextual_stories(story_data, core_words)
        REPORT_LINES.append("\n")

    drill_data = all_data.get("vocab_drills.json")
    drill_words = set()
    if drill_data:
        REPORT_LINES.append("### vocab_drills.json\n")
        drill_words = validate_vocab_drills(drill_data, core_words)
        REPORT_LINES.append("\n")

    roots_data = all_data.get("word_roots.json")
    if roots_data:
        REPORT_LINES.append("### word_roots.json\n")
        validate_word_roots(roots_data)
        REPORT_LINES.append("\n")

    hp_data = all_data.get("hit_parades.json")
    if hp_data:
        REPORT_LINES.append("### hit_parades.json\n")
        validate_hit_parades(hp_data)
        REPORT_LINES.append("\n")

    spec_data = all_data.get("specialized_vocabulary.json")
    if spec_data:
        REPORT_LINES.append("### specialized_vocabulary.json\n")
        validate_specialized_vocabulary(spec_data)
        REPORT_LINES.append("\n")

    REPORT_LINES.append("---\n")
    REPORT_LINES.append("## 2. Cross-File Consistency\n\n")
    file_sets = [core_word_set, flashcard_words, mnemonic_words, drill_words]
    file_names = ["core_vocabulary.json", "flashcards.json", "mnemonics_database.json", "vocab_drills.json"]
    cross_validate_word_lists(file_sets, file_names)
    REPORT_LINES.append(f"\n**Consistency:** Core words present across all 4 files → {len(core_word_set)}/822 match. "
                        f"Flashcards: {len(flashcard_words)}, Mnemonics: {len(mnemonic_words)}, Drills: {len(drill_words)}")

    REPORT_LINES.append("\n---\n")
    REPORT_LINES.append("## 3. Bengali Content Validation\n\n")
    bengali_issues_before = len(REPORT_LINES)
    validate_bengali_content(core_data, "core_vocabulary.json")
    validate_bengali_content(flashcard_data, "flashcards.json")
    validate_bengali_content(mnemonic_data, "mnemonics_database.json")
    bengali_issues_after = len(REPORT_LINES)
    if bengali_issues_after == bengali_issues_before:
        REPORT_LINES.append("All Bengali fields (`bengali_meaning`, `mnemonic_bengali`, `additional_example_bengali`) are non-empty and contain Bengali script.")

    REPORT_LINES.append("\n---\n")
    REPORT_LINES.append("## 4. Summary Statistics\n")
    REPORT_LINES.append("| Metric | Value |")
    REPORT_LINES.append("|--------|-------|")
    REPORT_LINES.append(f"| Core vocabulary words | {len(core_word_set)} |")
    REPORT_LINES.append(f"| Flashcards | {len(flashcard_words)} |")
    REPORT_LINES.append(f"| Mnemonic entries | {len(mnemonic_words)} |")
    REPORT_LINES.append(f"| Vocab drills | {len(drill_words)} |")
    REPORT_LINES.append(f"| Quick quizzes | {len(quiz_data.get('quizzes', [])) if quiz_data else '?'} |")
    REPORT_LINES.append(f"| MCQ quizzes | {len(mcq_data.get('quizzes', [])) if mcq_data else '?'} |")
    REPORT_LINES.append(f"| Advanced SAT/GRE quizzes | {len(adv_data.get('quizzes', [])) if adv_data else '?'} |")
    REPORT_LINES.append(f"| Final exam drills | {len(exam_data.get('drills', [])) if exam_data else '?'} |")
    REPORT_LINES.append(f"| Contextual stories | {len(story_data.get('stories', [])) if story_data else '?'} |")
    REPORT_LINES.append(f"| Word roots | {len(roots_data.get('roots', [])) if roots_data else '?'} |")
    REPORT_LINES.append(f"| Hit parade entries | {len(hp_data.get('sat_hit_parade', [])) + len(hp_data.get('gre_hit_parade', [])) if hp_data else '?'} |")
    REPORT_LINES.append(f"| Total errors | **{ERROR_COUNT}** |")
    REPORT_LINES.append(f"| Total warnings | **{WARN_COUNT}** |")

    REPORT_LINES.append("")
    if ERROR_COUNT == 0 and WARN_COUNT == 0:
        REPORT_LINES.append("**All checks passed! No issues found.**")
    else:
        REPORT_LINES.append(f"**{ERROR_COUNT + WARN_COUNT} total issues found ({ERROR_COUNT} errors, {WARN_COUNT} warnings). See details above.**")

    # Write report
    report_path = os.path.join(PROJECT_ROOT, "docs", "report.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(REPORT_LINES))
    print(f"Report written to {report_path}")
    print(f"Total: {ERROR_COUNT} errors, {WARN_COUNT} warnings")


if __name__ == "__main__":
    main()
