# ADR-011: Dashboard Architecture

## Status
Accepted

## Context
As the codebase evolves with the implementation of multiple vertical slices (Slice 2: Review Engine, Slice 3: Quiz, Slice 4: Stories, Slice 5: Personalization), we require a structured dashboard and screen boundary division. The home screen and the progress dashboard often have overlapping data (e.g. today's goals, daily queue counts), leading to code duplication and lack of responsibility division.

## Decision
We enforce the following architectural rules for the Home Screen and the Progress Dashboard:

1. **Home Screen vs. Progress Dashboard Divisions**:
   - **Home Screen**: Serves as the actionable launchpad ("What should I do next?"). It contains entry points like search, review session starters, daily challenges, and story reading.
   - **Progress Dashboard**: Serves as the statistical reflection ("How am I progressing?"). It contains streak statistics, overall accuracy, minutes studied, milestones completed, and activity timelines.

2. **No DashboardRepository Rule**:
   - We strictly avoid creating a centralized `DashboardRepository` or `DashboardEntity`. The dashboard is purely a presentation concern, not a standalone business object.
   - The dashboard composes data by orchestrating multiple domain use cases (`GetProgressSummary`, `GetLearningMetrics`, `GetDailyQueue`, `GetRecommendations`) at the Riverpod presentation layer.

3. **Dashboard Composition and Abstractions**:
   - Widgets are flatly composed to prevent layout calculations nested inside other layout structures.
   - Recommendation widgets are modeled as modular cards to allow expanding into story recommendations, root study challenges, or weak word reviews without refactoring the UI container.

## Consequences
- Prevents code duplication between the Home Screen and Dashboard screens.
- Keeps data layers clean and modular by avoiding composite database entities.
- Simplifies testing since each use case can be tested individually.
