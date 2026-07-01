# WordSmart Repository Architecture Specification

Version: 1.0  
Category: Clean Architecture Repository Layer

This document defines the Clean Architecture layers, repository interfaces, and local data source flows of WordSmart. It maps the bridge between the UI/Presentation layers and the SQLite database.

---

## 🏛️ 1. Architecture Flow & Dependency Direction

WordSmart enforces a strict Clean Architecture boundary. Dependencies point inwards towards the Domain layer:

```text
  [ Presentation Layer ] (UI Screens, Widgets, Providers/Notifier states)
            ↓
  [ Application / Use Case Layer ] (Orchestrates application rules)
            ↓
  [ Domain Layer ] (Defines pure Entities and Repository Contracts)
            ↓
  [ Repository Implementation Layer ] (Maps contracts to actual data actions)
            ↓
  [ Local Data Sources Layer ] (Local SQLite DB, Key-Value Preferences)
            ↓
  [ Local SQLite Database / SharedPreferences ]
```

---

## 🧩 2. Repository Contract Specifications

### 1. `SearchRepository`
*   **Domain Contract:** Defines search logic, suggestions lookup, and history tracking.
*   **Responsibilities:**
    *   `resolveExactHeadword(String query)`: Returns a single exact word match if found in database.
    *   `resolveRelatedMatches(String query)`: Returns broad matching words using prefix, whole-word, and synonym rankings.
    *   `fetchSearchHistory(int limit)`: Retrieves recent queries ordered newest first.
    *   `logSearchEvent(String query, int? wordId, String openedFrom)`: Records search metrics.
    *   `clearSearchHistory()`: Purges recent search database entries.

### 2. `WordRepository`
*   **Domain Contract:** Manages dictionary metadata and relationships.
*   **Responsibilities:**
    *   `fetchWordDetails(int wordId)`: Returns the core Word entity with pronunciation and Bengali meaning.
    *   `fetchWordExamples(int wordId)`: Retrieves bilingual example sentences.
    *   `fetchWordRelations(int wordId)`: Retrieves synonyms and antonyms chips.
    *   `fetchWordRoots(int wordId)`: Retrieves root nodes associated with the word.
    *   `fetchWordDerivativesAndCollocations(int wordId)`: Retrieves grammar variants and phrases.

### 3. `ReviewRepository`
*   **Domain Contract:** Orchestrates Spaced Repetition reviews queue.
*   **Responsibilities:**
    *   `fetchActiveReviewDeck(int limit)`: Retrieves words due for review (where `next_review_at` is past current time).
    *   `submitRecallResult(int wordId, int strengthScore, int durationSeconds)`: Submits learning signal to update SM-2 parameters in `progress` database table.
    *   `fetchReviewsDueCount()`: Counts remaining words in due queue.

### 4. `StoryRepository`
*   **Domain Contract:** Manages contextual dual-language stories.
*   **Responsibilities:**
    *   `fetchStoriesDirectory()`: Lists all stories with title, cover details, and words covered.
    *   `fetchStoryReader(int storyId)`: Retrieves English/Bengali paragraph stacks.
    *   `updateReadingPosition(int storyId, int paragraphIndex, int charOffset)`: Updates the exact last-read location.
    *   `markStoryCompleted(int storyId)`: Sets completion status and triggers progress updates for all covered words.

### 5. `ProgressRepository`
*   **Domain Contract:** Tracks user streaks, milestones, and daily goals.
*   **Responsibilities:**
    *   `fetchDailyGoals(DateTime date)`: Retrieves target vs completed metrics (reviews, words, studied minutes).
    *   `updateDailyGoals(int reviewsDelta, int wordsDelta, int minutesDelta)`: Increments completed stats.
    *   `fetchMilestones()`: Retrieves milestones registry list.
    *   `logLearningEvent(String eventType, int referenceId, String referenceType)`: Records a new event in `learning_events`.
    *   `fetchLearningProfile(int userId)`: Returns preferences and streak data.

### 6. `SettingsRepository`
*   **Domain Contract:** Handles user-configured preferences.
*   **Responsibilities:**
    *   `saveUserPreferences(String preferredMode, String preferredStoryLang, bool audioAutoplay)`: Saves settings in SharedPreferences.
    *   `loadUserPreferences()`: Loads configuration values.

### 7. `BookmarkRepository`
*   **Domain Contract:** Handles saved words registry.
*   **Responsibilities:**
    *   `fetchBookmarks(String? filterTag)`: Retrieves bookmarked word tiles matching filters.
    *   `addBookmark(int wordId, String reason)`: Saves word with category reason tag.
    *   `removeBookmark(int wordId)`: Deletes bookmark.

### 8. `LearningRepository`
*   **Domain Contract:** Manages active study sessions and mock tests.
*   **Responsibilities:**
    *   `startStudySession(String mode)`: Creates a new session entry.
    *   `endStudySession(int sessionId, int encounteredCount, int correctCount, int durationSeconds, bool endedNormally)`: Saves session summary.
    *   `logWeakWordEvent(int? sessionId, int wordId, String reason)`: Logs a diagnostic failure event.
