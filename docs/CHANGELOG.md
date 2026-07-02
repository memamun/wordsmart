# Changelog

All notable changes to the WordSmart Vocabulary codebase will be documented in this file.

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
