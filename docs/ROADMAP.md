# DEVELOPMENT ROADMAP

This document outlines the finished and upcoming milestones of the WordSmart application.

---

## 🗺️ Development Roadmap

```mermaid
gantt
    title WordSmart Project Roadmap
    dateFormat  YYYY-MM-DD
    section Backend & Data
    Phase 1: Requirements          :done, 2026-06-01, 2026-06-05
    Phase 2: Data Collection      :done, 2026-06-06, 2026-06-10
    Phase 3: Data Enrichment      :done, 2026-06-11, 2026-06-20
    Phase 4: Database Design      :done, 2026-06-21, 2026-06-25
    Phase 5: Project Stabilization :active, 2026-06-26, 2026-06-27
    section Mobile Client
    Phase 6: Flutter Architecture  :todo, 2026-06-28, 2026-07-02
    Phase 7: Repository Layer     :todo, 2026-07-03, 2026-07-07
    Phase 8: UI Development        :todo, 2026-07-08, 2026-07-20
```

---

## 🔄 Status of Phases

### Phase 1: Requirements ✅
*   Defined the core GRE/SAT/IELTS word list.
*   Established standard templates for definitions, phonetic pronunciations, mnemonics, example sentences, synonyms, and antonyms.

### Phase 2: Data Collection ✅
*   Extracted vocabulary data from raw sources (*Word Smart I*).
*   Compiled initial data sets into structured formats.

### Phase 3: Data Enrichment ✅
*   *Bengali Example Translations:* Batch-translated all 2,353 book example sentences into natural, colloquial Bengali using Gemini API.
*   *Popular Collocations:* Added 3 to 5 lowercase collocations per word (total 3,434 collocations) using AI-assisted generation.
*   *Validation Audits:* Replaced all Devanagari/Hindi letters with correct Bengali Unicode and validated formatting.

### Phase 4: Database Design ✅
*   Designed relational database schema mapping words, roots, examples, synonyms, antonyms, and collocations.
*   Implemented automated migrations to import JSON data into SQLite (`wordsmart.db`).

### Phase 5: Project Stabilization (NOW) ✅
*   Reorganized directory structure (Source data in `data/source`, SQLite in `data/database`, Caches in `archive/cache/`, Assets in `assets/audio`).
*   Created programmatic path update utility `reorganize_project.py` to adapt scripts.
*   Created robust collocation QA validator `validate_collocations.py`.
*   Standardized repository documentation.

---

## ⏳ Future Milestones (Mobile Client)

### Phase 6: Flutter Architecture
*   Initialize Flutter mobile project directory `app/` in root.
*   Set up state management (e.g. Riverpod / BLoC) and dependency injection.
*   Implement local asset loading to copy the built `wordsmart.db` file from assets to client app documents directory on first boot.
*   Configure local database adapters (e.g., using `sqflite` plugin).

### Phase 7: Repository Layer
*   Write interfaces and SQLite repository implementations:
    *   `WordRepository`: offline search, random word, detailed entry lookup.
    *   `QuizRepository`: loading quizzes, tracking test scores.
    *   `StoryRepository`: loading dual-language reading passages.
    *   `ProgressRepository`: saving user bookmarks, recall scores, study analytics.

### Phase 8: UI Development & Launch
*   Build clean, modern search interface with pronunciation audio players.
*   Build flashcards swipe panel with bilingual mnemonics toggle.
*   Build matching quiz game client and mock exam simulation screens.
*   Deploy app packaging (Android APK/Bundle, iOS IPA).
