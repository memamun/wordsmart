# WordSmart Data Architecture Specification v1.0

This document defines the relational data architecture, schema mappings, and progress-tracking models for WordSmart. It establishes how the 12 primary JSON datasets are unified inside the SQLite database (`wordsmart.db`) to power a cohesive, personalized learning graph.

---

## 🏛️ 1. Conceptual Data Graph

WordSmart does not operate on isolated datasets. It connects vocabulary words, roots, contextual reading passages, and study reviews into a unified knowledge graph:

```text
                     [core_vocabulary] (words)
                      /        |      \
                     /         |       \
          [word_roots]   [stories]   [quizzes / drills]
               |               |         |
            [roots]       [examples]  [final_exam]
               \               |        /
                \              |       /
                 ---> [user learning progress] <--- [bookmarks]
```

---

## 🗂️ 2. Core Relational SQLite Schema

All JSON sources are parsed and migrated into `wordsmart.db` under the following schema:

```mermaid
erDiagram
    words {
        INTEGER id PK
        TEXT word UNIQUE
        TEXT pronunciation
        TEXT part_of_speech
        TEXT definition
        TEXT bengali_meaning
        TEXT mnemonic
        TEXT level
        TEXT audio
        INTEGER quick_quiz_id
    }
    word_examples {
        INTEGER id PK
        INTEGER word_id FK
        TEXT example_text
        TEXT translation
    }
    word_synonyms {
        INTEGER id PK
        INTEGER word_id FK
        TEXT synonym
    }
    word_antonyms {
        INTEGER id PK
        INTEGER word_id FK
        TEXT antonym
    }
    word_derivatives {
        INTEGER id PK
        INTEGER word_id FK
        TEXT derivative_word
        TEXT part_of_speech
    }
    word_collocations {
        INTEGER id PK
        INTEGER word_id FK
        TEXT collocation
    }
    roots {
        INTEGER id PK
        TEXT root UNIQUE
        TEXT meaning
    }
    word_roots {
        INTEGER word_id FK
        INTEGER root_id FK
    }
    flashcards {
        INTEGER word_id PK, FK
        TEXT additional_example
        TEXT additional_example_bengali
        TEXT mnemonic_hint
    }
    vocab_drills {
        INTEGER word_id PK, FK
        TEXT bengali_meaning
        TEXT spelling
        TEXT definition_mcq
        TEXT synonym_mcq
        TEXT antonym_mcq
        TEXT sentence_completion
    }
    contextual_stories {
        INTEGER quiz_id PK
        TEXT quiz_title
        TEXT words_covered
        TEXT story_english
        TEXT story_bengali
        TEXT vocabulary_mapping
    }
    mcq_quizzes {
        INTEGER quiz_id PK
        TEXT quiz_title
        TEXT questions
    }
    quick_quizzes {
        INTEGER quiz_id PK
        TEXT quiz_title
        TEXT matches
        TEXT choices
        TEXT answer_key
    }
    advanced_sat_gre_quizzes {
        INTEGER quiz_id PK
        TEXT quiz_title
        TEXT analogies
        TEXT sentence_completions
        TEXT contextual_lexical
    }
    hit_parades {
        TEXT list_name PK
        INTEGER word_id PK, FK
        INTEGER rank
    }
    specialized_vocabulary {
        INTEGER chapter_number PK
        TEXT chapter_title
        TEXT term PK
        TEXT definition
        TEXT examples
    }
    final_exam {
        INTEGER drill_number PK
        TEXT drill_title
        TEXT drill_type
        TEXT instructions
        TEXT questions
        TEXT answers
    }
    bookmarks {
        INTEGER id PK
        INTEGER user_id
        INTEGER word_id FK
        TIMESTAMP created_at
    }
    progress {
        INTEGER id PK
        INTEGER user_id
        INTEGER word_id FK
        BOOLEAN is_read
        BOOLEAN is_reviewed
        INTEGER review_count
        INTEGER correct_count
        INTEGER incorrect_count
        INTEGER mastery_score
        TEXT status
        TIMESTAMP last_reviewed_at
        TIMESTAMP next_review_at
    }
```

---

