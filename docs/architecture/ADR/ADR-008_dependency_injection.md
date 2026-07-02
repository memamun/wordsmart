# ADR-008: Dependency Injection using GetIt

## Context
Clean Architecture isolates domain layers from data implementation layers. In Flutter, instantiating repository implementations inside UI screens creates direct compile-time coupling to data structures. We need a clean dependency injection (DI) mechanism to register data implementations and inject them into domain interactors and state managers.

## Decision
We adopt **GetIt (Service Locator)** as our central Composition Root inside `lib/core/di/injection.dart`:
- Abstract repository interfaces (`SearchRepository`, `WordRepository`) are registered as lazy singletons mapping to their concrete data implementations (`SearchRepositoryImpl`, `WordRepositoryImpl`).
- Usecases (`SearchWordsUseCase`, `GetWordDetailsUseCase`) are registered as singletons, resolving their repository dependencies automatically via `sl()`.
- Data Sources (`WordLocalDataSource`) are registered as lazy singletons resolving `AppDatabase` client connection.
- Riverpod Notifiers bridge with GetIt by resolving usecases and repository interfaces inside provider initializers:
  ```dart
  final searchNotifierProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
    return SearchNotifier(
      searchWordsUseCase: sl<SearchWordsUseCase>(),
      searchRepository: sl<SearchRepository>(),
    );
  });
  ```

## Consequences
- **Loose Coupling**: Presentation and state managers only import abstract domain repository interfaces, not concrete data sources or implementations.
- **Easy Mocking**: Unit tests can bypass the GetIt registry entirely and supply manual mock implementations in test constructors.
- **Unified Setup**: All dependency registrations are concentrated in a single file (`injection.dart`), preventing initialization race conditions.
