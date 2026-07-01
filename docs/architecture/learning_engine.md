# WordSmart Learning Engine Architecture Specification

Version: 1.0  
Category: Learning & Recommendation Architecture

WordSmart transitions from a traditional dictionary lookup tool into a personalized, learning-centric vocabulary platform. This document defines the components, schemas, and algorithms of the three primary engine blocks: the **Learning Engine**, **Recommendation Engine**, and **Progress Engine**.

---

## 🏛️ 1. Conceptual Architecture Diagram

```text
                                    User
                                      │
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                      User Preferences     Learning Profile
                            │                   │
                            └─────────┬─────────┘
                                      │
                               Recommendation Engine
                                      │
              ┌────────┬────────┬─────┴──┬────────┐
              │        │        │        │        │
            Search   Review   Stories   Quiz   Daily Goal
              │        │        │        │        │
              └────────┴────────┴─────┬──┴────────┘
                                      │
                               Progress Engine
                                      │
                                word_progress
                                      │
                           SQLite Knowledge Graph
```

---

## ⚙️ 2. Core Engines

### A. Progress Engine & Learning Signals
Unlike traditional systems that use binary (Correct/Incorrect) progress tracking, WordSmart measures the **strength of memory retrieval** using multi-dimensional interaction signals.

#### 1. The Learning Signal Matrix
Memory retrieval strength is computed dynamically when a user answers questions inside Quizzes, Flashcards, or Drills:

| Correctness | Retrieval Speed | Hint Used | Memory Strength Score | Progress Adjustment |
| :--- | :--- | :--- | :--- | :--- |
| **Correct** | Fast ($< 3\text{s}$) | No | **Strong (5/5)** | Mastery $+25$ points; Interval multiplier $1.8\times$ |
| **Correct** | Moderate ($3\text{–}10\text{s}$) | No | **Medium-Strong (4/5)** | Mastery $+15$ points; Interval multiplier $1.4\times$ |
| **Correct** | Slow ($> 10\text{s}$) | Yes | **Weak-Correct (3/5)** | Mastery $+5$ points; Interval multiplier stays $1.0\times$ |
| **Incorrect** | Any speed | Yes/No | **Failed (0/5)** | Mastery $-20$ points; Interval reset to $1$ day |

#### 2. Weakness Diagnosis & Logging
If a user fails a question or takes too long, the system classifies the exact failure point under a specific **weakness reason** inside the `weak_words` repository:
*   `SPELLING`: Failed spelling drill or typing challenge.
*   `MEANING`: Selected incorrect definition in MCQ/flashcard.
*   `SYNONYM`: Confused word with its synonym options.
*   `PRONUNCIATION`: Failed oral/aural matches.
*   `ROOT`: Failed root etymology association.

---

### B. Recommendation Engine
The Home screen is populated dynamically by an algorithmic recommendation layer that scores and ranks what content to show next based on the user's current learning profile:

#### 1. Content Scoring Algorithm
At Home screen launch, candidate activities are scored using the following weight matrix:

$$\text{Activity Score} = (\text{Urgency Factor} \times W_u) + (\text{Weakness Weight} \times W_w) - (\text{Time Penalty} \times W_t)$$

*   **Urgency Factor:** Calculated based on review delay (due reviews have highest priority).
*   **Weakness Weight:** Words flagged with active `weak_words` scores.
*   **Time Penalty:** Deducts score if the user recently completed the exact same activity.

#### 2. Home Page Recommendations Block Hierarchy
1.  **Review Due Card:** If due reviews exist.
2.  **Weak Word Alert Card:** If user frequently confuses specific words (e.g. *ABATE* vs *ABASH*), recommend a dedicated mini-drill focusing on these items.
3.  **Continue Yesterday's Story:** If a story was left half-read.
4.  **Recommended Root:** Displays a root (e.g., `AB`) and prompts exploration of its family tree.
5.  **Daily Challenge:** A 1-minute `quick_quiz` matchup challenge.

---

### C. Study Session Engine
Logs daily streaks, cumulative study durations, and aggregates progress statistics locally on the device.
*   **Streak Mechanics:** A streak counter increments if the user completes their configured `daily_goals` threshold (e.g. `20 words read` or `15 review questions completed`).
*   **Time Tracking:** Aggregates sessions to show daily learning metrics: *"Today: 18 minutes • 24 words learned • 92% accuracy"*.

---

## 🗂️ 3. Extended Database Schema

To support these cognitive tracking capabilities, the SQLite database is extended with the following tables:

### 1. `study_sessions` (Aggregate Session Logging)
```sql
CREATE TABLE study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    mode TEXT NOT NULL,                  -- 'flashcards', 'quiz', 'story_reader', 'mock_exam'
    words_encountered_count INTEGER DEFAULT 0,
    correct_answers_count INTEGER DEFAULT 0,
    score_percentage REAL,
    duration_seconds INTEGER DEFAULT 0
);
```

### 2. `search_history` (Contextual Analytics)
```sql
CREATE TABLE search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_text TEXT NOT NULL,
    word_id_opened INTEGER REFERENCES words(id) ON DELETE SET NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_duration_seconds INTEGER DEFAULT 0  -- Time spent reading word details
);
```

### 3. `story_progress` (Word-level Reading Tracker)
```sql
CREATE TABLE story_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER REFERENCES contextual_stories(quiz_id) ON DELETE CASCADE,
    last_paragraph_read INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. `quiz_attempts` (Detailed Testing Logs)
```sql
CREATE TABLE quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,                     -- Reference to mcq_quizzes, quick_quizzes, or advanced_quizzes
    quiz_type TEXT NOT NULL,             -- 'mcq', 'quick', 'advanced', 'mock_exam'
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. `activity_log` (Unified Learning Stream)
```sql
CREATE TABLE activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL,         -- 'word_read', 'drill_completed', 'story_finished'
    reference_id INTEGER NOT NULL,       -- Matches word_id, story_id, or quiz_id
    points_earned INTEGER DEFAULT 0,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. `weak_words` (Diagnostic Database)
```sql
CREATE TABLE weak_words (
    word_id INTEGER PRIMARY KEY REFERENCES words(id) ON DELETE CASCADE,
    weakness_reason TEXT NOT NULL,       -- 'SPELLING', 'MEANING', 'SYNONYM', 'PRONUNCIATION', 'ROOT'
    error_count INTEGER DEFAULT 0,
    last_error_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. `daily_goals` (Streak Master)
```sql
CREATE TABLE daily_goals (
    goal_date DATE PRIMARY KEY,
    target_xp INTEGER DEFAULT 100,       -- XP score threshold
    earned_xp INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT 0
);
```

### 8. `achievements` (Gamification Engine)
```sql
CREATE TABLE achievements (
    id TEXT PRIMARY KEY,                 -- e.g. 'streak_10_days', 'vocabulary_master_100'
    title TEXT NOT NULL,
    unlocked_at TIMESTAMP
);
```

### 9. `bookmarks` (Reason Tagging Extension)
```sql
-- Updated Schema representing reason metadata
CREATE TABLE bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    word_id INTEGER NOT NULL,
    reason TEXT DEFAULT 'Review Later',  -- 'Favorite', 'Review Later', 'Exam Focus', 'Interesting Etymology'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word_id),
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);
```