## ⚡ 3. Dataset Mapping Specifications

### 1. `core_vocabulary.json`
*   **Purpose:** The primary vocabulary registry containing 822 headwords, definitions, example sentences, parts of speech, and initial mnemonics.
*   **Screens Consuming:** Home (01_home), Search (02_search), Word Details (03_word_details).
*   **UI Components:** Featured Word Card, Word Header, Meanings Card, Examples list.
*   **Relational Mapping:** Maps directly to `words`, `word_examples`, `word_synonyms`, `word_antonyms`, `word_derivatives`, and `word_collocations` tables.
*   **Progress Tracking:** Tracks user read/unread status, mastery scores (`0-100`), and next review timestamps in the `progress` table.

### 2. `word_roots.json`
*   **Purpose:** Etymological roots directory mapping 186 roots and their meanings to matching vocabulary words.
*   **Screens Consuming:** Word Details (03_word_details), Roots Exploration Directory (Future).
*   **UI Components:** Roots & Etymology Panel.
*   **Relational Mapping:** Populates `roots` table; links words via many-to-many junction table `word_roots`.
*   **Progress Tracking:** Indirect. Users are marked as having reviewed a root when they master at least 50% of the words associated with that root.

### 3. `mnemonics_database.json`
*   **Purpose:** Cognitive retention hooks containing English & Bengali memory prompts, association stories, and additional contextual sentences.
*   **Screens Consuming:** Word Details (03_word_details), Flashcards (04_flashcards) Back Side.
*   **UI Components:** Mnemonic Card (10% Amber theme).
*   **Relational Mapping:** Extends the `mnemonic` column in the `words` table and populates `mnemonic_hint` in `flashcards`.
*   **Progress Tracking:** Users can flag mnemonics as "helpful" (stored locally) or type custom personalized mnemonic notes.

### 4. `flashcards.json`
*   **Purpose:** Spaced repetition decks for review sessions containing front-side words and back-side definitions, additional examples, and mnemonics.
*   **Screens Consuming:** Flashcards Study (04_flashcards).
*   **UI Components:** Glass Card container (front/back flip), Mnemonic Card, Swipe buttons.
*   **Relational Mapping:** Populates the `flashcards` table; links back to `words.id`.
*   **Progress Tracking:** Tapping/Swiping "Still Learning" or "Mastered" updates `status` (unlearned, learning, mastered), increments `review_count`, and adjusts the SuperMemo-2 (SM-2) algorithm parameters (calculating `next_review_at` time window).

### 5. `hit_parades.json`
*   **Purpose:** Curated lists of high-frequency words for GRE (198 words) and SAT (245 words).
*   **Screens Consuming:** Home (01_home) bottom list, Specialized Tracks list.
*   **UI Components:** Hit Parade Card List, Rank badges.
*   **Relational Mapping:** Populates `hit_parades` table mapping `words.id` to `list_name` ("sat_hit_parade" or "gre_hit_parade") and `rank`.
*   **Progress Tracking:** Display tiles show a checkmark if the user has already marked the target word as "mastered" in `progress`.

### 6. `contextual_stories.json`
*   **Purpose:** High-context bilingual passages embedding vocabulary terms in natural, narrative scenarios.
*   **Screens Consuming:** Story Reader (06_story), Stories Directory.
*   **UI Components:** Bilingual Reader Pane, Highlighted Terms (Amber underline), Floating Action translation button, Inline Word Sheet overlay.
*   **Relational Mapping:** Populates `contextual_stories` table.
*   **Progress Tracking:** Tracks paragraphs read and automatically marks embedded vocabulary words as `is_read = 1` in `progress` upon story completion.

### 7. `mcq_quizzes.json`
*   **Purpose:** Regular vocabulary testing drills using standard definition-matching multiple-choice questions.
*   **Screens Consuming:** Quiz (05_quiz).
*   **UI Components:** MCQ Option Stack.
*   **Relational Mapping:** Populates `mcq_quizzes` table; questions list is stored as a serialized JSON array.
*   **Progress Tracking:** Correct/incorrect responses increment `correct_count` and `incorrect_count` in the `progress` table, lowering or raising the mastery score accordingly.

