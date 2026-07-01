# Screen Specification: 08_progress

## 🎯 Purpose
A learning statistics dashboard providing insights into word mastery, review schedules, and learning streak consistency.

## 🏆 User Goal
Monitor study streak, view total mastered vocabulary counts, check queued reviews, and analyze breakdown metrics.

## 🧭 Entry / Exit
*   **Entry:** Tapping "Progress" tab on bottom navigation bar.
*   **Exit:** 
    *   Tapping "Start Spaced Session" $\rightarrow$ Launches Flashcard study (04_flashcards).
    *   Tapping other BottomNavBar tabs.

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Streak panel, queued reviews CTA.
*   **Tier 2 (Secondary Context):** Mastered and Learning counts stats grid.
*   **Tier 3 (Supporting Actions):** Mastery breakdown bar charts, reset study stats option.

## 📐 Layout Structure
The dashboard is structured to give an immediate high-level summary of the user's momentum followed by detailed metrics. Side margins are `24dp`.
```
+---------------------------------------------------+
|  [Progress]                                       | <- Screen Header (Outfit Bold, 28sp)
+---------------------------------------------------+
|  +---------------------------------------------+  |
|  |  12 DAYS STREAK              [ 🔥 Fire icon]|  | <- Streak Panel
|  |  Active study streak since June 15          |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  LEARNING METRICS                                 | <- Section Header
|  +---------------------+ +---------------------+  |
|  | 352 Words Mastered  | | 82 Words Learning   |  | <- Stats cards side-by-side
|  | (100% Retained)     | | (Spaced rep queue)  |  |
|  +---------------------+ +---------------------+  |
+---------------------------------------------------+
|  REVIEWS QUEUED                                   | <- Section Header
|  +---------------------------------------------+  |
|  |  15 Words due for review.                   |  |
|  |  [ Start Spaced Session ]                   |  | <- Study action button
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  MASTERY BREAKDOWN                                | <- Section Header
|  Mastered:   ████████████████████████ 352         | <- Horizontal bar charts (Teal)
|  Learning:   ██████ 82                             |
|  Unlearned:  ████████████ 191                     |
+---------------------------------------------------+
```

## 🧩 Components
1.  **Streak Panel:** Displays current study streak count and fire icon.
2.  **Learning Metrics Grid:** Side-by-side cards showing Mastered and Learning counts.
3.  **Queued Reviews Card:** Prominent review call-to-action block.
4.  **Mastery Breakdown Bars:** Horizontal visual progress bars.

## 🔄 Lifecycle States
*   **Initial:** Skeletons pulse while loading data from local SQLite progress table.
*   **Loaded:** Displays live user data.
*   **Dialog Open:** Screen dims under active reset learning data dialog.
*   **Empty:** If history is empty, shows: *"Start studying to track progress!"*

## 🖐️ Interactions
*   **Tap Start Spaced Session:** Launches Flashcards review deck instantly.
*   **Reset History Click:** Opens warning confirmation dialog (requires multiple verification taps).

## 🎬 Animations
*   **Bar Chart Fill:** Progress bars animate their width from `0%` to target percentage on page entry over `250ms`.
*   **Fire Glow:** Fire icon has a subtle, slow pulsation.

## 📐 Responsive Behavior
*   **Phone (<600dp):** Vertical stack, metrics grid displays two-column side-by-side.
*   **Tablet & Desktop (>600dp):** Layout shifts into a multi-column dashboard: Left side displays progress charts; Right side displays study actions, streak details, and settings.

## ♿ Accessibility
*   Colors represent status but are paired with clear numeric values for color-blind users.
*   Screen reader reads out: *"Study streak: 12 days. Mastered: 352 words. Learning: 82 words."*

## 🛠️ Flutter Notes
*   Implement the horizontal charts using standard `Container` widgets wrapped in an `AnimatedContainer` to trigger width changes.
*   Perform direct SQL counts (`SELECT COUNT(*) FROM word_progress WHERE status = ?`) on databases via the local DataSource.

## ✅ Success Criteria
A successful Progress screen should allow users to:
*   Identify their active streak count instantly upon landing.
*   Review overdue study items count above the fold.
*   Launch reviews session with **1 tap** on the action block.
*   View progress bar accuracy breakdown animations load in **< 300ms**.
