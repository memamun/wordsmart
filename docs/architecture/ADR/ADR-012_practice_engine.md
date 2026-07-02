# ADR-012: Practice Engine Architecture

## Status
Accepted

## Context
We need to support multiple vocabulary practice styles (Recall drills, Definition MCQs, Synonyms matching, Spelling exercises, and Sentence Fill-in-the-Blanks) while reusing our robust spaced repetition (SM-2) engine and learning analytics pipelines. We require an extensible strategy to generate and score different practice question formats dynamically.

## Decision
We enforce the following architectural rules for the Practice Engine:

1. **Polymorphic Question Generation (Strategy Pattern)**:
   - We define a generic `QuestionGenerator` interface that takes a targeted `Word` and a candidate pool of dictionary words to generate a structured `PracticeQuestion`.
   - Concrete implementations are isolated:
     - `DefinitionMCQGenerator` (word definition matching options)
     - `SynonymGenerator` (selecting synonyms)
     - `AntonymGenerator` (selecting antonyms)
     - `SpellingGenerator` (character matches / typing input)
     - `SentenceCompletionGenerator` (fill-in-the-blank examples)

2. **Unified Learning Spaced-Repetition Pipeline**:
   - To keep learning metrics consistent, practicing a word must rescheduled its next review timestamp.
   - Practicing does NOT write to a separate database table. When a user submits an answer, the Practice Engine invokes `LearningSignalAnalyzer` to map correct/incorrect responses and response durations into a `ReviewRating` (0-5), which is then processed by `SM2Engine` to update the word's progress.

3. **Practice Session Lifecycle**:
   - A `PracticeSession` aggregates questions and records stats (correct counters, session times).
   - Once completed, the session is logged to `study_sessions` and `learning_events` tables just like standard reviews, ensuring dynamic streak trackers and dashboards remain unified.

## Consequences
- Practice and Spaced Repetition reviews leverage the exact same mathematical engine and analytics tables, ensuring metric alignment.
- Adding new practice question formats (e.g. root matching, SAT analogies) requires writing only a new strategy implementation of `QuestionGenerator` without touching session handlers or repositories.
