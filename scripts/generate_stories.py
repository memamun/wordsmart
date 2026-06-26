#!/usr/bin/env python3
"""Script to replace generic contextual stories in contextual_stories.json using the Gemini API."""

import json
import os
import time
import urllib.request
import urllib.error
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
STORIES_PATH = os.path.join(DATA_DIR, "contextual_stories.json")
CACHE_PATH = os.path.join(DATA_DIR, ".story_cache.json")
ENV_PATH = os.path.join(PROJECT_ROOT, ".env")

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

def get_gemini_story(api_key, words, vocab_mapping):
    words_str = ", ".join(words)
    mapping_str = "\n".join([f"- {item['word']}: {item['definition']} (Bengali meaning: {item['bengali_meaning']})" for item in vocab_mapping])

    prompt = f"""You are an expert bilingual creative writer and English vocabulary teacher.
We need a highly engaging, cohesive, natural, and memorable short story (about 3 to 5 sentences) that contextually weaves in all of the following vocabulary words:
Words to cover: {words_str}

Definitions and Bengali meanings for reference:
{mapping_str}

Please generate the story satisfying these strict requirements:
1. 'story_english': A beautiful, grammatically perfect, and coherent English narrative.
   - You MUST bold ALL the target words in the story (e.g. '**abashed**' or '**abate**' or '**abdicated**'). You can use inflected forms like past tense or plural as natural, but they must be bolded.
   - The story must feel like a single cohesive paragraph, NOT a list of sentences.
2. 'story_bengali': A fluent, natural, and beautifully written Bengali translation of the English story.
   - In the Bengali story, when you translate each of the vocabulary words, you MUST include the English word in parentheses and bolded immediately after its translation (e.g. 'লজ্জিত (**abashed**)', 'প্রশমিত (**abate**)', 'সিংহাসন ত্যাগ করার (**abdicate**)').
   - The Bengali story must flow naturally and feel like authentic Bengali, not a mechanical machine translation.

Return the result strictly as a JSON object with keys:
- 'story_english': The generated English story.
- 'story_bengali': The generated Bengali story.
"""

    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "story_english": {"type": "STRING"},
                    "story_bengali": {"type": "STRING"}
                },
                "required": ["story_english", "story_bengali"]
            }
        }
    }

    models = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-pro-latest", "gemini-3-flash-preview"]
    
    for model in models:
        print(f"  Attempting with model: {model}...")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        data = json.dumps(payload).encode('utf-8')
        
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"}
        )
        
        max_retries = 3
        backoff = 4
        success = False
        result = None
        
        for attempt in range(max_retries):
            try:
                with urllib.request.urlopen(req, timeout=40) as response:
                    res_body = response.read().decode('utf-8')
                    res_json = json.loads(res_body)
                    
                    candidates = res_json.get("candidates", [])
                    if candidates:
                        text_content = candidates[0]["content"]["parts"][0]["text"]
                        result = json.loads(text_content)
                        success = True
                        break
                    raise ValueError("No candidates returned from Gemini API.")
                    
            except urllib.error.HTTPError as e:
                code = e.code
                err_msg = e.read().decode('utf-8')
                
                # Check if it's a quota limit or RESOURCE_EXHAUSTED
                if code == 429 and ("quota" in err_msg.lower() or "limit" in err_msg.lower() or "exhausted" in err_msg.lower()):
                    print(f"  ⚠️ Quota exhausted for model {model}. Switching model...")
                    break
                elif code == 429:
                    print(f"  ⚠️ Rate limited (429). Retrying in {backoff}s...")
                    time.sleep(backoff)
                    backoff *= 2
                else:
                    print(f"  ❌ HTTP Error {code} with model {model}: {err_msg}")
                    break
            except Exception as e:
                print(f"  ⚠️ Exception with model {model}: {e}. Retrying in {backoff}s...")
                time.sleep(backoff)
                backoff *= 2
                
        if success:
            return result
            
    raise RuntimeError("Failed to fetch story from all Gemini models.")

def is_generic_story(story_english):
    # Placeholders have this generic pattern (case-insensitive)
    return "protagonist" in story_english.lower()

def main():
    api_key = load_api_key()
    if not api_key:
        print(f"❌ Error: GOOGLE_API_KEY not found in {ENV_PATH}!")
        return

    print("📖 Loading contextual_stories.json...")
    if not os.path.exists(STORIES_PATH):
        print(f"❌ Error: {STORIES_PATH} does not exist!")
        return

    with open(STORIES_PATH, "r", encoding="utf-8") as f:
        database = json.load(f)

    stories = database.get("stories", [])
    print(f"Total stories in database: {len(stories)}")

    cache = load_cache()
    print(f"Loaded story cache containing {len(cache)} entries.")

    # Find generic stories that need to be replaced
    generic_indices = []
    for idx, story in enumerate(stories):
        quiz_id = story.get("quiz_id")
        # Quizzes 1, 2, 3 are manual pre-baked stories, keep them.
        if quiz_id in [1, 2, 3]:
            continue
        if is_generic_story(story.get("story_english", "")):
            generic_indices.append(idx)

    total_to_generate = len(generic_indices)
    print(f"🔍 Found {total_to_generate} placeholder stories that need to be generated.")

    if total_to_generate == 0:
        print("🎉 No generic stories found! All stories are already rich and complete.")
        return

    completed = 0
    for idx in generic_indices:
        story = stories[idx]
        quiz_id = str(story.get("quiz_id"))
        quiz_title = story.get("quiz_title")
        words = story.get("words_covered", [])
        vocab_mapping = story.get("vocabulary_mapping", [])

        print(f"\n[{completed + 1}/{total_to_generate}] Processing {quiz_title} (ID: {quiz_id}) for words: {words}")

        # Check cache first
        if quiz_id in cache:
            print(f"  ✨ Found in cache! Applying cached story.")
            stories[idx]["story_english"] = cache[quiz_id]["story_english"]
            stories[idx]["story_bengali"] = cache[quiz_id]["story_bengali"]
            completed += 1
            continue

        # Fetch from Gemini API
        try:
            # Respect rate limits
            time.sleep(5.5)
            
            result = get_gemini_story(api_key, words, vocab_mapping)
            
            # Print brief preview of what was generated
            print(f"  ✅ English: {result['story_english'][:100]}...")
            print(f"  ✅ Bengali: {result['story_bengali'][:100]}...")

            # Update cache
            cache[quiz_id] = result
            save_cache(cache)

            # Update in-memory database and save file immediately
            stories[idx]["story_english"] = result["story_english"]
            stories[idx]["story_bengali"] = result["story_bengali"]
            
            with open(STORIES_PATH, "w", encoding="utf-8") as f:
                json.dump(database, f, indent=2, ensure_ascii=False)
            
            completed += 1
            print(f"  💾 Saved progress to contextual_stories.json.")

        except Exception as e:
            print(f"  ❌ Failed to generate story for {quiz_title}: {e}")
            print("Stopping execution. You can safely run this script again to resume from the last successful cache.")
            break

    print(f"\n🎉 Finished! Successfully updated {completed} of {total_to_generate} stories.")

if __name__ == "__main__":
    main()
