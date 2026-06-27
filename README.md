# WordSmart Data Repository

WordSmart is a comprehensive data and enrichment repository designed to support a robust vocabulary-learning mobile application (specifically targeting SAT, GRE, and IELTS prep). 

The repository structures raw vocabulary records, enhances them with definitions, phonetic pronunciations, mnemonics, standard collocations, contextual reading stories, and interactive drills, and compiles them into a clean, optimized, and validated SQLite database ready for Flutter app consumption.

---

## 📁 Repository Layout

The project structure is organized for clean separation of raw data sources, generated assets, local cache mechanisms, database builders, and verification scripts:

```
wordsmart/
├── data/
│   ├── source/      # 12 primary JSON source of truth databases
│   ├── generated/   # Generated outputs
│   └── database/    # Built SQLite database (wordsmart.db)
│
├── docs/            # Architecture, pipeline, roadmap, and DB schemas
│
├── scripts/         # Verification, migration, and data enrichment scripts
│
├── assets/          # Media assets (audio MP3 files)
│
└── archive/         # Archived data and local generation caches
```

For more detailed descriptions, see [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).

---

## 🚀 Getting Started

### Prerequisites
*   Python 3.8 or higher
*   SQLite3

### Installation
Clone the repository and inspect the folder:
```bash
git clone https://github.com/mamun/wordsmart.git
cd wordsmart
```

---

## 🛠️ Data Pipeline & Commands

### 1. Database Builder (JSON to SQLite)
Rebuilds the standardized SQLite database from the primary JSON sources:
```bash
python3 scripts/migrate_to_sqlite.py
```
*Creates: `data/database/wordsmart.db`*

### 2. Run Database Audits and Verifications
Verify that JSON files conform to schemas and SQLite tables match JSON data exactly:
```bash
python3 scripts/validate_databases.py
python3 scripts/validate_sqlite.py
```

### 3. Run Collocations Quality Verification
Audit the quality of standard English collocations (count, casing, stem presence, noise):
```bash
python3 scripts/validate_collocations.py
```

---

## 📖 Key Documentation

*   **[DATA_PIPELINE.md](docs/DATA_PIPELINE.md):** The flow of data from raw sources to the Flutter App.
*   **[DATABASE.md](docs/DATABASE.md):** Database schema, normalization, and data dictionary.
*   **[ARCHITECTURE.md](docs/ARCHITECTURE.md):** Architectural design and separation of concerns.
*   **[ROADMAP.md](docs/ROADMAP.md):** Completed and upcoming phases of development.
*   **[CHANGELOG.md](docs/CHANGELOG.md):** Release history and modifications log.
