# Changelog

All notable changes to the WordSmart Vocabulary codebase will be documented in this file.

## [0.5.1] - 2026-07-02
### Changed
- **Architecture Audit**: Completed end-to-end audit verifying dependency direction, domain boundaries, and no duplicate models.
- **Word Entity Relocated**: Moved `Word`, `WordExample`, `WordDerivative`, `WordRoot` from `features/dictionary/domain/` to `core/domain/entities/`. Dictionary entities now re-export from core for backward compatibility.
- **Navigation Abstraction Extended**: Added `pop()`, `popToHome()`, `maybePop()` methods to `AppNavigator`. Routed all 10 direct `Navigator.pop`/`popUntil` calls through `AppNavigator` across 4 screen files.
- **Dependency Graph Cleaned**: Fixed inverted `core/learning → features/dictionary` dependency. All feature dependencies now flow upward to core.

### Added
- **Architecture Overview**: Published `docs/architecture/overview.md` with system architecture, dependency graph, and feature responsibilities.
- **ADR Index**: Published `docs/architecture/ADR/INDEX.md` cataloging all 15 ADRs.
- **Performance Baseline**: Published `docs/performance/baseline.md` with targets and measurement methodology.

## [0.5.0] - 2026-07-02
### Added
- **Recommendation Engine**: Added orchestration layer coordinating Dictionary, Stories, Review, Practice, and Dashboard features.
- **Recommendation Domain**: Added `Recommendation`, `RecommendationCandidate`, `RecommendationType` entities.
- **Recommendation Services**: Added `RecommendationScorer` (weighted scoring), `RecommendationRanker` (sort/dedup/cap), `RecommendationPolicy` (cooldown/daily cap), and `RecommendationCandidateFactory` (maps domain objects to candidates).
- **Recommendation Repository**: Added `RecommendationRepositoryImpl` with graceful degradation — fails only when all sources fail.
- **Recommendation Use Cases**: Added `GetRecommendationsUseCase`, `DismissRecommendationUseCase`, `CompleteRecommendationUseCase`.
- **Recommendation Provider**: Added `RecommendationNotifier` with cached state and load/refresh/dismiss/complete operations.
- **Recommendation UI**: Added `RecommendationCard` and `RecommendationList` widgets integrated into Home screen.
- **Recommendation Actions**: Added `RecommendationActionMapper` for presentation-layer navigation.
- **Home Screen Integration**: Updated `HomePage` with recommendation-driven layout and 5-tab navigation.
- **DI Registration**: Registered all Recommendation Engine services in `injection.dart`.
- **Tests**: Added repository tests, service tests, and widget tests for the Recommendation Engine.
- **Architecture**: Published `ADR-015_recommendation_engine.md` documenting the Recommendation Engine architecture.

## [0.4.0] - 2026-07-02
### Added
- **Stories Domain**: Added `Story`, `StoryParagraph`, `HighlightedWord`, `ReadingPosition`, `StoryProgress`, `ReadingSession`, and `ReadingStatistics` entities.
- **Reading Engine**: Added pure Dart services — `ReadingPositionTracker`, `StoryCompletionPolicy`, `VocabularyExposureAnalyzer`, `ReadingStatisticsCalculator`.
- **Story Repository**: Added `StoryRepository` abstract contract and `SQLiteStoryLocalDataSource` with `story_progress` table created via runtime migration.
- **Story Use Cases**: Added `GetStoryUseCase`, `GetStoriesUseCase`, `ContinueStoryUseCase`, and `SaveReadingPositionUseCase`.
- **Story Provider**: Added `StoryReaderNotifier` with loading/active/completed/failure states.
- **Story UI**: Created `StoryReaderPage` with paragraph rendering, `ReadingProgressBar`, and `WordContextSheet` inline bottom sheet for highlighted word taps.
- **Clock Abstraction**: Added `Clock` interface, `SystemClock`, and `FakeClock` in `core/learning/time/` for deterministic testing.
- **Navigation Integration**: Added `pushStoryReader` to `AppNavigator` and `storyReader` route to `AppRoutes`.
- **Home Screen**: Added `HomePage` with 5-tab `NavigationBar` connecting Dictionary, Stories, Review, Practice, and Progress Dashboard.
- **App Theme**: Configured `MaterialApp` with dark theme using `AppColors` tokens.
- **Migration Tests**: Added `story_progress_migration_test.dart` verifying table creation, column schema, insert/upsert, and query operations.
- **Tests**: Added domain entity tests, reading service tests, story model tests, and use case tests.
- **Architecture**: Published `ADR-014_story_engine.md` documenting the Story Engine architecture.

## [0.3.1] - 2026-07-02
### Changed
- **Learning Engine Extraction**: Moved shared learning domain classes from `features/review/domain/` to `core/learning/` — `SM2Engine`, `LearningSignalAnalyzer`, `LearningCard` (renamed from `ReviewCard`), `LearningResult` (renamed from `ReviewResult`), and shared value objects (`LearningState`, `ReviewRating`, `ReviewMode`, `ReviewPriority`, `MasteryScore`).
- **Analytics Abstraction**: Introduced `LearningEventLogger` abstract interface in `core/analytics/` with `SQLiteLearningEventLogger` implementation, replacing direct `INSERT INTO learning_events` SQL in review data source.
- **Design Token Centralization**: Added `AppAnimation` token file. Added `mnemonicText` color to `AppColors`. Replaced 49+ scattered `Color(0xFF...)` literals across dictionary widget files with centralized `AppColors` references.
- **Navigation Layer**: Created `AppRoutes` and `AppNavigator` in `core/navigation/`, encapsulating all `Navigator.push`/`maybePop` calls. All screen files now use `AppNavigator` instead of direct Flutter navigation.
- **Backward Compatibility**: `ReviewCard`, `ReviewResult`, `SM2Engine`, `LearningSignalAnalyzer`, and `SubmitCardReviewUseCase` (renamed to `SubmitLearningResultUseCase`) maintain typedef/re-export aliases for zero-breakage migration.

### Added
- **Property Tests**: Added 10,000-iteration SM-2 engine property test verifying EF >= 1.3, interval >= 0, repetition >= 0, valid LearningState transitions, and correct first/second review intervals.
- **Generator Property Tests**: Added 10,000-iteration question generator property tests for Definition MCQ, Spelling, Sentence Completion, Synonym MCQ, and Antonym MCQ — asserting no duplicate options, correct answer always present, no empty questions, and POS consistency.
- **Architecture**: Published `ADR-013_learning_engine_extraction.md` documenting the extraction decision, dependency direction, and backward compatibility strategy.

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
