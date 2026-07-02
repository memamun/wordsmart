# ADR-004: 6-Tier Search Ranking Algorithm

## Context
A primary issue in vocabulary dictionaries is search accuracy. Users searching for a word expect the exact keyword to appear first, followed by prefix matches, and then broader definitions, derivatives, or synonyms. Simple `LIKE %query%` queries yield disordered results, breaking the premium UX flow.

## Decision
We enforce a **6-Tier Search Ranking Algorithm** inside the SQLite local datasource:
1. **Exact Match**: Case-insensitive exact match on spelling first.
2. **Prefix Match**: Matches beginning with the query (excluding exact matches).
3. **Substring Match**: Matches containing the query within the headword.
4. **Derivative Match**: Words whose derivatives match the query.
5. **Synonym Match**: Words whose synonyms match the query.
6. **Definition Match**: Words whose English definitions contain the query.

Results are gathered sequentially into an ordered mapping to preserve uniqueness and ranking priority.

## Consequences
- **High Intent Fulfillment**: Users find exactly what they search for immediately at the top of the feed.
- **Fast Execution**: Sequential indexed queries resolve within milliseconds on SQLite, eliminating the need for heavy full-text search indexes like FTS5 for basic operations.
