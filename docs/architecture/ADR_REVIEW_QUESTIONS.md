# ADR Review Questions

Every ADR must have a verifiable review question.
Use these during code review to catch architecture violations.

---

## ADR-001: Feature-First Architecture

**Review question:** Does any feature-specific class exist outside its `features/<name>/` directory?

If yes → ❌ **Reject.**

---

## ADR-002: SQLite Offline-First

**Review question:** Does any dictionary data source make an HTTP/network call?

If yes → ❌ **Reject.**

---

## ADR-003: Riverpod State Management

**Review question:** Does any widget call a repository or use case directly (bypassing a provider)?

If yes → ❌ **Architecture violation.**

---

## ADR-004: Search Ranking

**Review question:** Is the search result ordering hardcoded or does it follow the 6-tier priority?

If hardcoded → ❌ **Reject.**

---

## ADR-005: SM-2 Spaced Repetition

**Review question:** Is there any second implementation of SM-2 outside `core/learning/engine/`?

If yes → ❌ **Reject.**

---

## ADR-006: Database Versioning

**Review question:** Does any migration script drop columns directly (instead of temp-table copy)?

If yes → ❌ **Reject.**

---

## ADR-007: Design System

**Review question:** Are new buttons, cards, or inputs created outside `core/design_system/`?

If yes → ❌ **Reject.** Build on existing primitives.

---

## ADR-008: Dependency Injection

**Review question:** Is there a use case or repository class that is NOT registered in `injection.dart`?

If yes → ❌ **Reject.**

---

## ADR-009: Review Queue

**Review question:** Does the queue builder skip overdue cards or include them out of order?

If yes → ❌ **Reject.**

---

## ADR-010: Learning Metrics

**Review question:** Are any dashboard metrics pre-cached or persisted (instead of computed from history)?

If yes → ❌ **Reject.**

---

## ADR-011: Dashboard Architecture

**Review question:** Does a `DashboardRepository` or `DashboardEntity` class exist?

If yes → ❌ **Reject.** Dashboard composes from multiple use cases.

---

## ADR-012: Practice Engine

**Review question:** Does the practice engine use a separate database from the review engine?

If yes → ❌ **Reject.** Both share the same progress tables.

---

## ADR-013: Learning Engine Extraction

**Review question:** Does `core/learning/` import anything from `features/*`?

If yes → ❌ **Reject.**

---

## ADR-014: Story Engine

**Review question:** Does `features/stories/` import from `features/review/`?

If yes → ❌ **Reject.**

---

## ADR-015: Recommendation Engine

**Review question:** Does `features/recommendation/` contain any SM-2 or scoring logic?

If yes → ❌ **Reject.** Scoring stays in domain services; recommendation is orchestration only.

---

## Quick Reference

| ADR | Question | One-Line Rule |
|---|---|---|
| 001 | Feature classes outside features/? | Code stays in its feature directory |
| 002 | HTTP calls in dictionary? | Dictionary is offline-only |
| 003 | Widget calls repository directly? | All state through Riverpod |
| 004 | Search ordering hardcoded? | 6-tier priority ranking |
| 005 | Second SM-2 implementation? | Single SM-2 in core/learning |
| 006 | Column drops in migrations? | Temp-table copy strategy |
| 007 | New widgets outside design system? | Build on existing primitives |
| 008 | Unregistered use cases? | Everything in injection.dart |
| 009 | Queue skips overdue cards? | Overdue cards first |
| 010 | Pre-cached metrics? | Compute from history |
| 011 | DashboardRepository exists? | Compose from use cases |
| 012 | Separate practice DB? | Share review tables |
| 013 | core/learning imports features? | Zero feature imports |
| 014 | stories imports review? | Only import core |
| 015 | Recommendation has SM-2 logic? | Orchestration only |
