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
