# Repository Layer Design & Business Rules

This document outlines architectural design decisions, future roadmap notes, and business rules for the repository layer in WordSmart.

---

## 📋 Roadmap Notes (Design Comments)

### 1. Search Results returning `WordSummary` (Future Change)
- **Current Signature:** `Future<Either<Failure, List<Word>>> searchWords(String query)`
- **Design Note:** Currently, search returns the general `Word` entity with non-core properties set to null (lazy-loaded placeholder). In the future, to keep boundaries and intents extremely clean, we will transition to a dedicated `WordSummary` entity representing search results. This reduces definition clutter on search models.

### 2. Autocomplete suggestions returning `SearchSuggestion` (Future Change)
- **Current Signature:** `Future<Either<Failure, List<String>>> getSearchSuggestions(String query)`
- **Design Note:** Currently, autocomplete suggestions return simple `List<String>`. If we want to enrich search results with matching types (e.g. synonym match, exact match), frequency scores, or derivative info, we will refactor the return type to a dedicated `SearchSuggestion` Value Object.

### 3. Domain Evolution of Example Translations (Future Proofing)
- **Current Design:** `Map<int, String> translations` maps an example ID to a single translation string.
- **Design Note:** If requirements expand tomorrow to support multiple translations per example (e.g., English -> Bangla + Japanese), this map shape will break. We will evolve this into a dedicated `TranslationBundle` or list of values when multi-language support is requested.

---

## 🎯 Repository Business Rules

### 1. `getRandomCoreWord()` Selection Rule
- **Rule:** When requesting a random word for daily study or study card games, the repository **must only select core words** (IDs 1 to 822) that have definitions, phonetic spellings, and part-of-speech metadata.
- **Reason:** Database stubs (IDs 823 to 1913) are relational references without definitions. Picking a stub as a "random word" would result in an empty details screen for the user.

### 2. Bookmark Idempotency (`addBookmark`)
- **Rule:** Bookmarking an already bookmarked word **must be treated as a success (Idempotent)** and not trigger a Failure.
- **Reason:** If the user presses "Bookmark" twice or the UI triggers a race condition, throwing a `DatabaseFailure` for a duplicate key constraint violates user experience. The repository layer should catch SQLite `UNIQUE` constraint errors and resolve them as a successful operations (`Right(void)`).
- **Not Found Rule:** If a user tries to bookmark a word ID that does not exist in the `words` table, the repository must return a `Left(WordNotFoundFailure)`.

### 3. Spaced-Repetition Review Selection (`getDueWordsForReview`)
- **Rule:** Spaced repetition queries must fetch words where `next_review_at` is less than or equal to the current device timestamp (`DateTime.now()`), ordered by review priority (e.g. lowest mastery score first).
- **Type Safety:** The learning status is restricted to the type-safe `LearningStatus` enum (`unlearned`, `learning`, `mastered`, `review`), preventing database spelling typos from corrupting logic.

---

## 🛡️ Error Tolerance & Partial Data Failures
- **Rule:** If a secondary relationship (like `roots` or `derivatives`) fails to load due to database corruption, should the entire detail query fail?
- **Decision:** As a dictionary app, definitions and phonetic spellings are critical; roots and derivatives are nice-to-have. If secondary tables fail, the repository should fallback gracefully by injecting empty collections (`[]`) for those relations and logging the error rather than failing the whole screen.

---

## 🔒 Developer Error vs User Error (Logger Isolation)
- **Rule:** The repository implementation must catch low-level runtime exceptions (like `SQLiteException`) and log them internally using a logging client. It must **never** expose technical database error details to the Presentation layer or UI screen.
- **User Message:** The UI must receive a clean, friendly message like: *"Unable to load word details. Please try again."*
- **Developer Message:** The logs must receive the exact trace, e.g., *"SQLiteException: no such table: word_synonyms near column..."*
