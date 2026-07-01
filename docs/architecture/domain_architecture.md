# WordSmart Domain Architecture Specification

Version: 1.0  
Category: Clean Architecture Domain & Folders Blueprint

This document defines the folder structure, domain entities, use cases, and repository interfaces that form the core business logic layer of WordSmart. It represents the absolute source of truth for Clean Architecture implementation in Flutter.

---

## 📂 1. Directory Structure Blueprint

WordSmart follows a **Feature-First + Clean Architecture** modular structure under `lib/features/`:

```text
lib/
 ├── core/                                # Shared infrastructure (DB helper, DI, theme)
 │    ├── di/                             # dependency_injection.dart
 │    ├── database/                       # sqlite_helper.dart
 │    └── theme/                          # design_system_theme.dart
 └── features/
      ├── dictionary/                     # Handles search, word details, and roots
      ├── study/                          # Handles review sessions, flashcards, and drills
      ├── reading/                        # Handles stories and paragraph translation
      └── profile/                        # Handles bookmarks, progress dashboard, settings
           ├── domain/
           │    ├── entities/             # Pure business models (e.g. Word, Session)
           │    ├── usecases/             # Application business rules (e.g. SearchWords)
           │    └── repositories/         # Abstract repository contracts (interfaces)
           ├── data/
           │    ├── models/               # JSON parsing, SQLite mapping extensions
           │    ├── datasources/          # local_database_datasource.dart, preferences_datasource.dart
           │    └── repositories/         # Repository implementation (domain repo implementations)
           └── presentation/
                ├── providers/            # Riverpod Notifiers, StateNotifiers
                ├── pages/                # Screen UI layouts
                └── widgets/              # Reusable UI widgets
```

---

## 🏛️ 2. Domain Entities

Domain entities are pure Dart classes with no dependencies on frameworks, databases, or JSON libraries.

### 1. `Word`
*   `int id`
*   `String word`
*   `String? pronunciation`
*   `String? partOfSpeech`
*   `String? definition`
*   `String? bengaliMeaning`
*   `String? mnemonic`
*   `String? level`
*   `String? audio`
*   `List<String> examples`
*   `List<String> synonyms`
*   `List<String> antonyms`
*   `List<String> collocations`
*   `Map<String, String> derivatives`

### 2. `Root`
*   `int id`
*   `String root`
*   `String meaning`
*   `List<String> familyWords`

### 3. `StudySession`
*   `int id`
*   `DateTime startedAt`
*   `DateTime? endedAt`
*   `String mode`
*   `int wordsEncountered`
*   `int correctAnswers`
*   `double scorePercentage`
*   `int durationSeconds`
*   `bool endedNormally`

### 4. `Story`
*   `int quizId`
*   `String quizTitle`
*   `List<String> wordsCovered`
*   `String storyEnglish`
*   `String storyBengali`
*   `Map<String, dynamic> vocabularyMapping`

### 5. `LearningProfile`
*   `int userId`
*   `String preferredLearningMode`
*   `String preferredStoryLanguage`
*   `bool audioAutoplay`
*   `int currentStreak`
*   `int longestStreak`

---

## ⚡ 3. Application Use Cases (Interactors)

Use cases encapsulate a single, discrete business action.

*   `SearchWords`: Takes `query` and returns ranked list of `Word` objects.
*   `GetWordDetails`: Takes `wordId` and returns a hydrated `Word` object with relations.
*   `SubmitReviewRecall`: Takes `wordId`, response time, and correctness to update SM-2 parameters.
*   `ToggleBookmark`: Adds or removes a bookmark for a word.
*   `GetDailyFeed`: Returns the ranked recommendations feed for the Home page.
*   `LogStudySession`: Commits study duration and accuracy stats to the database.
*   `GetStoryReader`: Loads a specific story and restores paragraph scroll offset.

---

## 🔌 4. Core Repository Interfaces (Domain Contracts)

These abstract classes sit in the Domain layer and define the boundaries for data operations:

```dart
// 1. SearchRepository
abstract class SearchRepository {
  Future<Word?> resolveExactHeadword(String query);
  Future<List<Word>> resolveRelatedMatches(String query);
  Future<List<String>> fetchSearchHistory(int limit);
  Future<void> logSearchEvent(String query, int? wordId, String openedFrom);
  Future<void> clearSearchHistory();
}

// 2. WordRepository
abstract class WordRepository {
  Future<Word> fetchWordDetails(int wordId);
  Future<List<Root>> fetchWordRoots(int wordId);
  Future<List<Word>> fetchRootFamilyWords(int rootId);
}

// 3. ReviewRepository
abstract class ReviewRepository {
  Future<List<Word>> fetchActiveReviewDeck(int limit);
  Future<void> submitRecallResult(int wordId, int strengthScore, int durationSeconds);
  Future<int> fetchReviewsDueCount();
}

// 4. StudyRepository
abstract class StudyRepository {
  Future<List<Word>> fetchVocabularyDrills(int limit);
  Future<void> logWeakWordEvent(int? sessionId, int wordId, String reason);
}

// 5. StoryRepository
abstract class StoryRepository {
  Future<List<Story>> fetchStoriesDirectory();
  Future<Story> fetchStoryReader(int storyId);
  Future<void> updateReadingPosition(int storyId, int paragraphIndex, int charOffset);
  Future<void> markStoryCompleted(int storyId);
}

// 6. BookmarkRepository
abstract class BookmarkRepository {
  Future<List<Word>> fetchBookmarks(String? filterTag);
  Future<void> addBookmark(int wordId, String reason);
  Future<void> removeBookmark(int wordId);
}

// 7. ProgressRepository
abstract class ProgressRepository {
  Future<LearningProfile> fetchLearningProfile(int userId);
  Future<void> updateDailyGoals(int reviewsDelta, int wordsDelta, int minutesDelta);
  Future<void> logLearningEvent(String eventType, int referenceId, String referenceType);
  Future<List<String>> fetchUnlockedMilestones();
}

// 8. RecommendationRepository
abstract class RecommendationRepository {
  Future<List<Map<String, dynamic>>> fetchRecommendedDailyFeed();
}

// 9. SettingsRepository
abstract class SettingsRepository {
  Future<void> saveUserPreferences(String mode, String language, bool autoplay);
  Future<Map<String, dynamic>> loadUserPreferences();
}
```
