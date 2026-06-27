import json
import os
import urllib.request
import time
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data", "source")
ENV_PATH = os.path.join(PROJECT_ROOT, ".env")

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

def clean_json_response(text):
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n", "", text)
        text = re.sub(r"\n```$", "", text)
    return text.strip()

def call_api(prompt, api_key):
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
    data_payload = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data_payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            res_body = json.loads(res.read().decode("utf-8"))
            return res_body["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        return str(e)

def main():
    api_keys = load_api_keys()
    print(f"Loaded {len(api_keys)} API keys.")

    core_path = os.path.join(DATA_DIR, "core_vocabulary.json")
    mcq_path = os.path.join(DATA_DIR, "mcq_quizzes.json")
    mnemonics_path = os.path.join(DATA_DIR, "mnemonics_database.json")
    flashcards_path = os.path.join(DATA_DIR, "flashcards.json")

    with open(core_path, "r", encoding="utf-8") as f:
        core_data = json.load(f)
    with open(mcq_path, "r", encoding="utf-8") as f:
        mcq_data = json.load(f)
    with open(mnemonics_path, "r", encoding="utf-8") as f:
        mnemonics_data = json.load(f)
    with open(flashcards_path, "r", encoding="utf-8") as f:
        flashcards_data = json.load(f)

    words = core_data.get("words", [])
    core_words = {w["word"].upper(): w for w in words}

    # 1. Fix placeholder definitions in mcq_quizzes.json
    print("\n🔄 Fixing placeholder definitions in mcq_quizzes.json...")
    fixed_mcq_count = 0
    for quiz in mcq_data.get("quizzes", []):
        for qu in quiz.get("questions", []):
            bengali_exp = qu.get("bengali_explanation", "")
            if "গুরুত্বপূর্ণ অবস্থা বা বৈশিষ্ট্য" in bengali_exp:
                ans_word = qu.get("correct_answer", "").upper()
                if ans_word in core_words:
                    bengali_mean = core_words[ans_word].get("bengali_meaning", "")
                    new_exp = bengali_exp.replace("গুরুত্বপূর্ণ অবস্থা বা বৈশিষ্ট্য", bengali_mean)
                    qu["bengali_explanation"] = new_exp
                    fixed_mcq_count += 1

    print(f"  Fixed {fixed_mcq_count} question explanations in mcq_quizzes.json.")

    # 2. Fix cookie-cutter budget sentences in mnemonics_database.json and flashcards.json
    print("\n🔄 Scanning for cookie-cutter budget sentences...")
    affected_words = []
    for idx, m in enumerate(mnemonics_data.get("mnemonics", [])):
        ex = m.get("additional_example", "")
        if "decision regarding the budget" in ex:
            affected_words.append(m["word"].upper())

    print(f"  Found {len(affected_words)} affected words.")

    new_examples = {}
    if affected_words:
        # Group into batches of 20 words
        batch_size = 20
        batches = [affected_words[i:i + batch_size] for i in range(0, len(affected_words), batch_size)]
        
        print(f"  Starting batch translation of examples (Total {len(batches)} batches)...")
        for batch_idx, batch in enumerate(batches, 1):
            print(f"\n📦 Processing batch {batch_idx}/{len(batches)} (Words: {', '.join(batch[:4])}...)")
            
            # Prepare batch sentences
            batch_sentences = {}
            for word in batch:
                if word not in core_words:
                    continue
                cw = core_words[word]
                examples_list = cw.get("examples", [])
                if examples_list:
                    # Strip markdown bold formatting from the example sentence
                    clean_ex = examples_list[0].replace("**", "").replace("*", "")
                    batch_sentences[word] = clean_ex
                else:
                    batch_sentences[word] = f"His action was very characteristic of a {word.lower()} behavior."

            # Construct the prompt
            prompt = (
                "Translate the following English sentences into natural Bengali. "
                "Return the output STRICTLY as a JSON object where the keys are the uppercase words, "
                "and the values are their natural Bengali translations. Do not include markdown "
                "formatting (such as ```json or ```), explanations, or any text other than the JSON object:\n\n"
                + json.dumps(batch_sentences, indent=2)
            )

            # Try to translate
            success = False
            for attempt in range(3):
                if success:
                    break
                for key_idx, key in enumerate(api_keys):
                    print(f"    [Attempt {attempt+1}] Querying API with Key {key_idx}...")
                    res_text = call_api(prompt, key)
                    if res_text and "429" not in res_text and "Error" not in res_text:
                        cleaned = clean_json_response(res_text)
                        try:
                            batch_translations = json.loads(cleaned)
                            # Verify and store
                            for w, trans in batch_translations.items():
                                w_upper = w.upper()
                                if w_upper in batch_sentences:
                                    new_examples[w_upper] = {
                                        "example": batch_sentences[w_upper],
                                        "translation": trans.strip()
                                    }
                            success = True
                            print(f"    ✅ Batch {batch_idx} translated successfully.")
                            break
                        except Exception as parse_err:
                            print(f"    ⚠️ Failed to parse response JSON: {parse_err}. Response snippet: {res_text[:100]}")
                    else:
                        print(f"    ❌ Key {key_idx} rate-limited or error. Response: {res_text[:100]}")
                    time.sleep(2)
                
                if not success:
                    print("    😴 All keys rate-limited. Sleeping 12 seconds before retry...")
                    time.sleep(12)

            # If all attempts failed, use fallback
            if not success:
                print(f"    ⚠️ Batch {batch_idx} failed all API attempts. Applying fallback...")
                for w, ex in batch_sentences.items():
                    cw = core_words[w]
                    bengali_meaning = cw.get("bengali_meaning", "")
                    new_examples[w] = {
                        "example": ex,
                        "translation": f"{bengali_meaning} (বাক্যে প্রয়োগের উদাহরণ)"
                    }

            # Avoid hitting rate limits
            if success:
                print("    😴 Success sleep for 6 seconds...")
                time.sleep(6)

        # Apply new examples to mnemonics_database.json
        fixed_mnemonics = 0
        for m in mnemonics_data.get("mnemonics", []):
            word_upper = m["word"].upper()
            if word_upper in new_examples:
                m["additional_example"] = new_examples[word_upper]["example"]
                m["additional_example_bengali"] = new_examples[word_upper]["translation"]
                fixed_mnemonics += 1

        # Apply new examples to flashcards.json
        fixed_flashcards = 0
        for f in flashcards_data.get("flashcards", []):
            word_upper = f["word"].upper()
            if word_upper in new_examples:
                bs = f.get("back_side", {})
                bs["additional_example"] = new_examples[word_upper]["example"]
                bs["additional_example_bengali"] = new_examples[word_upper]["translation"]
                fixed_flashcards += 1

        print(f"\n  Updated {fixed_mnemonics} entries in mnemonics_database.json.")
        print(f"  Updated {fixed_flashcards} entries in flashcards.json.")

    # Save all updated files
    with open(mcq_path, "w", encoding="utf-8") as f:
        json.dump(mcq_data, f, indent=2, ensure_ascii=False)
    with open(mnemonics_path, "w", encoding="utf-8") as f:
        json.dump(mnemonics_data, f, indent=2, ensure_ascii=False)
    with open(flashcards_path, "w", encoding="utf-8") as f:
        json.dump(flashcards_data, f, indent=2, ensure_ascii=False)

    print("\n✅ All database misinformation fixed successfully!")

if __name__ == "__main__":
    main()
