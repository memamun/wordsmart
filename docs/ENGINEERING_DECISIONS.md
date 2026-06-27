# ENGINEERING & ARCHITECTURAL DECISIONS (ADR)

This document tracks major architectural decisions, reasons behind them, and trade-offs made throughout the design of the WordSmart data platform.

---

## ADR-001: Store Derivatives in a Separate Table

### Status
Accepted

### Decision
Model derivatives (e.g. `abashment` for `abash`) in a separate relational table `word_derivatives` linked to the primary `words` table via `word_id` foreign key instead of storing them as raw/denormalized JSON blocks.

### Reason
Enables users to search for derivative forms directly (e.g. searching "abashment" can immediately resolve to the parent word "ABASH") and supports automatic validation, POS classifications, and future expansion.

### Trade-off
Requires one extra JOIN or separate query when fetching the full details of a vocabulary word.

---

## ADR-002: Store Collocations in a Separate Table

### Status
Accepted

### Decision
Normalize collocations (e.g. `feel abashed` for `abash`) into a separate `word_collocations` table.

### Reason
Allows collocations to be indexed independently, supports rapid autocomplete/search matching, and facilitates future features (such as collocation matching quizzes and recall games).

### Trade-off
Increases index size and database schema complexity slightly.

---

## ADR-003: Isolated Local API Caches

### Status
Accepted

### Decision
Move all AI-assisted translation and collocation caches (`.example_translation_cache.json`, `.collocations_cache.json`, etc.) from the main `data/` folder to `archive/cache/` and add them to `.gitignore`.

### Reason
Keeps the primary data directory clean, separates development-specific temporary caching from the source database, and prevents developer-specific API keys or state from leaking into Git.

### Trade-off
Python enrichment scripts must explicitly load and write to custom directories instead of using root paths.

---

## ADR-004: JSON Files as Single Source of Truth (SSOT)

### Status
Accepted

### Decision
Define the JSON files in `data/source/` as the primary Source of Truth, compiling them statelessly into the SQLite database (`wordsmart.db`) only as a distribution step.

### Reason
JSON files are highly readable, easy to edit, support standard git diffs, and are platform-independent. This ensures the database is fully rebuildable at any time if corrupted or deleted.

### Trade-off
Requires maintaining a database builder script (`migrate_to_sqlite.py`) and running a compilation step before deployment.

---

## ADR-005: Standardized Formatting for Example Translations

### Status
Accepted

### Decision
Enforce strict formatting for example sentence translations: enclose the English vocabulary word in single quotes `'word'` and its Bengali context in parentheses `(meaning)` within the translated Bengali text (e.g., `'forbearance' (সহনশীলতা বা ধৈর্য)`).

### Reason
Ensures consistent UI rendering in the Flutter application (e.g., allowing specific CSS styles or bold weights to be applied to the English term and its definition automatically).

### Trade-off
Requires validation scripts to enforce formatting constraints on all example translations.

---

## ADR-006: Word Domain Entity Structure and Class Invariants

### Status
Accepted

### Decision
1. **Semi-Rich Domain Model:** Design the `Word` domain entity to encapsulate self-contained business logic (e.g. `hasAudio`, `hasMnemonic`, `isAdvanced`, `hasSynonyms`) utilizing only its own internal properties. Do not allow network, database, or external package dependencies (such as Flutter-specific elements or Audio Player packages) in the entity.
2. **Nullable Core Fields for Stubs:** Make `definition` and `bengaliMeaning` nullable (`String?`) to accommodate "stub words" (vocabulary items appearing only as synonyms/antonyms/roots with no full dictionary definitions).
3. **Class Invariants Validation:** Enforce constructor-level assertions (`assert(id > 0)`, `assert(word.trim().isNotEmpty)`) to guarantee the object's integrity.
4. **Lazy Loading Representation:** Represent unloaded relationships (e.g., synonyms, antonyms, collocations) as `null`, while loaded-but-empty relationships are represented as `[]`.

### Reason
- **Encapsulation:** Promotes self-documenting code and prevents logic duplication across presentation widgets.
- **Robustness:** Constructor assertions fail-fast if corrupted data enters the domain layer.
- **Relational Integrity:** Allows stub entries to exist as first-class domain entities without requiring placeholder definitions.
- **Clear Lazy Loading State:** Standardizes how the repository signals that a field has not been loaded, avoiding separate load-state management variables.

### Trade-off
UI developers must handle potential null values when presenting definitions or meanings, and we must explicitly handle lazy-loading state checks.
