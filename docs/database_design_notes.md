# WordSmart Database Design & Architecture Notes

These notes capture architectural reflections, future improvement ideas, and design decisions for the `wordsmart.db` SQLite database layer.

---

## 1. Future V2 Ideas & Normalization Improvements

### 1.1 Synonyms Table Relation
*   **Current Design (V1):** `word_synonyms` stores synonyms as plain text strings (`synonym TEXT`).
*   **V2 Proposal:** Since many synonym words (e.g., "embarrass" for "abash") are also vocabulary words that will exist in the main `words` table, they should be modeled as an association between two word records:
    *   `word_id` (FK REFERENCES `words(id)`)
    *   `synonym_word_id` (FK REFERENCES `words(id)`)
*   **Status:** *Postponed (YAGNI).* The current string-based lookup design is perfectly acceptable for V1 MVP scope.

---

## 2. Derived Data & MVP Scope Reflections

### 2.1 Flashcards Table
*   **Current Design (V1):** Stores cards in a physical table: `flashcards` (`word_id`, `part_of_speech`, `pronunciation`, `front_side`, `back_side`).
*   **Architecture Discussion:** The flashcard contents (`front_side`, `back_side`) can be generated dynamically in the UI code or API layer from the `words` table rather than being persisted in the database.
*   **Conclusion:** Flashcard data may represent a *View Model* rather than a physical *Database Table*. This will be reviewed and discussed post-MVP.

### 2.2 Vocab Drills
*   **Current Design (V1):** Stores drill parameters (`definition_mcq`, `synonym_mcq`, `antonym_mcq`, etc.) in a physical table `vocab_drills`.
*   **Architecture Discussion:** Similar to flashcards, these drills can be generated dynamically at runtime from existing data (derived data).
*   **Conclusion:** In future iterations, physical tables containing static derived data will be minimized in favor of runtime generation to simplify maintenance and reduce storage.

---

## 3. Reference vs. Transaction Data Distinction

A core database concept is maintained:
*   **Reference Data (Rarely changes):**
    *   `words` (vocabulary lists)
    *   `roots` (lookups like `DICT` = "to say")
*   **Transaction Data (Changes constantly based on user activity):**
    *   `bookmarks` (user bookmarked words)
    *   `progress` (user learning logs like reviews, read flags, and mastery scores)

---

## 4. Stub Records for Secondary Words (Caution & Considerations)

*   **Current Action (V1):** 1,091 secondary words found in lists (roots, hit parades) but missing definitions in the main dictionary are inserted as "stub" records in the `words` table to satisfy foreign key constraints.
*   **Architectural Concern:** 
    *   Are these secondary words real vocabulary entries (which will eventually have detail pages) or supporting records?
    *   If they are just supporting records, inserting them into the main `words` table might pollute search results or details navigation.
    *   *Alternative:* Keep derivatives in `word_derivatives` and secondary terms in separate tables without inserting stubs in `words`.
*   **Status:** *Pending.* Do not make a decision now, but evaluate search usability and details page routing during UI implementation.
