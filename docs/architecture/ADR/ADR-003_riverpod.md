# ADR-003: Riverpod State Management

## Context
Decoupling business logic and network/database fetching from presentation layout is a core tenet of Clean Architecture. Flutter's default `setState` is insufficient for complex cross-screen state sync, such as bookmark status updating or search suggestions and results synchronization.

## Decision
We adopt **Riverpod (using `StateNotifier` and `StateNotifierProvider`)** as the primary state management framework:
- State notifiers (`SearchNotifier`, `WordDetailsNotifier`) hold immutable states representing current user queries, results, loading status, or error messages.
- The UI listens (`ref.watch`) to these state providers to rebuild layouts reactively.
- Repository dependencies are injected into providers at the composition root using `GetIt` registry lookups.

## Consequences
- **Testability**: State notifiers are plain Dart objects that can be unit-tested without rebuilding widget trees or mocking BuildContext.
- **Predictable States**: Immutability prevents state mutation side-effects across components.
- **Separation of Concerns**: UI components are stateless or simple reactive state consumers, keeping screen files small and focused on layout assembly.
