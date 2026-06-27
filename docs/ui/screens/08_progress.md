# Screen Specification: 08_progress

## 🎯 Purpose
A learning statistics dashboard providing insights into word mastery, review schedules, and learning streak consistency.

## 🏆 User Goal
Monitor study streak, view total mastered vocabulary counts, check queued reviews, and analyze breakdown metrics.

## 🧭 Entry & Exit Points
*   **Entry:** Tapping "Progress" tab on bottom navigation bar.
*   **Exit:** 
    *   Tapping "Start Spaced Session" $\rightarrow$ Launches Flashcard study (04_flashcards).
    *   Tapping other BottomNavBar tabs.

## 🧩 Components
1.  **Streak Panel:** Displays current study streak count and fire icon.
2.  **Learning Metrics Grid:** Side-by-side cards showing Mastered and Learning counts.
3.  **Queued Reviews Card:** Prominent review call-to-action block.
4.  **Mastery Breakdown Bars:** Horizontal visual progress bars.

## 🔄 Lifecycle States
*   **Initial:** Skeletons pulse while loading data from local SQLite progress table.
*   **Loaded:** Displays live user data.
*   **Dialog Open:** Screen dims under active reset learning data dialog.

## 🖐️ Interactions & Gestures
*   **Tap Start Spaced Session:** Launches Flashcards review deck instantly.
*   **Swipe:** Not allowed.

## 🎬 Animations
*   **Bar Chart Fill:** Progress bars animate their width from `0%` to target percentage on page entry over `250ms`.
*   **Fire Glow:** Fire icon has a subtle, slow pulsation.

## ♿ Accessibility
*   Colors represent status but are paired with clear numeric values for color-blind users.
*   Screen reader reads out: *"Study streak: 12 days. Mastered: 352 words. Learning: 82 words."*

## 🛠️ Flutter Implementation Notes
*   Implement the horizontal charts using standard `Container` widgets wrapped in an `AnimatedContainer` to trigger width changes.
*   Perform direct SQL counts (`SELECT COUNT(*) FROM word_progress WHERE status = ?`) on databases via the local DataSource.
