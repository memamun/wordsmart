#!/usr/bin/env python3
"""Script to translate all 2,353 book example sentences in core_vocabulary.json.
Orchestrates multiple APIs sequentially (Gemini first, then Groq, then OpenRouter fallback).
Emphasizes high-quality, natural, and native-sounding Bengali translations, avoiding robotic/machine translations.
Runs single-threaded with dynamic delay adjustments based on the active API engine.
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
CACHE_PATH = os.path.join(PROJECT_ROOT, "archive", "cache", ".example_translation_cache.json")
REFINED_PATH = os.path.join(PROJECT_ROOT, "archive", "cache", "refined_translations.json")
CORE_PATH = os.path.join(DATA_DIR, "core_vocabulary.json")
FLASHCARDS_PATH = os.path.join(DATA_DIR, "flashcards.json")

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
        groq_key = os.environ.get("GROQ_API_KEY", "")
    if not openrouter_key:
        openrouter_key = os.environ.get("OPENROUTER_API_KEY", "")
        
    gemini_keys = list(dict.fromkeys([k for k in gemini_keys if k]))
    return gemini_keys, groq_key, openrouter_key

def clean_sentence(s):
    """Normalize sentence string for matching (strip markdown stars, extra whitespace)."""
    return re.sub(r"\s+", " ", s.replace("**", "").replace("*", "")).strip().lower()

def load_cache_and_seed():
    cache = {}
    
    # 1. Load existing cache if any
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, "r", encoding="utf-8") as f:
                cache = json.load(f)
            print(f"Loaded existing cache containing {len(cache)} entries.")
        except Exception:
            pass
            
    # 2. Seed with refined translations to save API calls
    if os.path.exists(REFINED_PATH):
        try:
            with open(REFINED_PATH, "r", encoding="utf-8") as f:
                refined = json.load(f)
            seeded = 0
            for word, data in refined.items():
                sent = data.get("sentence", "")
                trans = data.get("translation", "")
                if sent and trans:
                    key = clean_sentence(sent)
                    if key not in cache:
                        cache[key] = trans.strip()
                        seeded += 1
            if seeded > 0:
                print(f"Seeded cache with {seeded} entries from refined_translations.json.")
        except Exception as e:
            print(f"⚠️ Warning loading refined translations: {e}")
            
    return cache

def save_cache_safe(cache):
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
        with urllib.request.urlopen(req, timeout=150) as res:
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
        "max_tokens": 1500
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
        with urllib.request.urlopen(req, timeout=150) as res:
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
        "max_tokens": 1500
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
        with urllib.request.urlopen(req, timeout=150) as res:
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

def generate_translations_batch(batch_items, gemini_keys, groq_key, openrouter_key):
    prompt = (
        "You are an expert English-to-Bengali lexicographer and translator.\n"
        "We need natural, idiomatic, and high-quality Bengali translations for example sentences of English vocabulary words.\n\n"
        "CRITICAL RULES:\n"
        "1. Do NOT perform literal word-for-word translation. The translation must sound natural, fluid, and native in Standard Colloquial Bengali (চলিত রীতি).\n"
        "2. Avoid typical robotic, clunky, or obvious AI-generated phrasing (e.g. don't translate 'I will be' literally as 'আমি হব' or use clumsy passive voice). The sentence structure must flow naturally.\n"
        "3. Translate pronouns and verb forms using respectful/neutral colloquial Bengali (e.g. use 'তিনি/তাঁর' for professionals, teachers, or general individuals in examples instead of the informal 'সে/তার'). For example, if the sentence refers to a doctor, professor, scientist, or general person in a respectful setting, do NOT use 'সে/তার'—always use 'তিনি/তাঁর' with respectful verb forms (e.g., 'বললেন' instead of 'বলল', 'করতেন' instead of 'করত').\n"
        "4. Return the output STRICTLY as a JSON object where the keys are the exact English sentences (original input string), and the values are the generated Bengali translation strings.\n\n"
        "Format example:\n"
        "{\n"
        '  "Our desires were consonant with theirs; we all wanted the same thing.": "আমাদের আকাঙ্ক্ষাগুলো তাদের আকাঙ্ক্ষার সাথে সামঞ্জস্যপূর্ণ ছিল; আমরা সবাই একই জিনিস চেয়েছিলাম।"\n'
        "}\n\n"
        "Items to translate:\n"
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
                print(f"    ⚠️ Gemini Key {idx+1} failed/rate-limited. Snippet: {res[:100]}")
                
        # 2. If Gemini fails, try Groq fallback
        print("    ⚠️ All Gemini keys failed. Trying Groq fallback...")
        res = call_groq_api(prompt, groq_key)
        if res and not res.startswith("HTTPError") and not res.startswith("Error:") and "rate_limit" not in res:
            return res, "groq"
        else:
            print(f"    ⚠️ Groq failed/rate-limited. Snippet: {res[:100]}")
            
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
    print(f"Loaded {len(gemini_keys)} Gemini keys, Groq key ({groq_key[:10]}...), and OpenRouter key ({openrouter_key[:10]}...)")

    cache = load_cache_and_seed()
    
    if not os.path.exists(CORE_PATH):
        print(f"❌ Error: core_vocabulary.json not found at {CORE_PATH}.")
        return
        
    with open(CORE_PATH, "r", encoding="utf-8") as f:
        core_data = json.load(f)
        words = core_data.get("words", [])

    # Collect missing sentences
    missing_items = []
    sentence_to_clean = {}
    
    for w in words:
        word_name = w["word"].upper()
        pos = w.get("part_of_speech", "")
        definition = w.get("definition", "")
        meaning = w.get("bengali_meaning", "")
        examples = w.get("examples", [])
        
        for ex in examples:
            ex_clean = clean_sentence(ex)
            sentence_to_clean[ex] = ex_clean
            if ex_clean not in cache:
                missing_items.append({
                    "word": word_name,
                    "pos": pos,
                    "definition": definition,
                    "word_meaning": meaning,
                    "sentence": ex
                })

    total_sentences = sum(len(w.get('examples', [])) for w in words)
    print(f"Total sentences in core: {total_sentences}")
    print(f"Already cached: {len(cache)}")
    print(f"Missing sentences to translate: {len(missing_items)}")

    if not missing_items:
        print("🎉 All sentences are already translated!")
    else:
        # Leverage the large context window by using a batch size of 80
        batch_size = 80
        batches = [missing_items[i:i + batch_size] for i in range(0, len(missing_items), batch_size)]
        
        print(f"\n🚀 Running single-threaded translator for {len(batches)} batches (size {batch_size})...")
        
        for idx, batch in enumerate(batches):
            b_idx = idx + 1
            print(f"📦 [{b_idx}/{len(batches)}] Translating batch of {len(batch)} sentences...")
            
            prompt_data = []
            for item in batch:
                prompt_data.append({
                    "word": item["word"],
                    "pos": item["pos"],
                    "definition": item["definition"],
                    "word_bengali_meaning": item["word_meaning"],
                    "sentence": item["sentence"]
                })
                
            start_time = time.time()
            try:
                raw_res, engine_used = generate_translations_batch(prompt_data, gemini_keys, groq_key, openrouter_key)
                cleaned = clean_json_response(raw_res)
                translations = json.loads(cleaned)
                
                success_count = 0
                for item in batch:
                    orig_sentence = item["sentence"]
                    matched_trans = None
                    if orig_sentence in translations:
                        matched_trans = translations[orig_sentence]
                    else:
                        for k, v in translations.items():
                            if clean_sentence(k) == clean_sentence(orig_sentence):
                                matched_trans = v
                                break
                    
                    if matched_trans:
                        ex_clean = sentence_to_clean[orig_sentence]
                        cache[ex_clean] = matched_trans
                        success_count += 1
                
                print(f"   ✅ Done: Translated {success_count}/{len(batch)} in {time.time() - start_time:.1f}s using {engine_used}. (Total cached: {len(cache)})")
                
                # Save cache after every batch
                save_cache_safe(cache)
                
                # Dynamic delay based on API used
                if engine_used == "gemini":
                    time.sleep(4.0)
                elif engine_used == "groq":
                    time.sleep(16.0)
                else:
                    time.sleep(8.0)
            except Exception as e:
                print(f"❌ Error in batch {b_idx}: {e}")
                save_cache_safe(cache)
                # Sleep a bit and continue to the next batch
                time.sleep(10.0)

    # 3. Integrate into JSON files
    print("\n💾 Integrating translations into core_vocabulary.json...")
    for w in words:
        examples = w.get("examples", [])
        example_trans = []
        for ex in examples:
            ex_clean = clean_sentence(ex)
            example_trans.append(cache.get(ex_clean, ""))
        w["example_translations"] = example_trans
        
    with open(CORE_PATH, "w", encoding="utf-8") as f:
        json.dump(core_data, f, indent=2, ensure_ascii=False)
    print("  ✅ core_vocabulary.json updated.")

    if os.path.exists(FLASHCARDS_PATH):
        print("💾 Integrating translations into flashcards.json...")
        with open(FLASHCARDS_PATH, "r", encoding="utf-8") as f:
            fc_data = json.load(f)
        for fc in fc_data.get("flashcards", []):
            fc_word = fc["word"].upper()
            book_ex = fc.get("back_side", {}).get("book_example", "")
            if book_ex:
                ex_clean = clean_sentence(book_ex)
                if ex_clean in cache:
                    fc["back_side"]["book_example_bengali"] = cache[ex_clean]
        with open(FLASHCARDS_PATH, "w", encoding="utf-8") as f:
            json.dump(fc_data, f, indent=2, ensure_ascii=False)
        print("  ✅ flashcards.json updated.")

    print("\n👍 Data Enrichment complete! All example translations have been wired.")

if __name__ == "__main__":
    main()
