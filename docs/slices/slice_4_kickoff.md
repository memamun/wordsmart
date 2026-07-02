# Slice 4: Stories — Kickoff

## Goal
Deliver contextual vocabulary exposure through narrative reading. Unlike Review (spaced repetition drills) and Practice (quiz-based testing), Stories provide passive vocabulary acquisition through reading comprehension.

## Scope
### In Scope
- `contextual_stories` table (existing in bundled DB) provides story content
- `story_progress` table (runtime migration) tracks reading position
- Reading engine: position tracking, completion detection, vocabulary exposure, statistics
- Story reader UI with inline word definitions
- Learning event integration via `LearningEventLogger`

### Out of Scope (Future Slices)
- User-authored stories
- Story quiz mode (comprehension questions)
- Word-of-the-day feed
- Recommendation Engine
- Gamification (badges, XP, streaks)

## Architecture
```text
features/stories/
├── domain/
│   ├── entities/       Story, StoryParagraph, HighlightedWord, ReadingPosition, StoryProgress, ReadingSession, ReadingStatistics
│   ├── services/       ReadingPositionTracker, StoryCompletionPolicy, VocabularyExposureAnalyzer, ReadingStatisticsCalculator
│   ├── repositories/   StoryRepository (abstract)
│   └── usecases/       GetStory, GetStories, ContinueStory, SaveReadingPosition, RecordWordExposure
├── data/
│   ├── models/         StoryModel
│   ├── queries/        StoryQueries, StoryProgressQueries
│   ├── datasources/    StoryLocalDataSource (abstract), SQLiteStoryLocalDataSource
│   └── repositories/   StoryRepositoryImpl
└── presentation/
    ├── providers/      StoryReaderNotifier
    ├── screens/        StoryReaderPage
    └── widgets/        ReadingProgressBar, WordContextSheet, StoryParagraphBlock
```

## Data Flow
```text
User opens story → GetStory(1) → SQLiteStoryLocalDataSource → StoryModel.fromMap() → toEntity()
User taps Continue → SaveReadingPosition → SQLiteStoryLocalDataSource INSERT OR REPLACE
User taps highlighted word → WordContextSheet (inline bottom sheet)
```

## Dependencies
- `core/learning/` — LearningCard, ReviewMode, ReviewPriority
- `core/analytics/` — LearningEventLogger, LearningEvent
- `core/database/` — AppDatabase singleton
- `core/navigation/` — AppNavigator.pushStoryReader
- Does NOT import `features/review/` — clean dependency direction

## Verification
- Reading engine services are pure Dart (100% unit tested)
- StoryModel parsing tested against real bundled DB schema
- StoryReaderNotifier tested with mock repository
- Widget tests for StoryParagraphBlock markdown rendering

## Risks
- `contextual_stories` uses `quiz_id` as PK (legacy naming)
- `story_progress` created at runtime via `_ensureSchema` (no pre-migration)
- Bengali story text may contain inline `**highlight**` markers needing cleanup
