#!/usr/bin/env python3
"""Script to fix corrupted synonyms and antonyms in WordSmart databases using the Gemini API."""

import json
import os
import time
import urllib.request
import urllib.error

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
ENV_PATH = os.path.join(PROJECT_ROOT, ".env")
CACHE_PATH = os.path.join(DATA_DIR, ".synonyms_antonyms_cache.json")

# Database Paths
DB_PATHS = {
    "core": os.path.join(DATA_DIR, "core_vocabulary.json"),
    "flashcards": os.path.join(DATA_DIR, "flashcards.json"),
    "drills": os.path.join(DATA_DIR, "vocab_drills.json")
}

def load_api_key():
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("GOOGLE_API_KEY="):
                    return line.strip().split("=", 1)[1].strip()
    return None

def load_cache():
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_cache(cache):
    try:
        with open(CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"⚠️ Warning: Failed to save cache: {e}")

def get_synonyms_antonyms_batch(api_key, batch_words):
    prompt = """You are an expert lexicographer and thesaurus editor.
For each of the following English vocabulary words, we provide its definition, part of speech (POS), and an example sentence for context.

Please generate exactly 5 distinct, high-quality, and accurate synonyms, and exactly 5 distinct, high-quality, and accurate antonyms for each word.
- The synonyms and antonyms must fit the word's definition and part of speech.
- If a word is too unique to have 5 direct antonyms, provide common conceptual opposites. Do not use generic fallback values (like 'different', 'opposite', 'contrary') unless they are genuinely the most precise antonyms for that word.
- Return all synonyms and antonyms in LOWERCASE.

Return the result strictly as a JSON object where each key is the English word, and the value is an object with keys "synonyms" (array of 5 strings) and "antonyms" (array of 5 strings). Do not wrap the JSON in markdown code blocks.

Words to process:
"""
    
    words_data = []
    for item in batch_words:
        words_data.append({
            "word": item["word"],
            "pos": item["part_of_speech"],
            "definition": item["definition"],
            "example": item["examples"][0] if item.get("examples") else ""
        })
    
    prompt += json.dumps(words_data, indent=2)
    
    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-flash-latest"]
    
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        data = json.dumps(payload).encode('utf-8')
        
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"}
        )
        
        try:
            with urllib.request.urlopen(req, timeout=40) as response:
                res_body = response.read().decode('utf-8')
                res_json = json.loads(res_body)
                
                candidates = res_json.get("candidates", [])
                if candidates:
                    text_content = candidates[0]["content"]["parts"][0]["text"]
                    return json.loads(text_content)
                raise ValueError("No candidates returned from Gemini API.")
        except urllib.error.HTTPError as e:
            code = e.code
            err_msg = e.read().decode('utf-8')
            print(f"  ⚠️ HTTP Error {code} with model {model}: {err_msg[:200]}")
            if code == 429:
                print("  Rate limited. Sleeping for 10s...")
                time.sleep(10)
        except Exception as e:
            print(f"  ⚠️ Exception with model {model}: {e}")
            
    raise RuntimeError("Failed to fetch synonyms/antonyms from all Gemini models.")

