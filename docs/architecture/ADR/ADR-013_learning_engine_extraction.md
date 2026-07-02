# ADR-013: Learning Engine Extraction

## Status
Accepted

## Date
2026-07-02

## Context
The learning domain classes (SM2Engine, LearningSignalAnalyzer, ReviewCard, ReviewResult, shared value objects) were tightly coupled to the `features/review/` feature. This created dependency issues when the `features/practice/` feature needed to reuse the same learning logic, violating DRY and making the codebase harder to maintain.

## Decision
Extract shared learning domain classes from `features/review/domain/` into `core/learning/`:

### What moves to `core/learning/`
| Current Location | New Location | Rename? |
|---|---|---|
| `features/review/domain/services/sm2_engine.dart` | `core/learning/engine/sm2_engine.dart` | No |
| `features/review/domain/services/learning_signal_analyzer.dart` | `core/learning/engine/learning_signal_analyzer.dart` | No |
| `features/review/domain/entities/review_card.dart` | `core/learning/entities/learning_card.dart` | Yes → `LearningCard` |
| `features/review/domain/entities/review_result.dart` | `core/learning/entities/learning_result.dart` | Yes → `LearningResult` |
| `features/review/domain/entities/value_objects.dart` (shared enums) | `core/learning/entities/learning_value_objects.dart` | File split |

### What stays in `features/review/`
- `review_queue.dart`, `review_queue_builder.dart` — Review-specific queue logic
- `review_session.dart`, `study_session.dart` — Review-specific session model
- `review_scheduler.dart` — Review-specific scheduling
- `queue_policy.dart`, `daily_goal.dart` — Review-specific policies
- `learning_metrics.dart` — Review dashboard-specific
- All `presentation/`, `data/` — Review UI and data adapters

### Backward compatibility
- `features/review/domain/entities/review_card.dart` now exports `typedef ReviewCard = LearningCard;`
- `features/review/domain/entities/review_result.dart` now exports `typedef ReviewResult = LearningResult;`
- Old import paths continue to work via re-exports

## Consequences
### Positive
- `core/learning/` has NO dependency on `features/*` — clean dependency direction
- Both `features/review/` and `features/practice/` can import from `core/learning/`
- Shared learning logic is centralized and tested once
- Breaking change is limited to internal import paths (no public API or database schema changes)

### Negative
- Temporary import path churn for consumer files
- `LearningCard` includes `ReviewPriority` and `ReviewMode` enums (originally review-specific) because they're used as card fields
