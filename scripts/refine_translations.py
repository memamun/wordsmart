import json
import os
import urllib.request
import time
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data", "source")
ENV_PATH = os.path.join(PROJECT_ROOT, ".env")

def load_working_keys():
    keys = []
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GOOGLE_API_KEY="):
                    keys.append(line.split("=", 1)[1].strip())
                elif line.startswith("GEMINI_API_KEY_FALLBACK="):
                    keys.append(line.split("=", 1)[1].strip())
    return keys

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
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    data_payload = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data_payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=90) as res:
            res_body = json.loads(res.read().decode("utf-8"))
            return res_body["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        return str(e)

def main():
    api_keys = load_working_keys()
    if not api_keys:
        print("❌ No active API keys found in .env.")
        return
    print(f"Loaded {len(api_keys)} working API keys.")

    draft_path = os.path.join(PROJECT_ROOT, "archive", "cache", "draft_translations.json")
    refined_path = os.path.join(PROJECT_ROOT, "archive", "cache", "refined_translations.json")

    if not os.path.exists(draft_path):
        print(f"❌ Draft translations file not found at {draft_path}.")
        return

    with open(draft_path, "r", encoding="utf-8") as f:
        draft_data = json.load(f)

    words = list(draft_data.keys())
    print(f"Total words in draft: {len(words)}")

    # We will process in smaller batches of 5 to prevent generation timeout
    batch_size = 5
    batches = [words[i:i + batch_size] for i in range(0, len(words), batch_size)]
    
    refined_translations = {}
    if os.path.exists(refined_path):
        try:
            with open(refined_path, "r", encoding="utf-8") as f:
                refined_translations = json.load(f)
            print(f"Loaded {len(refined_translations)} existing refined translations.")
        except Exception:
            pass

    for batch_idx, batch in enumerate(batches, 1):
        unprocessed_batch = [w for w in batch if w not in refined_translations]
        if not unprocessed_batch:
            print(f"📦 Batch {batch_idx}/{len(batches)} already processed.")
            continue

        print(f"\n📦 Processing batch {batch_idx}/{len(batches)} ({len(unprocessed_batch)} words)...")
        
        batch_prompt_data = {}
        for w in unprocessed_batch:
            batch_prompt_data[w] = {
                "english_sentence": draft_data[w]["sentence"],
                "draft_bengali_translation": draft_data[w]["translation"]
            }

        prompt = (
            "You are a professional English-to-Bengali lexicographer and translator.\n"
            "We have a machine-translated draft of Bengali examples for WordSmart vocabulary. "
            "Some of the translations contain serious errors (e.g. translating 'consonant' as 'ব্যঞ্জনাপূর্ণ' instead of 'সামঞ্জস্যপূর্ণ', "
            "or 'credulous' as 'বিশ্বস্ত' instead of 'সহজে বিশ্বাসপ্রবণ', or missing whole clauses).\n\n"
            "Please review the English sentences and their draft Bengali translations. "
            "Correct and refine the Bengali translations to make them natural, grammatically correct, and contextually accurate.\n\n"
            "Return the output STRICTLY as a JSON object where the keys are the uppercase words, and the values are simple STRINGS containing the corrected Bengali translation. "
            "Example format:\n"
            "{\n"
            '  "CONSONANT": "আমাদের আকাঙ্ক্ষাগুলো তাদের আকাঙ্ক্ষার সাথে সামঞ্জস্যপূর্ণ ছিল; আমরা সবাই একই জিনিস চেয়েছিলাম।",\n'
            '  "CONSUMMATE": "একজন দক্ষ পিয়ানোবাদক অত্যন্ত চমৎকার পিয়ানো বাজান। তাঁর বাজানোর স্টাইলে কোনো খামতি থাকে না।"\n'
            "}\n\n"
            "Do not nest them in sub-objects, do not include markdown code blocks, and do not include explanations or any text other than the JSON:\n\n"
            + json.dumps(batch_prompt_data, indent=2)
        )

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
                        batch_refined = json.loads(cleaned)
                        for w, trans in batch_refined.items():
                            w_upper = w.upper()
                            if w_upper in batch_prompt_data:
                                if isinstance(trans, dict):
                                    trans_val = trans.get("corrected_translation", trans.get("translation", list(trans.values())[0]))
                                else:
                                    trans_val = trans
                                
                                if isinstance(trans_val, str):
                                    refined_translations[w_upper] = {
                                        "sentence": draft_data[w_upper]["sentence"],
                                        "translation": trans_val.strip()
                                    }
                        success = True
                        print(f"    ✅ Batch {batch_idx} refined successfully.")
                        
                        # Intermediate save
                        with open(refined_path, "w", encoding="utf-8") as f:
                            json.dump(refined_translations, f, indent=2, ensure_ascii=False)
                        break
                    except Exception as parse_err:
                        print(f"    ⚠️ Failed to parse response JSON: {parse_err}. Response snippet: {res_text[:100]}")
                else:
                    print(f"    ❌ Key {key_idx} rate-limited or error. Response snippet: {res_text[:100]}")
                time.sleep(2)
            
            if not success:
                print("    😴 All keys rate-limited or timed out. Sleeping 15 seconds before retry...")
                time.sleep(15)

        if success:
            time.sleep(12)

    print("\n✅ All translations refined successfully!")

if __name__ == "__main__":
    main()
