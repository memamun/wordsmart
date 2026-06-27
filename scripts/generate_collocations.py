#!/usr/bin/env python3
"""Script to generate popular English collocations for all 822 words in core_vocabulary.json.
Uses the Gemini 2.5 Flash API (with fallback options) and stores findings in a local cache.
"""

import json
import os
import urllib.request
import urllib.error
import time
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data", "source")
ENV_PATH = os.path.join(PROJECT_ROOT, ".env")
CACHE_PATH = os.path.join(PROJECT_ROOT, "archive", "cache", ".collocations_cache.json")
CORE_PATH = os.path.join(DATA_DIR, "core_vocabulary.json")

def load_keys():
    gemini_keys = []
    groq_key = os.environ.get("GROQ_API_KEY")
    openrouter_key = os.environ.get("OPENROUTER_API_KEY")
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GOOGLE_API_KEY=") or line.startswith("GEMINI_API_KEY="):
                    gemini_keys.append(line.split("=", 1)[1].strip())
                elif line.startswith("GEMINI_API_KEY_FALLBACK="):
                    gemini_keys.append(line.split("=", 1)[1].strip())
                elif line.startswith("GROQ_API_KEY="):
                    if not groq_key:
                        groq_key = line.split("=", 1)[1].strip()
                elif line.startswith("OPENROUTER_API_KEY="):
                    if not openrouter_key:
                        openrouter_key = line.split("=", 1)[1].strip()
    if not groq_key:
        groq_key = "REMOVED_SECRET"
    if not openrouter_key:
        openrouter_key = "REMOVED_SECRET"
        
    gemini_keys = list(dict.fromkeys([k for k in gemini_keys if k]))
    return gemini_keys, groq_key, openrouter_key

def load_cache():
    cache = {}
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, "r", encoding="utf-8") as f:
                cache = json.load(f)
            print(f"Loaded existing collocations cache containing {len(cache)} words.")
        except Exception as e:
            print(f"⚠️ Warning loading cache: {e}")
    return cache

def save_cache(cache):
    try:
        with open(CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"⚠️ Warning: Failed to save cache: {e}")

def clean_json_response(text):
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n", "", text)
        text = re.sub(r"\n```$", "", text)
    return text.strip()

def call_gemini_api(prompt, api_key):
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    data_payload = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data_payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as res:
            res_body = json.loads(res.read().decode("utf-8"))
            return res_body["candidates"][0]["content"]["parts"][0]["text"].strip()
    except urllib.error.HTTPError as e:
        err_body = ""
        try:
            err_body = e.read().decode("utf-8")
        except:
            pass
        return f"HTTPError {e.code}: {e.reason}\nBody: {err_body}"
    except Exception as e:
        return f"Error: {e}"

def call_groq_api(prompt, groq_key):
    payload = {
        "messages": [{"role": "user", "content": prompt}],
        "model": "llama-3.3-70b-versatile",
        "response_format": {"type": "json_object"},
        "max_tokens": 2000
    }
    url = "https://api.groq.com/openai/v1/chat/completions"
    data_payload = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data_payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {groq_key}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as res:
            res_body = json.loads(res.read().decode("utf-8"))
            return res_body["choices"][0]["message"]["content"].strip()
    except urllib.error.HTTPError as e:
        err_body = ""
        try:
            err_body = e.read().decode("utf-8")
        except:
            pass
        return f"HTTPError {e.code}: {e.reason}\nBody: {err_body}"
    except Exception as e:
        return f"Error: {e}"

def call_openrouter_api(prompt, openrouter_key):
    payload = {
        "model": "meta-llama/llama-3.2-3b-instruct:free",
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"},
        "max_tokens": 2000
    }
    url = "https://openrouter.ai/api/v1/chat/completions"
    data_payload = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data_payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openrouter_key}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as res:
            res_body = json.loads(res.read().decode("utf-8"))
            return res_body["choices"][0]["message"]["content"].strip()
    except urllib.error.HTTPError as e:
        err_body = ""
        try:
            err_body = e.read().decode("utf-8")
        except:
            pass
        return f"HTTPError {e.code}: {e.reason}\nBody: {err_body}"
    except Exception as e:
        return f"Error: {e}"

