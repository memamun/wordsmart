# Slice 2 Architecture Kickoff - Spaced Repetition Review Engine

## 1. Slice Goal
Implement the core Spaced Repetition learning system. This includes the SM-2 spacing calculations, automated daily review queue builder, flashcard session UI, and progress dashboard metrics tracking.

## 2. Feature Boundary
- **Input**: User review scores (0 to 5) and duration.
- **Processing**: Pure Dart SM-2 algorithm calculations, review scheduler, queue builder, and local SQLite progress updates.
- **Output**: Recalculated spacing EF/interval values, log entries, and dynamically updated progress dashboard metrics.
- **Out of Scope for Slice 2**: Home Screen Feed, recommendation algorithms, bilingual stories library, and custom vocabulary drills.

## 3. Domain Model

### Core Review Domain (Step 1A)
-   `ReviewCard`: Aggregate entity holding a `Word` object paired with its corresponding `WordProgress` statistics.
-   `ReviewQueue`: Aggregate entity holding metadata of the daily study deck (estimated duration, due count, new count, list of cards).
-   `ReviewSession`: Represents the active session status (current card index, elapsed time, scores, completed status).

### Progress Domain (Step 1B)
-   `StudySession`: Represents log records for completed sessions (start time, end time, duration, score, mode).
-   `LearningMetrics`: Calculated analytics (streak, overall accuracy, minutes studied, mastered count).

## 4. Feature Folder Structure
```text
features/
└── review/
    ├── data/
    │   ├── datasources/
    │   ├── models/
    │   └── repositories/
    ├── domain/
    │   ├── entities/
    │   ├── repositories/
    │   ├── services/
    │   │   ├── sm2_engine.dart
    │   │   ├── review_scheduler.dart
    │   │   └── review_queue_builder.dart
    │   └── usecases/
    └── presentation/
        ├── providers/
        ├── screens/
        └── widgets/
```

## 5. Pure Domain Services
-   `SM2Engine`: Pure Dart spacing calculator updating intervals and easiness factors.
-   `ReviewScheduler`: Pure Dart service resolving overdue ratios, decaying states, and interval boundaries.
-   `ReviewQueueBuilder`: Pure Dart queue manager assembling the daily study deck.

## 6. Repositories
-   `ReviewRepository` abstract interface under `lib/features/review/domain/repositories/`:
    ```dart
    abstract class ReviewRepository {
      Future<Either<Failure, ReviewQueue>> getDailyQueue(int limit);
      Future<Either<Failure, void>> saveReviewResult(int wordId, int score, int durationMs);
      Future<Either<Failure, List<StudySession>>> getStudySessions();
      Future<Either<Failure, LearningMetrics>> getLearningMetrics();
    }
    ```

## 7. Use Cases
-   `GetDailyQueueUseCase`: Requests the daily review queue from the Repository.
-   `SubmitCardReviewUseCase`: Submits the card review score (0 to 5), invoking the SM-2 calculations and logging progress.
-   `GetLearningMetricsUseCase`: Pulls learning analytics for the dashboard.

## 8. Providers
-   `ReviewQueueNotifier`: Manages the active queue loading state.
-   `ReviewSessionNotifier`: Tracks the current index, card state (face vs back), and timing of the review deck.
-   `ProgressNotifier` (built in Step 8): Hydrates the dashboard analytics.

## 9. UI Screens
-   `ReviewSessionPage`: Displays flashcard with tap-to-flip motion, rating selectors (0-5), and summary completion card.
-   `ProgressDashboardPage`: Displays study minutes, streak milestones, and mastered count tiers.

## 10. Definition of Done (DoD)
-   **Domain**: `ReviewQueue`, `SM-2`, and `Scheduler` must be 100% deterministic (unit & property tested).
-   **Data**: SQLite schema migrations must pass validation scripts, repository operations must run correctly.
-   **UI**: Swipe/tap transitions work, audio plays on card show, and summaries display correctly.
-   **Performance**: Queue generation $<20$ms, review saving $<50$ms, session completing $<100$ms.
-   **Testing**: Unit tests for SM-2 spacing logic, queue builders, use cases, and provider states. E2E integration test verification.
