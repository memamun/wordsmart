# ADR-002: SQLite Offline-First Database

## Context
WordSmart Vocabulary requires rapid lookup times ($<200$ms) to provide a premium, friction-free learning environment for advanced exams (GRE, SAT, IELTS). Relying on external network APIs for every autocomplete keystroke or details load is high-latency and prone to failure when offline.

## Decision
We implement an **Offline-First SQLite relational database structure** using `wordsmart.db`.
- The database is prepackaged into the assets bundle and copied once to the device document directory on cold startup.
- All primary lookups, synonyms, examples, and etymology queries run locally using relational joins on SQLite.
- Writing logs, bookmarks, and user progress scheduling are saved locally inside SQLite tables (`bookmarks`, `progress`).

## Consequences
- **Instant Latency**: Lookups resolve locally within $5-15$ms, well below the $200$ms budget.
- **Offline Reliability**: The app operates fully without active internet connectivity.
- **Zero API Cost**: Eliminates network server overhead for basic lookups.
