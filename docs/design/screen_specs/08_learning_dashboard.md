# Screen Specification: 08_learning_dashboard

## 🎯 Purpose
Serve as the user's personal learning hub and dashboard. Designed around an editorial, calm, and learning-focused philosophy rather than complex productivity analytics, the screen immediately answers the core question: *"What should I study next?"*

## 🏆 User Goal
Evaluate current vocabulary progress, review streaks and daily activity, check achievements and upcoming review forecast loads, and instantly resume learning.

## 🧭 Entry / Exit
*   **Entry:** Tapping the "Profile" tab (Tab 4) on the bottom navigation bar.
*   **Exit:**
    *   Tapping "Continue Learning" or "Start Review" launches a Spaced Review Session ([04_review_session](file:///home/mamun/wordsmart/docs/ui/screen_specs/04_review_session.md)) using due words.
    *   Tapping any recent milestone story launches the Story Reader ([06_story_reader](file:///home/mamun/wordsmart/docs/ui/screen_specs/06_story_reader.md)).
    *   Tapping other BottomNavBar tabs.

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Today's Progress Hero Card (streak, reviews due count, Continue Learning CTA button), Ready to Review section.
*   **Tier 2 (Secondary Context):** Summary statistics grid cards, weekly activity grid, academic achievements, today's goals progress.
*   **Tier 3 (Supporting Actions):** Learning forecast forecast loads, recent activity feed, navigation to Settings.

## 📐 Layout Structure
The page uses a Flutter `CustomScrollView` with pinned headers, transitioning from a Hero container above the fold to a grid structure below the fold. Margins are `24dp` on mobile screens.

```
+---------------------------------------------------+
|  [Dashboard]                                      | <- SliverAppBar Title
+---------------------------------------------------+
|  +---------------------------------------------+  |
|  |  Today's Progress                           |  | <- Progress Hero Card ⭐
|  |  🔥 12 Day Streak                           |  | <- Current Streak (Amber fire)
|  |  15 Reviews Ready (≈ 4 min)                 |  |
|  |  [ Continue Learning ]                      |  | <- Primary Action (Solid Amber button)
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  WEEKLY ACTIVITY                                  | <- Section Header
|  S   M   T   W   T   F   S                        |
|  ●   ●   ●   ○   ●   ●   ●                        | <- GitHub-style activity dots ⭐
+---------------------------------------------------+
|  LEARNING SUMMARY                                 | <- Section Header
|  +---------------------+ +---------------------+  |
|  | Mastered            | | Learning            |  |
|  | 352 words           | | 82 words            |  |
|  | ●●●●●●●○○ 82%       | | Spaced rep queue    |  | <- Muted dots progress tracker ⭐
|  +---------------------+ +---------------------+  |
|  +---------------------+ +---------------------+  |
|  | Saved Words         | | Stories Read        |  |
|  | 128 words           | | 14 completed        |  |
|  +---------------------+ +---------------------+  |
+---------------------------------------------------+
|  TODAY'S GOAL                                     | <- Section Header
|  12 / 20 Words Reviewed    ██████░░░░ 60%         | <- Daily review goal bar (Amber fill)
+---------------------------------------------------+
|  RECENT MILESTONES                                | <- Achievements Section ⭐
|  ✓  100 Words Mastered                            |
|  ✓  7-Day Streak                                  |
|  ✓  Completed Story 12                            |
+---------------------------------------------------+
|  LEARNING FORECAST                                | <- Future review projections ⭐
|  Today: 15   •   Tomorrow: 18   •   This Week: 76  |
+---------------------------------------------------+
|  RECENT ACTIVITY                                  | <- Chronological activity list ⭐
|  • Yesterday: 15 Reviews completed                |
|  • 2 days ago: Quiz (Spelling mode)               |
|  • Monday: Read Story 12 (Echoes of the Past)     |
+---------------------------------------------------+
|  [Home]  [Study]  [Library]  [Profile]           | <- Bottom Navigation Bar
+---------------------------------------------------+
```

## 🧩 Components
1.  **Today's Progress Hero Card:**
    *   An editorial highlight card at the top.
    *   Features the user's active streak count (`12 Days`) with a glowing Amber fire icon, the due review count (`15 Reviews Ready`), estimated minutes left, and the primary solid Amber `Continue Learning` button.
2.  **Weekly Activity Tracker:**
    *   A clean grid display showing the past 7 days (Sunday to Saturday) with colored indicator dots (filled Teal dot for active study days, outline dot for inactive days).
3.  **Learning Summary Cards:**
    *   Four small grid cards details:
        *   **Mastered:** Displays count (`352`) and dot-based retention string (`●●●●●●●○○ 82%`).
        *   **Learning:** Displays count (`82`) and spaced queue indicators.
        *   **Saved Words:** Displays count (`128`) linking to the Saved Words library.
        *   **Stories Read:** Displays completed stories count (`14`).
4.  **Goal Tracking Progress Bar:**
    *   Renders progress towards the daily learning target (`12 / 20 Words`) using a clean Amber horizontal progress bar.
5.  **Recent Milestones (Achievements):**
    *   A list detailing recent milestone completions (e.g., `✓ 100 Words Mastered`, `✓ Completed Story 12`) with academic checkmarks.
6.  **Learning Forecast Summary:**
    *   Displays upcoming review loads: `Today: 15  •  Tomorrow: 18  •  This Week: 76` to manage study expectations.
7.  **Recent Activity Feed:**
    *   A simple chronological list showing recent sessions (e.g. `Yesterday: 15 Reviews`, `Monday: Read Story 12`).

## 🔄 Lifecycle States
*   **Loading:** Skeletons mimic the summary grid cards and hero card details.
*   **Loaded:** Displays cached user statistics, updating records instantly when SQLite completes fresh writes.
*   **Empty State:** Shown if the user has no study history:
    ```
    No learning history yet.
    Complete your first review session to begin tracking your progress.
    
    [ Start Learning ]
    ```
    *(The CTA button launches the initial study review session).*

## 🖐️ Interactions
*   **Tap Continue Learning / Start Review:** Launches Spaced Review Session ([04_review_session](file:///home/mamun/wordsmart/docs/ui/screen_specs/04_review_session.md)).
*   **Milestone Click:** Clicking a completed story milestone navigates to the Story Reader ([06_story_reader](file:///home/mamun/wordsmart/docs/ui/screen_specs/06_story_reader.md)).
*   *Note on Reset Controls:* The "Reset Progress / Reset Learning History" button has been removed from this screen. Reset operations are now located exclusively in settings under the Danger Zone ([09_preferences](file:///home/mamun/wordsmart/docs/ui/screen_specs/09_preferences.md)).

## 🎬 Animations
*   **Hero Streak Pulsation:** The Amber fire icon on the Hero Card has a slow, breathing opacity pulse over `2000ms`.
*   **Dot Loading Sequence:** Learning summary dots fill sequentially on-screen load (`150ms`).

## 📐 Responsive Behavior
*   **Phones (<600dp):** CustomScrollView scroll pane. Summary cards display as a 2x2 grid.
*   **Tablets & Desktops (>600dp):** Shift into a multi-column dashboard layout (grid columns locked at `800dp` maximum width).
    *   *Left Column:* Hero Progress Card, Weekly Activity, Today's Goal.
    *   *Right Column:* Learning Summary Cards, Milestones, Forecast, Recent Activity.

## ♿ Accessibility
*   Muted teal/gray progress indicator dots are paired with explicit percentage values (e.g., `82%`).
*   The entire screen uses semantic structures readable by screen readers. For example, screen readers announce: *"Study streak: 12 days. 15 reviews ready. Mastered: 352 words, 82% retention."*

## 🛠️ Flutter & Riverpod Structure
*   Construct the page using a `CustomScrollView` with a `SliverAppBar`, a `SliverList` (for the hero card, activity tracker, and goals), and a `SliverGrid` (for the summary statistics cards).
*   Riverpod providers query statistics from SQLite databases locally (`BookmarkRepository` + `ProgressRepository`) and rebuild components independently.
*   *Restricted Palette:* Amber accents are restricted strictly to streaks, goal meters, and the primary action button. All other elements use muted gray, white, and teal borders.

## 📋 Session Rules
*   **Immediate Local Sync:** Progress tables update immediately following the completion of any study activity (review, quiz, story reading).
*   **Streak Rules:** Streaks are calculated using standard calendar dates. A day counts as active if at least one learning activity is completed.
*   **Spaced Focus:** The `Start Review` action dynamically queries only active spacing queues from SQLite.
*   **Local Calculation:** All statistics are calculated offline on-device.
*   **Resumability:** Dashboard states are loaded instantly from cached settings on launch.

## ✅ Success Criteria
The learning dashboard should answer these five questions within `3 seconds` of landing:
1.  **How am I doing?** (Visualized in Streak, Summary cards, and Goals).
2.  **What should I study next?** (Instantly visible on the top Hero Card CTA).
3.  **How many words have I mastered?** (Count shown on the summary statistics card).
4.  **Am I maintaining my streak?** (Streak 🔥 counter highlighted at the top).
5.  **Can I resume learning immediately?** (One tap on the hero action button resumes study).

## 🧠 Future Learning Insights
Progress repositories are designed to scale to the following long-term insights (V2):
*   **Most Difficult Words:** Lists words with low accuracy ratings.
*   **Weakest Part of Speech:** Identifies POS groups with high error rates.
*   **Review Consistency:** Visualizes study intervals and consistency metrics.
*   **Goal Projections:** Muted academic encouragement (e.g., *"You're in the top 43% of your yearly goal. Continue →"*).
