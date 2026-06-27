# PROJECT STRUCTURE

This document details the layout of the `wordsmart` repository and the responsibilities of each directory.

---

## 📂 Directories

### 1. `data/`
Acts as the central datastore for the repository.
*   **`data/source/`:** The absolute **Source of Truth** for the project. Contains the 12 primary JSON databases. If the SQLite database is deleted, it can be entirely rebuilt using only the files in this directory.
*   **`data/database/`:** Contains the compiled SQLite database file (`wordsmart.db`) generated from the source JSON files.
*   **`data/generated/`:** Reserved directory for generated reports or export formats.

### 2. `docs/`
Contains documentation detailing the system architecture, database design, data pipeline, and developmental roadmap.

### 3. `scripts/`
A collection of Python utility scripts:
*   **Database Builders:** `migrate_to_sqlite.py` imports raw JSON data, normalizes records, and populates SQLite.
*   **Data Quality Audits:** `validate_databases.py`, `validate_sqlite.py`, and `validate_collocations.py` run automated checks to enforce strict quality and schema constraints.
*   **Enrichment Utilities:** Scripts to call AI APIs (Gemini/Groq) for example translations and collocations.

### 4. `assets/`
Static assets bundled into the mobile client:
*   **`assets/audio/`:** Pronunciation MP3 files for the core vocabulary (named in uppercase, e.g. `ABASH.mp3`).

### 5. `archive/`
Contains historical files and local caches to optimize API usage:
*   **`archive/cache/`:** Safe caches (e.g. `.example_translation_cache.json`, `.collocations_cache.json`) that store API generation progress, preventing redundant network requests.

---

## 🛠️ Folder Layout Visualization

```
wordsmart/
│
├── data/
│   ├── source/               # 12 primary JSON source databases
│   │   ├── core_vocabulary.json
│   │   ├── flashcards.json
│   │   ├── mcq_quizzes.json
│   │   └── ...
│   ├── database/
│   │   └── wordsmart.db      # Built SQLite database
│   └── generated/            # Placeholder for exports
│
├── docs/                     # Design and architectural docs
│
├── scripts/                  # Builders, validators, and enrichment scripts
│
├── assets/
│   └── audio/                # Audio MP3 files for pronunciations
│
├── archive/
│   └── cache/                # Cache files (.gemini_cache, .translation_cache)
│
└── README.md                 # Project landing page
```
