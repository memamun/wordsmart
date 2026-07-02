# Slice 5: Recommendation Engine — Kickoff

## Goal
Guide users toward the most valuable next action by orchestrating existing capabilities. The Recommendation Engine consumes — not replaces — the learning engine.

## Scope
### In Scope
- `Recommendation` entity with type, priority, reason, action metadata
- `RecommendationScorer`, `RecommendationRanker`, `RecommendationPolicy` (pure Dart)
- `GetRecommendationsUseCase`, `DismissRecommendationUseCase`, `CompleteRecommendationUseCase`
- `RecommendationCard` and `RecommendationList` UI components
- Integration into `HomePage`

### Out of Scope
- Machine learning / collaborative filtering
- External recommendation APIs
- User preference learning
- Notification-based recommendations

## Architecture
```text
features/recommendation/
├── domain/
│   ├── entities/       Recommendation, RecommendationType
│   ├── services/       RecommendationScorer, RecommendationRanker, RecommendationPolicy
│   ├── repositories/   RecommendationRepository (abstract)
│   └── usecases/       GetRecommendations, DismissRecommendation, CompleteRecommendation
├── data/
│   ├── datasources/    RecommendationLocalDataSource (reads from existing repos)
│   └── repositories/   RecommendationRepositoryImpl
└── presentation/
    ├── providers/      RecommendationNotifier
    ├── screens/        (integrated into HomePage)
    └── widgets/        RecommendationCard, RecommendationList
```

## Recommendation Types & Scoring
| Type | Signal | Score Weight |
|------|--------|--------------|
| dueReview | Cards overdue by N days | 10 + N*2 |
| continueStory | Story % complete < 100 | 8 + percent*0.05 |
| weakWord | Mastery score < 40 | 7 + (40 - mastery) |
| practiceSession | Incorrect answers in last 7 days | 5 + count*1.5 |
| dailyGoal | Sessions today < daily target | 6 + (target - sessions)*3 |

## Dependencies
- `core/learning/` — LearningCard, LearningState, MasteryScore
- `core/analytics/` — LearningEventLogger, LearningEvent
- `core/database/` — AppDatabase
- `features/review/` — ReviewRepository (via core/learning abstraction)
- `features/stories/` — StoryRepository
- Does NOT import feature repositories directly — reads via use cases

## Verification
- Scoring engine: pure Dart, 100% unit tested
- Policy rules: property tests for cooldown, daily cap, type limits
- Widget tests: RecommendationCard rendering
- Integration: recommendations appear on HomePage