def main():
    api_key = load_api_key()
    if not api_key:
        print("❌ Error: GOOGLE_API_KEY not found in .env!")
        return

    print("📖 Loading core_vocabulary.json...")
    if not os.path.exists(DB_PATHS["core"]):
        print("❌ Error: core_vocabulary.json does not exist!")
        return

    with open(DB_PATHS["core"], "r", encoding="utf-8") as f:
        core_data = json.load(f)

    words = core_data.get("words", [])
    print(f"Total words in database: {len(words)}")

    # Translate words from index 200 to the end
    target_words = words[200:]
    print(f"Target words to process: {len(target_words)}")

    cache = load_cache()
    print(f"Loaded cache containing {len(cache)} entries.")

    # Filter out words that are already in cache
    words_to_process = [w for w in target_words if w["word"] not in cache]
    print(f"Remaining words to process: {len(words_to_process)}")

    batch_size = 40
    completed = 0
    total_to_process = len(words_to_process)

    for i in range(0, total_to_process, batch_size):
        batch = words_to_process[i:i+batch_size]
        batch_names = [w["word"] for w in batch]
        
        print(f"\n🔄 Processing batch {i // batch_size + 1} ({len(batch)} words): {batch_names[:5]}...")
        
        max_retries = 3
        success = False
        for attempt in range(max_retries):
            try:
                # Rate limit safety
                time.sleep(2.0)
                result = get_synonyms_antonyms_batch(api_key, batch)
                
                # Verify that all words in batch are in result
                result_upper = {k.upper(): v for k, v in result.items()}
                
                for w in batch:
                    word_name = w["word"].upper()
                    if word_name in result_upper:
                        res = result_upper[word_name]
                        if "synonyms" in res and "antonyms" in res:
                            cache[w["word"]] = {
                                "synonyms": [s.lower() for s in res["synonyms"][:5]],
                                "antonyms": [a.lower() for a in res["antonyms"][:5]]
                            }
                        else:
                            print(f"  ⚠️ Warning: Response for {w['word']} missing synonyms or antonyms.")
                    else:
                        print(f"  ⚠️ Warning: Word {w['word']} was not found in API response.")
                
                save_cache(cache)
                success = True
                completed += len(batch)
                print(f"  ✅ Batch processed and cached. Total cached: {len(cache)} / 822")
                break
            except Exception as e:
                print(f"  ❌ Attempt {attempt + 1} failed: {e}")
                time.sleep(5.0)
        
        if not success:
            print("Stopping due to repeated errors. Run the script again to resume.")
            return

    # Update the databases with cached values
    print("\n💾 Updating databases with corrected synonyms and antonyms...")

    # 1. Update core_vocabulary.json
    print("  Updating core_vocabulary.json...")
    for idx in range(200, len(words)):
        word = words[idx]["word"]
        if word in cache:
            words[idx]["synonyms"] = cache[word]["synonyms"]
            words[idx]["antonyms"] = cache[word]["antonyms"]
    with open(DB_PATHS["core"], "w", encoding="utf-8") as f:
        json.dump(core_data, f, indent=2, ensure_ascii=False)

    # 2. Update flashcards.json
    if os.path.exists(DB_PATHS["flashcards"]):
        print("  Updating flashcards.json...")
        with open(DB_PATHS["flashcards"], "r", encoding="utf-8") as f:
            fc_data = json.load(f)
        for idx in range(200, len(fc_data["flashcards"])):
            word = fc_data["flashcards"][idx]["word"]
            if word in cache:
                fc_data["flashcards"][idx]["synonyms"] = cache[word]["synonyms"]
                fc_data["flashcards"][idx]["antonyms"] = cache[word]["antonyms"]
        with open(DB_PATHS["flashcards"], "w", encoding="utf-8") as f:
            json.dump(fc_data, f, indent=2, ensure_ascii=False)

    # 3. Update vocab_drills.json
    if os.path.exists(DB_PATHS["drills"]):
        print("  Updating vocab_drills.json...")
        with open(DB_PATHS["drills"], "r", encoding="utf-8") as f:
            dr_data = json.load(f)
        for idx in range(200, len(dr_data["drills"])):
            word = dr_data["drills"][idx]["word"]
            if word in cache:
                dr_data["drills"][idx]["synonyms"] = cache[word]["synonyms"]
                dr_data["drills"][idx]["antonyms"] = cache[word]["antonyms"]
        with open(DB_PATHS["drills"], "w", encoding="utf-8") as f:
            json.dump(dr_data, f, indent=2, ensure_ascii=False)

    print("\n🎉 Databases successfully updated with high-quality synonyms and antonyms!")

if __name__ == "__main__":
    main()
