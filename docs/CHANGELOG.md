# CHANGELOG

All notable changes to the WordSmart repository will be documented in this file.

---

## [1.2.0] - 2026-06-27
### Added
*   Added collocation quality verification script [validate_collocations.py](file:///home/mamun/wordsmart/scripts/validate_collocations.py) to check counts, uniqueness, casing, and noise words in collocations.
*   Added automatic folder reorganization utility [reorganize_project.py](file:///home/mamun/wordsmart/scripts/reorganize_project.py).
*   Added standard documentation artifacts:
    *   `README.md`
    *   `docs/PROJECT_STRUCTURE.md`
    *   `docs/DATA_PIPELINE.md`
    *   `docs/DATABASE.md`
    *   `docs/ARCHITECTURE.md`
    *   `docs/ROADMAP.md`
    *   `docs/CHANGELOG.md`

### Changed
*   Restructured project folders:
    *   Moved 12 primary JSON source files to `data/source/`.
    *   Moved temporary cache dotfiles and draft translations to `archive/cache/`.
    *   Moved compiled SQLite database `wordsmart.db` to `data/database/`.
    *   Moved audio MP3 files to `assets/audio/`.
*   Programmatically updated file paths inside all 19 Python scripts in `scripts/` to use the new directory locations.
*   Refined specific collocation entries (e.g. `apotheosis`, `apocalypse`, `bereaved`, `complacent`, `figurative`, `replete`) to resolve validation errors.

---

## [1.1.0] - 2026-06-26
### Added
*   Integrated 3,434 popular standard English collocations for all 822 core vocabulary words.
*   Created collocation generation utility script `scripts/generate_collocations.py`.

### Fixed
*   Corrected example sentence translations in `data/.example_translation_cache.json` for 57 discrepancies (enclosing English words in single quotes, wrapping Bengali definitions in parentheses).
*   Replaced all accidental Devanagari script characters (Hindi words) with correct Bengali equivalents.

---

## [1.0.0] - 2026-06-20
### Added
*   Initialized database repository with 12 structural JSON vocabulary files containing core words, quiz templates, and hit parades.
*   Added SQLite migration builder `scripts/migrate_to_sqlite.py` to compile JSON files into normalized tables.
*   Added database validation utility `scripts/validate_databases.py` and `scripts/validate_sqlite.py`.
