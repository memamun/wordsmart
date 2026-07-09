# Architecture Compliance Checklist

Release gate: Every release must pass ALL checks below.
Run `scripts/audit_architecture.sh` for automated verification.

---

## Dependency Rules

- [x] `core/` does NOT import `features/*`
- [x] `domain/` does NOT import `flutter/material.dart`
- [x] `domain/` does NOT import `sqflite`
- [x] `presentation/` does NOT execute raw SQL
- [x] `repository/` contains NO business rules
- [x] Use cases orchestrate all business logic
- [x] No circular dependencies between features

**Verification:** `grep -r "import.*features/" app/lib/core/` returns empty.

---

## Learning Engine (ADR-005, ADR-013)

- [x] All learning updates go through `SubmitLearningResultUseCase`
- [x] Single SM-2 implementation in `core/learning/engine/sm2_engine.dart`
- [x] No `DateTime.now()` inside `core/learning/` domain logic
- [x] `core/learning/` has zero imports from `features/*`
- [x] `LearningSignalAnalyzer` maps user signals to `ReviewRating`
- [x] LearningCard is the shared entity across review and practice

**Verification:** `grep -r "DateTime.now()" app/lib/core/learning/` returns empty (except Clock abstraction).

---

## Navigation (ADR-001)

- [x] No direct `Navigator.push` outside `AppNavigator`
- [x] No direct `Navigator.pop` outside `AppNavigator`
- [x] All navigation routes centralized in `AppNavigator`
- [x] `AppNavigator` methods are the only entry points

**Verification:** `grep -rn "Navigator\.\(push\|pop\)" app/lib/ | grep -v app_navigator` returns empty.

---

## Database (ADR-002, ADR-006)

- [x] SQL queries ONLY inside `data/datasources/` layer
- [x] All queries isolated behind abstract data source interfaces
- [x] Migrations tested via `database_migration_test.dart`
- [x] `story_progress` table created via `_ensureSchema` at runtime
- [x] No bundled DB fixtures in production code (only in tests)

**Verification:** `grep -rn "rawQuery\|rawInsert\|execute(" app/lib/ | grep -v datasources` returns empty.

---

## UI & Design System (ADR-007)

- [x] No business logic in presentation layer
- [x] All colors, spacing, animations use Design Tokens
- [x] Design System widgets have zero imports from `features/*`
- [x] Buttons, cards, inputs built on Design System primitives
- [x] `withValues(alpha:)` used instead of deprecated `withOpacity()`

**Verification:** `grep -r "import.*features/" app/lib/core/design_system/` returns empty.

---

## Dependency Injection (ADR-008)

- [x] All implementations registered in `injection.dart`
- [x] Presentation depends on abstract interfaces only
- [x] GetIt lazy singletons for all repositories and use cases
- [x] Providers reference `sl()` for all dependencies

**Verification:** Every use case class has a registration in `injection.dart`.

---

## Feature Isolation

- [x] `features/stories/` does NOT import `features/review/`
- [x] `features/recommendation/` does NOT import other features' `data/` or `domain/`
- [x] `features/practice/` communicates with review only through `core/learning`
- [x] Cross-feature interactions flow through `core/` shared capabilities

**Verification:** `grep -r "import.*features/review/" app/lib/features/stories/` returns empty.

---

## Testing Standards

- [x] 146 tests passing
- [x] 0 analyzer errors
- [x] 0 analyzer warnings
- [x] Property tests for SM-2 engine (10,000 iterations)
- [x] Property tests for question generators (10,000 iterations)
- [x] Database migration tests
- [x] Repository tests with mocked data sources
- [x] Widget tests for critical screens

**Verification:** `flutter test` and `flutter analyze` both pass clean.

---

## Performance Targets (pre-release)

- [ ] Cold start < 2s
- [ ] Search latency < 100ms
- [ ] Recommendation generation < 50ms
- [ ] Review queue build < 30ms
- [ ] Story open < 150ms
- [ ] Dashboard load < 200ms
- [ ] Frame rate: 60fps consistent

**Status:** NOT YET MEASURED on real devices.

---

## Release Status

| Check | v0.5.1 | v0.9.0-beta | v1.0.0 |
|---|---|---|---|
| Dependency rules | ✅ | | |
| Learning engine | ✅ | | |
| Navigation | ✅ | | |
| Database | ✅ | | |
| UI/Design system | ✅ | | |
| DI | ✅ | | |
| Feature isolation | ✅ | | |
| Testing | ✅ | | |
| Performance | ❌ | | |
| Beta feedback | ❌ | | |