### 8. `quick_quizzes.json`
*   **Purpose:** Low-barrier, 1-minute matching challenges (words matched to definitions) featured on the Home screen.
*   **Screens Consuming:** Home Screen (01_home) "Today's Challenge", Quick Quiz Page.
*   **UI Components:** Matching Nodes Column (interactive connecting cards).
*   **Relational Mapping:** Populates `quick_quizzes` table; matches are mapped back to `words.quick_quiz_id`.
*   **Progress Tracking:** Completion updates daily targets, adding points to the user's weekly streak.

### 9. `vocab_drills.json`
*   **Purpose:** Granular word-level recall reinforcement drills (Spelling Clues, Synonym MCQ, Antonym MCQ, Sentence Completions).
*   **Screens Consuming:** Word Details (03_word_details) "Practice" sub-tab, Quiz Drills.
*   **UI Components:** Spelling Input box, Fill-in-the-blank dropdowns.
*   **Relational Mapping:** Populates the `vocab_drills` table containing serialized JSON options for spelling clues and completions.
*   **Progress Tracking:** Reinforces retention score. Successfully completing all 4 drills for a word locks its status to `mastered`.

### 10. `specialized_vocabulary.json`
*   **Purpose:** Curated thematic vocabulary modules (Common Usage Errors, Abbreviations, Arts, Computers, Finance, Foreign Phrases, Science).
*   **Screens Consuming:** Practice Tracks Directory, Specialized Study Screen.
*   **UI Components:** Chapter selection list, Glossary Cards.
*   **Relational Mapping:** Populates `specialized_vocabulary` table with category columns.
*   **Progress Tracking:** Tracks chapter progress as percentage (number of terms read vs total terms in chapter).

### 11. `advanced_sat_gre_quizzes.json`
*   **Purpose:** High-difficulty vocabulary challenges containing Analogies, Sentence Completions, and Contextual Lexical queries.
*   **Screens Consuming:** Advanced Practice Screen, Quiz (05_quiz) GRE/SAT Mode.
*   **UI Components:** MCQ Option Card, Analogy stem header.
*   **Relational Mapping:** Populates `advanced_sat_gre_quizzes` table containing serialized question arrays.
*   **Progress Tracking:** Logs quiz performance. Accuracy scores below 70% flag the covered words as "weak words" to prioritize them in review queues.

### 12. `final_exam.json`
*   **Purpose:** Large-scale, timed mock exams to evaluate final user retention.
*   **Screens Consuming:** Mock Exam page.
*   **UI Components:** Timed Exam header, quiz questions card, weak area review list.
*   **Relational Mapping:** Populates the `final_exam` table.
*   **Progress Tracking:** Generates a comprehensive performance report showing accuracy rating, time taken, weak areas, and updates vocabulary mastery levels globally.

---

## 📈 4. Spaced Repetition (SM-2) Progress Model

User progress tracking is calculated locally on the SQLite database level inside the `progress` table:

```sql
CREATE TABLE progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    word_id INTEGER NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    is_reviewed BOOLEAN DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    mastery_score INTEGER DEFAULT 0,  -- Capped at 100
    status TEXT DEFAULT 'unlearned',   -- 'unlearned', 'learning', 'mastered'
    last_reviewed_at TIMESTAMP,
    next_review_at TIMESTAMP,          -- Used to calculate Home review due queue
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);
```

### SM-2 Algorithm Implementation (Dart/Flutter side)
When a user reviews a card (Flashcard, Quiz, or Drill):
1.  **If Correct:**
    *   Increment `correct_count`.
    *   Increase `mastery_score` by `+20` (capped at `100`).
    *   Set status to `mastered` if score $\ge 80$.
    *   Calculate interval: $I(n) = I(n-1) \times E_f$ (where $E_f$ is the ease factor, default `2.5`).
2.  **If Incorrect:**
    *   Increment `incorrect_count`.
    *   Decrease `mastery_score` by `-15` (floor at `0`).
    *   Set status to `learning`.
    *   Reset review interval to $1$ day.
3.  Update `last_reviewed_at = DateTime.now()` and `next_review_at = DateTime.now().add(Duration(days: interval))`.
