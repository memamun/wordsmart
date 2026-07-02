# ADR-010: Learning Metrics and Analytics Calculations

## Context
WordSmart Vocabulary requires a premium, data-focused dashboard displaying learning metrics (streak, minutes studied, overall accuracy, mastered count). We must avoid storing derived statistics inside a persistent settings table, which leads to caching drift. All metrics must be computed dynamically via transactional SQLite histories.

## Decision
We enforce a strict **dynamic calculation strategy** for all learning metrics:
- **Study Minutes**: Aggregated dynamically by summing `duration` from `study_sessions` within the target date range.
- **Current Streak**: Calculated by scanning `study_sessions` sequentially backward from the current date. A day is counted in the streak if at least one study session was completed on that calendar day.
- **Accuracy**: Calculated as `correct_reviews / total_reviews` across all historic card reviews in a given period.
- **Mastery Count**: Count of active `words` where `mastery_score` $\ge$ 90 (or SM-2 consecutive repetition count $\ge$ 6).
- **Weak Words**: Dynamically resolved as words with low easiness factors ($EF < 1.6$) and high mistake rates (`incorrect_count / total_reviews`).

## Consequences
- **Zero Caching Drift**: Deleting, modifying, or sync-updating records recalculates metrics dynamically, guaranteeing 100% accuracy.
- **Rich Analytics**: Enables clean filtering by date ranges (e.g. today vs this week vs this month).
- **SQLite Performance**: Aggregation queries leverage composite indexes, keeping metrics loading times well under $100$ms.
