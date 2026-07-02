# Changelog

All notable changes to the WordSmart Vocabulary codebase will be documented in this file.

## [1.2.0] - 2026-07-02
### Added
- **Practice Engine Domain**: Added polymorphic `QuestionGenerator` interface with 5 concrete strategies (Definition MCQ, Synonym, Antonym, Spelling, Sentence Completion) and POS-aware `BasicDistractorProvider` for intelligent MCQ option generation.
- **Practice Session Builder**: Domain service assembling balanced practice sessions with cyclical question distribution, multi-level fallback recovery, and `PracticeMode` enum for session type selection.
- **Unified Learning Pipeline**: Practice answers flow through the existing `SubmitCardReviewUseCase → LearningSignalAnalyzer → SM2Engine → ReviewRepository` pipeline, eliminating duplicate progress tracking.
- **Practice Repository Adapters**: Implemented `PracticeRepositoryImpl` and `SQLitePracticeLocalDataSource` with isolated SQL queries, reusing existing `progress` and `study_sessions` tables.
- **Practice Use Cases**: Added `GetPracticeSessionUseCase`, `SubmitPracticeAnswerUseCase`, and `FinishPracticeSessionUseCase` orchestrating session lifecycle without business logic duplication.
- **Practice State Management**: Built auto-dispose `PracticeSessionNotifier` with sealed states (Initial, Loading, Active, Completed, Failure) and GetIt DI registrations.
- **Practice UI**: Created `PracticeSessionPage` with `QuestionRenderer` abstraction dispatching to MCQ option tiles and spelling input cards, plus `PracticeSummaryPage` with accuracy score card and metrics grid.
- **Architecture**: Published `ADR-012_practice_engine.md` defining shared SM-2 pipeline, strategy pattern generators, and practice session lifecycle.
- **Verification Tests**: Added domain entity tests, generator strategy tests, session builder tests, repository tests, use case tests, provider tests, and widget tests.

## [1.1.0] - 2026-07-02
### Added
- **Domain Spaced Repetition**: Added pure Dart immutable `SM2Engine` and `LearningSignalAnalyzer` mapping user correctness, response delays, and hint signals to `ReviewRating`.
- **Review Scheduler**: Added `ReviewScheduler` and `ReviewQueueBuilder` implementing 5-tier queue priority levels (Overdue > Decaying > Due > Learning > New) and Spelling root-prefix interleaving variety to prevent cognitive fatigue.
- **Database Schema Upgrades**: Migrated SQLite client from V1 to V2 database version, adding `ease_factor`, `interval_days`, `repetitions`, and `learning_state` spacing columns to `progress` table, and creating 8 user data tables (e.g. `study_sessions`, `learning_events`).
- **Data Adapters**: Implemented transaction-safe `SQLiteReviewLocalDataSource` logging updates atomically. Created model maps and conversions `ReviewCardMapper` and `StudySessionMapper`.
- **Application Orchestrator**: Added 6 clean use cases (`GetDailyQueue`, `StartReviewSession`, `SubmitCardReview`, `FinishReviewSession`, `GetLearningMetrics`, `GetProgressSummary`).
- **State Management**: Built auto-dispose Riverpod notifiers (`ReviewQueueNotifier`, `ReviewSessionNotifier`, `ProgressNotifier`) managing session and statistics flows cleanly.
- **Flashcard UI**: Created `ReviewSessionPage` featuring interactive 3D perspective rotational flip cards, memory rating bar, progress track indicators, celebration summaries, and skeleton shimmers.
- **Progress Dashboard**: Built `ProgressDashboardPage` composing dynamic study streak, daily goal progress track, and overview grid metrics.
- **Architecture**: Published `ADR-011_dashboard_architecture.md` outlining the separation of Actionable (Home) vs Analytics (Dashboard) screens.
- **Verification Tests**: Added robust unit tests, widgets skeleton test suites, property-based simulation tests, and transaction rollback integrity checks.

## [1.0.0] - 2026-07-02
### Added
*   **Database**: Migrated prepackaged `wordsmart.db` SQLite database, adding `translation` column inside `word_examples` table to store Bengali translations of example sentences. Rebuilt database successfully with 0 errors.
*   **Database Initializer**: Added thread-safe singleton database client `AppDatabase` and automated copy initializer `DatabaseInitializer` validating critical query indexes.
*   **Datasource**: Built `SQLiteWordLocalDataSource` implementing query abstraction and 6-tier search priority match rankings.
*   **Repository**: Built `SearchRepositoryImpl` and updated `WordRepositoryImpl` to bind the new modular SQLite datasource.
*   **Use Cases**: Built `GetWordDetailsUseCase` and updated `SearchWordsUseCase` interactor.
*   **Providers**: Added Riverpod state notifiers `SearchNotifier` and `WordDetailsNotifier` with loading, failure, and cached state handling.
*   **UI Components**: Created reusable design system widgets: `WordSearchBar`, `SectionHeader`, `FeaturedWordCard`, `WordListTile`, `BookmarkButton`, `AudioButton`, `PrimaryButton`, `LoadingSkeleton`, and `EmptyState`.
*   **UI Screens**: Built fully functional `SearchPage` (with typing debounce and suggestions autocomplete) and `WordDetailsPage` (with collapsible sliver layout, examples list, etymology details, and persistent study actions).
*   **Navigation**: Embedded Hero transition animation between Search Exact Match card and Details page.
*   **Tests**: Created automated unit test suites for domain use cases, search repository, and state providers, and wrote acceptance e2e integration test scripts.
*   **Documentation**: Created `vertical_slice_retrospective.md` covering Slice 1 architecture questions.

### Changed
*   **Code Reorganization**: Restructured codebase to Feature-First clean architecture under `lib/features/dictionary/` and `lib/features/profile/`, updating all relative imports.
