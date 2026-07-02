# ADR-009: Review Queue Generation and Prioritization Strategy

## Context
Spaced repetition depends on studying the right cards at the right time. Mixing too many new words or reviewing cards out of their due order leads to mental fatigue. We need a deterministic strategy to construct the daily study queue, balancing due cards, new cards, and user daily caps.

## Decision
We implement a dedicated **Review Queue Builder** service in the domain layer that builds the daily deck using these strict rules:
1. **Due Prioritization**: Words with `next_review_at` $\le$ `now` are prioritized. These are words scheduled for review by the SM-2 algorithm.
2. **New Word Insertion**: If the due cards count is below the daily limit, we fill the remaining slots with `NEW` vocabulary words up to the user's preferred limit.
3. **Queue Ordering**: The queue is ordered by:
   - Overdue ratio: `(now - next_review_at) / interval` descending (critical reviews first).
   - Difficulty: Higher easiness factor (EF) first, to warm up the session before hard words.
4. **Daily Limits**: The total cards in the queue cannot exceed the user's configured `daily_goal` preference (e.g. default 20 cards per day).

## Consequences
- **High Retention**: Prioritizing overdue reviews prevents memory decay.
- **Consistent Study Load**: Daily limits prevent cognitive overload (the "spaced repetition wall" where reviews accumulate uncontrollably).
- **Decoupled Logic**: Moving this selection logic into a domain `QueueBuilder` service keeps the `ReviewRepository` focused purely on data I/O.
