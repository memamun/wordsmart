# ADR-014: Story Engine

## Status
Accepted

## Date
2026-07-02

## Context
Stories provide contextual vocabulary exposure through narrative reading. Unlike Review (spaced repetition drills) and Practice (quiz-based testing), Stories deliver a different learning mode: passive vocabulary acquisition through reading comprehension. The Story feature must integrate with the existing learning pipeline without introducing dependency cycles.

## Decision
Implement Stories as a learning-driven feature using SQLite-first persistence, following the same architectural pattern as Dictionary, Review, and Practice.

### Data Source
- `contextual_stories` table (pre-existing in bundled DB) provides story content
- `story_progress` table (runtime migration) tracks reading position
- `SQLiteStoryLocalDataSource` ensures schema exists on first access

### Domain Model
```text
Story
├── id, title, wordsCovered
├── paragraphs: List<StoryParagraph>
└── highlightedWords: List<HighlightedWord>

StoryParagraph
├── index, englishText, bengaliText

HighlightedWord
├── word, definition, bengaliMeaning
```

### Reading Engine (Pure Dart)
- `ReadingPositionTracker` — advances paragraph index
- `StoryCompletionPolicy` — detects story completion
- `VocabularyExposureAnalyzer` — detects highlighted words per paragraph
- `ReadingStatisticsCalculator` — computes completion %, duration, words encountered

### Learning Integration
- `RecordWordExposureUseCase` logs `story_exposure` events via `LearningEventLogger`
- Story feature imports only `core/learning`, `core/analytics`, `core/database`
- Story feature does NOT import `features/review/`

### UI
- StoryReaderPage renders paragraphs from SQLite
- Highlighted words are tappable (amber underline)
- Tap opens inline bottom sheet with definition, Bengali meaning, continue button
- No navigation to WordDetailsPage by default (preserves reading flow)

## Consequences
### Positive
- Follows established SQLite-first pattern from Slices 1-3
- Reading engine is pure Dart — fully testable without Flutter
- Inline bottom sheet preserves reading flow
- `LearningEventLogger` creates data path for future Recommendation Engine
- `Clock` abstraction enables deterministic testing

### Negative
- `contextual_stories` schema uses `quiz_id`/`quiz_title` naming (legacy)
- Paragraph splitting uses double-newline heuristic (no explicit paragraph IDs in DB)
- Bengali story text contains inline `**highlight**` markers that need cleanup for display
