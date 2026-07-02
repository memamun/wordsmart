# ADR-006: SQLite Database Versioning and Migration Strategy

## Context
As WordSmart Vocabulary evolves, we will add and modify tables. For example, in Slice 2, we need progress analytics, study session records, and weak word event logging. We need a strategy to upgrade SQLite schema versions safely on user devices without wiping user bookmarks, search history, or custom study progress.

## Decision
We enforce a structured **SQLite Database Versioning and Migration Strategy**:
- Every connection open inside `DatabaseInitializer` specifies a target schema `version`.
- We use the `onUpgrade` callback inside `openDatabase` to execute migrations sequentially.
- Schema changes are bundled as versioned scripts (e.g. `migration_v1_to_v2.sql`).
- All migrations must preserve backward compatibility, utilizing `ALTER TABLE` to add columns or creating new tables. Renaming or dropping columns is strictly avoided; if required, it is done via copying data to a temp table, dropping the old table, and renaming the temp table.
- A database sanity check step runs inside validation scripts (`validate_sqlite.py`) before shipping any release.

## Consequences
- **User Data Preservation**: Users do not lose progress or bookmarks when the app receives updates.
- **Sequential Safety**: If a user updates from v1 to v3, migrations run sequentially (v1 $\rightarrow$ v2 $\rightarrow$ v3), ensuring consistent state transitions.
- **Auditability**: Database evolution is fully tracked in sql migration scripts.
