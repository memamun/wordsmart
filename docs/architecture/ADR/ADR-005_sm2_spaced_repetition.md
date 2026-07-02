# ADR-005: SM-2 Spaced Repetition Algorithm

## Context
WordSmart Vocabulary targets long-term memory retention over simple gamified daily streaks. Spaced repetition scheduling is the core retrieval engine. We need a mathematical model to schedule card reviews based on user recollection and response latency.

## Decision
We adopt the **SuperMemo-2 (SM-2) algorithm** as our spacing engine:
- Every word progress record stores:
  - `interval`: Interval in days until next review.
  - `repetition_count`: Consecutive correct reviews.
  - `easiness_factor` (EF): Easiness of the word (starts at 2.5).
- Upon a review, the user scores the word from 0 (forgot) to 5 (perfect recall).
- Spacing values are recalculated:
  - If score $\ge$ 3 (correct):
    - Repetition 1: Interval = 1 day.
    - Repetition 2: Interval = 6 days.
    - Repetition $N$: Interval = Previous Interval $\times$ EF.
  - If score $<$ 3 (incorrect):
    - Repetition count is reset to 0, Interval is set to 1 day.
  - EF is updated: $EF' = EF + (0.1 - (5 - score) \times (0.08 + (5 - score) \times 0.02))$. Min EF = 1.3.

## Consequences
- **Memory Optimization**: Words are scheduled dynamically based on subjective difficulty, preventing over-reviewing of easy words and under-reviewing of weak words.
- **Data-Driven Scheduling**: Enables accurate computation of "Reviews Due" count for the Home screen.
