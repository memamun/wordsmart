# Word Entity Invariants

This document outlines the invariants (business rules that must always hold true) for the `Word` domain entity in WordSmart.

## Invariant Rules

1. **`id` must always be > 0**
   - **Rule:** The identifier of a word must be a positive integer.
   - **Reason:** Database primary keys in SQLite start at 1. An ID of 0 or a negative number is invalid.

2. **`word` cannot be empty**
   - **Rule:** The spelling representation of the word (`word`) must be non-empty and non-blank (i.e., `word.trim().isNotEmpty` must be true).
   - **Reason:** A vocabulary entry without an English spelling is meaningless.

3. **Stub words are valid words**
   - **Rule:** Words that exist only as references in synonyms, antonyms, or roots (and do not have full dictionary definitions) are valid.
   - **Reason:** To support stubs, core descriptive fields like `definition` and `bengaliMeaning` must be nullable (`String?`).

4. **`pronunciation` may be absent (null)**
   - **Rule:** Pronunciation phonetic text is optional.
   - **Reason:** Stub words and some simple vocabulary entries may lack pronunciation keys.

5. **`synonyms` may be unloaded (null)**
   - **Rule:** The synonyms list may be null (representing an unloaded lazy relationship) or an empty list `[]` (representing a loaded relationship with zero synonyms).
   - **Reason:** Crucial for lazy loading to prevent preloading unnecessary data on search screens.

6. **`derivatives` may be unloaded (null)**
   - **Rule:** The derivatives collection may be null (representing an unloaded relationship) or a loaded map/list.
   - **Reason:** Supports lazy loading on demand.

7. **`examples` may be unloaded (null)**
   - **Rule:** The examples collection may be null (representing an unloaded relationship) or a loaded list.
   - **Reason:** Avoids loading large example and translation trees during minimal lookups.

8. **`audio` may be absent (null)**
   - **Rule:** The audio pronunciation path is optional.
   - **Reason:** Many stub words do not have dedicated MP3 pronunciation files.

9. **Word identity never changes**
   - **Rule:** Once a `Word` entity is instantiated, its identity (`id`) is immutable and unique.
   - **Reason:** To ensure thread safety and predictable navigation across screens.

10. **Word is immutable**
    - **Rule:** All properties of the `Word` class must be marked `final`.
    - **Reason:** Prevents runtime side effects, facilitates safe multithreading, and allows Flutter to optimize widget rebuilding.
