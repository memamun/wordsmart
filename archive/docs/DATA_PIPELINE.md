# DATA PIPELINE

This document explains the flow of vocabulary data from raw sources to the compiled SQLite database, and ultimately to the Flutter mobile application.

---

## 🗺️ Data Flow Diagram

```mermaid
graph TD
    A[Raw Book Sources / Markdown] -->|Extraction & Parse| B[Initial JSON Files]
    B -->|Data Enrichment Scripts| C[Enriched JSON Files]
    C -->|SQLite Builder| D[wordsmart.db]
    D -->|Flutter Bundle/Assets| E[Flutter App]
    
    subgraph Data Enrichment (scripts/)
        B1[Example Translations]
        B2[Popular Collocations]
        B3[Derivative Expansion]
        B4[Contextual Stories]
    end
    
    B --> B1 & B2 & B3 & B4
    B1 & B2 & B3 & B4 -->|Save updates| C
```

---

## 🛠️ Step-by-Step Pipeline Description

### 1. Raw Sources
*   The primary input is extracted from raw study materials (such as *Word Smart I*).
*   Parsed initially into raw structural formats containing the words, pronunciations, parts of speech, dictionary definitions, and book example sentences.

### 2. Data Enrichment (Python + AI APIs)
Enrichment scripts call LLM APIs (Gemini/Groq) using `.env` keys to populate advanced features:
*   **Example Translations (`generate_example_translations.py`):** Translates all book example sentences into natural, colloquial Bengali.
*   **Popular Collocations (`generate_collocations.py`):** Generates 3 to 5 standard, lowercase academic English collocations per word.
*   **Contextual Stories (`generate_stories.py`):** Groups vocabulary words into parallel dual-language stories.
*   *Note: Progress is saved to `archive/cache/` to ensure reliability, save costs, and support incremental runs.*

### 3. Enriched JSON Files (Source of Truth)
*   The output of the enrichment step is written to the 12 files in `data/source/`.
*   These JSON files represent the absolute **Source of Truth** for the project.

### 4. SQLite Builder (`migrate_to_sqlite.py`)
*   Loads all JSON files from `data/source/`.
*   Applies a standardized relational schema, creating indexes and enforcing foreign key constraints.
*   Compiles everything into a single file: `data/database/wordsmart.db`.

### 5. Verification & Auditing
Before bundling, validation scripts check the compiled output:
*   `validate_databases.py` checks JSON schema integrity.
*   `validate_sqlite.py` checks SQLite tables, constraint integrity, and row matching.
*   `validate_collocations.py` checks collocation quality metrics.

### 6. Flutter App Integration
*   The built `wordsmart.db` and audio MP3 files from `assets/audio/` are shipped directly inside the Flutter app's assets.
*   The Flutter database client reads `wordsmart.db` locally on the user's device for lightning-fast dictionary searches, study sessions, and offline tests.