def generate_collocations_batch(batch_items, gemini_keys, groq_key, openrouter_key):
    prompt = (
        "You are an expert lexicographer specializing in high-quality English vocabulary preparation for SAT/GRE/IELTS.\n"
        "For each word in the provided JSON batch, generate exactly 3 to 5 of the most popular, standard, and natural English collocations.\n\n"
        "CRITICAL RULES:\n"
        "1. Each collocation must contain the word itself (or standard inflections/variations, e.g., 'feel abashed' or 'unabashed support' for 'abash', or 'abject poverty' for 'abject').\n"
        "2. The collocations must be natural, highly frequent pairings in quality literature, news, or academic writing (e.g., adjective-noun, verb-noun, adverb-adjective).\n"
        "3. Do NOT include artificial phrases, definitions, translations, meta-words, or grammatical labels (e.g., avoid 'to abash', 'abash synonyms', 'abash meaning', 'abash v', 'an abash person'). Keep them to 2 to 4 words.\n"
        "4. The output must be entirely lowercase.\n"
        "5. Return the output STRICTLY as a JSON object where the keys are the exact uppercase words (e.g. \"ABASH\") and the values are lists of strings representing the collocations.\n\n"
        "Example format:\n"
        "{\n"
        '  "ABASH": ["feel abashed", "abashed by the criticism", "unabashed support"],\n'
        '  "ABATE": ["storm abates", "pain abated", "abated interest"]\n'
        "}\n\n"
        "Words to process:\n"
        + json.dumps(batch_items, indent=2, ensure_ascii=False)
    )
    
    attempt = 0
    while True:
        # 1. Try Gemini first
        for idx, g_key in enumerate(gemini_keys):
            res = call_gemini_api(prompt, g_key)
            if res and not res.startswith("HTTPError") and not res.startswith("Error:"):
                return res, "gemini"
            else:
                print(f"    ⚠️ Gemini Key {idx+1} failed/rate-limited. Snippet: {res[:120]}")
                
        # 2. If Gemini fails, try Groq fallback
        print("    ⚠️ All Gemini keys failed. Trying Groq fallback...")
        res = call_groq_api(prompt, groq_key)
        if res and not res.startswith("HTTPError") and not res.startswith("Error:") and "rate_limit" not in res:
            return res, "groq"
        else:
            print(f"    ⚠️ Groq failed/rate-limited. Snippet: {res[:120]}")
            
        # 3. If Groq fails, try OpenRouter fallback
        print("    ⚠️ Groq failed. Trying OpenRouter fallback...")
        res = call_openrouter_api(prompt, openrouter_key)
        if res and not res.startswith("HTTPError") and not res.startswith("Error:"):
            return res, "openrouter"
            
        # 4. If all fail, sleep & retry
        attempt += 1
        sleep_time = min(15 + 5 * attempt, 90)
        print(f"    ❌ All APIs failed or rate-limited. Response snippet: {res[:120]}")
        print(f"    😴 Sleeping {sleep_time}s before retry...")
        time.sleep(sleep_time)

def main():
    gemini_keys, groq_key, openrouter_key = load_keys()
    print(f"Loaded {len(gemini_keys)} Gemini keys, Groq key, and OpenRouter key.")

    cache = load_cache()
    
    if not os.path.exists(CORE_PATH):
        print(f"❌ Error: core_vocabulary.json not found at {CORE_PATH}.")
        return
        
    with open(CORE_PATH, "r", encoding="utf-8") as f:
        core_data = json.load(f)
        words = core_data.get("words", [])

    # Find words that are not yet in the cache
    missing_words = []
    for w in words:
        word_name = w["word"].upper()
        if word_name not in cache:
            missing_words.append({
                "word": word_name,
                "part_of_speech": w.get("part_of_speech", ""),
                "definition": w.get("definition", "")
            })

    print(f"Total words in core vocabulary: {len(words)}")
    print(f"Already in cache: {len(cache)}")
    print(f"Missing words to generate collocations for: {len(missing_words)}")

    if not missing_words:
        print("🎉 All collocations are already generated in the cache!")
    else:
        # Use batch size of 60 words
        batch_size = 60
        batches = [missing_words[i:i + batch_size] for i in range(0, len(missing_words), batch_size)]
        
        print(f"\n🚀 Running generator for {len(batches)} batches...")
        
        for idx, batch in enumerate(batches):
            b_idx = idx + 1
            print(f"📦 [{b_idx}/{len(batches)}] Processing batch of {len(batch)} words...")
            
            prompt_data = []
            for item in batch:
                prompt_data.append({
                    "word": item["word"],
                    "part_of_speech": item["part_of_speech"],
                    "definition": item["definition"]
                })
                
            start_time = time.time()
            try:
                raw_res, engine_used = generate_collocations_batch(prompt_data, gemini_keys, groq_key, openrouter_key)
                cleaned = clean_json_response(raw_res)
                collocations_map = json.loads(cleaned)
                
                success_count = 0
                for item in batch:
                    word_name = item["word"]
                    if word_name in collocations_map:
                        colls = collocations_map[word_name]
                        # Clean and normalize collocations
                        cleaned_colls = []
                        for coll in colls:
                            c = coll.strip().lower()
                            # Strip any unwanted grammatical prefixes/suffixes like "to " or pos
                            c = re.sub(r"^(to|a|an|the)\s+", "", c)
                            if c:
                                cleaned_colls.append(c)
                        cache[word_name] = cleaned_colls
                        success_count += 1
                
                print(f"   ✅ Done: Generated collocations for {success_count}/{len(batch)} words in {time.time() - start_time:.1f}s using {engine_used}. (Total cached: {len(cache)})")
                
                save_cache(cache)
                
                # Dynamic delay based on API used
                if engine_used == "gemini":
                    time.sleep(3.0)
                else:
                    time.sleep(12.0)
            except Exception as e:
                print(f"❌ Error in batch {b_idx}: {e}")
                save_cache(cache)
                time.sleep(10.0)

    # Integrate cache into core_vocabulary.json
    print("\n💾 Integrating collocations from cache into core_vocabulary.json...")
    updated_count = 0
    for w in words:
        word_name = w["word"].upper()
        if word_name in cache:
            w["collocations"] = cache[word_name]
            updated_count += 1
        else:
            w["collocations"] = []

    with open(CORE_PATH, "w", encoding="utf-8") as f:
        json.dump(core_data, f, indent=2, ensure_ascii=False)
    print(f"  ✅ core_vocabulary.json updated ({updated_count} words).")
    print("👍 Done!")

if __name__ == "__main__":
    main()
