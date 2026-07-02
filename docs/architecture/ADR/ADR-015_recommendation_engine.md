# ADR-015: Recommendation Engine

## Status
Accepted

## Date
2026-07-02

## Context
WordSmart has 4 functional vertical slices (Dictionary, Review, Practice, Stories) with a shared learning engine, analytics layer, and design system. Users need guidance on what to do next rather than discovering features manually. The Recommendation Engine is not a new learning domain — it is an orchestration layer that consumes existing capabilities to surface the most valuable next action.

## Decision
Implement Recommendations as a thin orchestration feature that reads from existing data sources and ranks actions by priority.

### Architecture Principle
```
No feature imports another feature's repository directly.
All interactions flow through shared capabilities:
  core/learning → Use Cases → Repositories
  core/analytics → Event logging
```

### Domain Model
```text
Recommendation
├── id, type, title, subtitle, reason
├── actionLabel, actionRoute
├── priority (0 = highest)
├── metadata (Map<String, dynamic>)

RecommendationType (enum)
├── dueReview        — SM-2 cards due for review
├── continueStory    — Story with incomplete reading position
├── weakWord         — Word with low mastery score
├── practiceSession  — Suggested practice based on gaps
├── dailyGoal        — Daily study goal progress
```

### Scoring Engine (Pure Dart)
- `RecommendationScorer` — computes raw score per candidate
- `RecommendationRanker` — sorts by score, deduplicates, caps at N
- `RecommendationPolicy` — business rules (max per type, cooldown, daily cap)

### Data Sources (Existing)
| Type | Source | Query |
|------|--------|-------|
| dueReview | ReviewRepository | getDueCards() |
| continueStory | StoryRepository | getProgress() WHERE NOT completed |
| weakWord | ReviewRepository | getWeakWords(mastery < threshold) |
| practiceSession | PracticeRepository | derived from incorrect answers |
| dailyGoal | AnalyticsRepository | today's session count |

### Use Cases
- `GetRecommendationsUseCase` — returns ranked list
- `DismissRecommendationUseCase` — marks as dismissed
- `CompleteRecommendationUseCase` — marks as completed

### UI
- `RecommendationCard` — generic card with icon, title, subtitle, action button
- `RecommendationList` — vertical list on home screen
- Integrated into `HomePage` as a dedicated tab or home content

## Consequences
### Positive
- Zero new learning logic — pure orchestration
- Reuses existing repositories via `core/learning` and `core/analytics`
- No feature-to-feature imports
- Pure Dart scoring engine — fully testable
- Extensible: new recommendation types = new scorer + policy rule

### Negative
- Requires meaningful data in learning_events and progress tables to produce useful recommendations
- Cold start problem: new users get generic recommendations until data accumulates
