# Project Status Dashboard

Single source of truth for WordSmart development.

---

## Current Version

| Field | Value |
|---|---|
| Version | **v0.5.1** |
| Phase | Production Validation |
| Date | 2026-07-02 |

---

## Release Gates

| Gate | Document | Status |
|---|---|---|
| **Architecture Gate** | `docs/architecture/ARCHITECTURE_COMPLIANCE.md` | ✅ 14/14 checks pass |
| **Design Gate** | `docs/design/UI_UX_AUDIT_REPORT.md` | ❌ Audited (Failed: legibility & component drift) |
| **Product Gate** | Real-device testing + beta feedback | ❌ Not started |

### Architecture Gate Details

| Check | Status |
|---|---|
| `flutter analyze` | ✅ 0 errors, 0 warnings |
| `flutter test` | ✅ 146/146 passing |
| `flutter test --coverage` | ✅ coverage/lcov.info generated |
| Architecture audit script | ✅ All 14 checks pass |
| Performance baseline | ❌ Not measured on real devices |

---

## ADR Decision Matrix

| ADR | Title | Rule | Status |
|---|---|---|---|
| ADR-001 | Feature-First Architecture | All code in `features/<name>/` with data/domain/presentation | ✅ |
| ADR-002 | SQLite Offline-First | All queries against local `wordsmart.db` | ✅ |
| ADR-003 | Riverpod State Management | StateNotifier + immutable states | ✅ |
| ADR-004 | Search Ranking | 6-tier priority ranking | ✅ |
| ADR-005 | SM-2 Spaced Repetition | Single SM-2 in `core/learning/engine/` | ✅ |
| ADR-006 | Database Versioning | Sequential migrations with `onUpgrade` | ✅ |
| ADR-007 | Design System | No feature imports in design widgets | ✅ |
| ADR-008 | Dependency Injection | GetIt lazy singletons in `injection.dart` | ✅ |
| ADR-009 | Review Queue | QueueBuilder prioritizes overdue > new | ✅ |
| ADR-010 | Learning Metrics | Computed dynamically from SQLite histories | ✅ |
| ADR-011 | Dashboard Architecture | No centralized DashboardRepository | ✅ |
| ADR-012 | Practice Engine | Strategy Pattern + shared learning tables | ✅ |
| ADR-013 | Learning Engine Extraction | `core/learning/` has zero feature imports | ✅ |
| ADR-014 | Story Engine | Imports only core, not features/review | ✅ |
| ADR-015 | Recommendation Engine | Thin orchestration, no new learning logic | ✅ |

---

## Test Coverage

| Category | Files | Tests |
|---|---|---|
| Core | 4 | ~30 |
| Dictionary | 6 | ~15 |
| Review | 12 | ~55 |
| Practice | 6 | ~25 |
| Stories | 5 | ~12 |
| Recommendation | 4 | ~10 |
| **Total** | **41** | **146** |

---

## Feature Slices Completed

| Slice | Feature | Status |
|---|---|---|
| Slice 1 | Dictionary & Search | ✅ Complete |
| Slice 2 | Review Engine (SM-2) | ✅ Complete |
| Slice 3 | Practice Engine | ✅ Complete |
| Slice 4 | Story Engine | ✅ Complete |
| Slice 5 | Recommendation Engine | ✅ Complete |
| Foundation Sprint | Core abstractions, tokens, navigation | ✅ Complete |
| Stabilization | Error fixes, lint, compliance | ✅ Complete |

---

## Known Technical Debt

1. **Practice → Review data coupling** — `ReviewCardModel` and `ReviewCardMapper` in practice data layer. Documented as acceptable; flows through `core/learning` shared entities.

2. **Performance not profiled** — No real-device benchmarks exist. Must measure before v1.0.0.

3. **No CI pipeline** — Architecture audit is manual. Should be automated in CI.

4. **No beta testing** — Real user feedback not yet gathered.

---

## Performance Baseline

| Metric | Target | Measured |
|---|---|---|
| Cold start | < 2s | — |
| Search latency | < 100ms | — |
| Recommendation generation | < 50ms | — |
| Review queue build | < 30ms | — |
| Story open | < 150ms | — |
| Dashboard load | < 200ms | — |
| Frame rate | 60fps | — |

---

## Next Milestones

| Milestone | Target | Status |
|---|---|---|
| Architecture audit script | v0.6.0 | ✅ Done |
| Performance profiling | v0.7.0 | Pending |
| Beta release | v0.9.0-beta | Pending |
| Beta feedback incorporated | v0.9.x | Pending |
| Production release | v1.0.0 | Pending |
