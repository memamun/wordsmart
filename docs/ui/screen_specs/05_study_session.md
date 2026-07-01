# Screen Specification: 05_study_session

## 🎯 Purpose
Provide a highly interactive, educationally focused quiz/drill interface to test vocabulary retention and reinforce learning immediately after assessment. The page is built around a generic `Study Session` page architecture, powered by a core `Quiz Engine` which handles question generation, tracking, and interval updates, delegating the layout presentation to a `Question Renderer` interface (supporting MCQ, Matching, Spelling/Typing, Sentence Completion, Analogy, and Audio drills).

## 🏆 User Goal
Answer study session questions, receive instant corrective and reinforcing feedback, evaluate memory confidence, review incorrect answers, and update vocabulary mastery.

## 🧭 Entry / Exit
*   **Entry:** Tapping "Quick Quiz" or "Start Quiz" quick action on the Home screen ([01_home](file:///home/mamun/wordsmart/docs/ui/screen_specs/01_home.md)) or launching custom study drills.
*   **Exit:**
    *   Tapping the Quit $(X)$ button opens a reassuring leave confirmation dialog:
        ```
        Leave Quiz?
        Progress will be saved.
        [ Continue Quiz ]   [ Leave ]
        ```
    *   Completing the study session navigates to the detailed Results screen.

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Active question widget, selectable choice answers.
*   **Tier 2 (Secondary Context):** Streak indicator, graphical progress bar, estimated time remaining, feedback/explanation card, confidence rating selector.
*   **Tier 3 (Supporting Actions):** Results summary statistics, incorrect words review list, quit confirmation.

## 📐 Layout Structure
The screen features a centered vertical stack for quick scanning. Margins are `24dp` on mobile devices.

### 1. Active Question State (MCQ Presentation Mode)
```
+---------------------------------------------------+
|  (x) Leave              Today's Quiz 🔥 Streak 7  | <- Status Bar / Streak
|                                                   |
|  ■■■□□□□□□□  30%                                  | <- Progress Bar
|  Question 3 of 10 | 2 min left                    | <- Progress Stats & Time Left
+---------------------------------------------------+
|                                                   |
|  What does                                        | <- Prompt (Outfit Medium, 16sp)
|                                                   |
|                   ABASH                           | <- Target Word (Outfit Bold, 28sp)
|                                                   |
|  mean?                                            |
|                                                   |
+---------------------------------------------------+
|  (A) To step down from power                      | <- Option A (Level 1 Surface)
+---------------------------------------------------+
|  (B) To embarrass or make ashamed                 | <- Option B
+---------------------------------------------------+
|  (C) To reduce or subside                         | <- Option C
+---------------------------------------------------+
|  (D) To shorten or abridge                        | <- Option D
+---------------------------------------------------+
```

### 2. Explanation / Feedback State (Incorrect Option Selected)
```
+---------------------------------------------------+
|  (x) Leave              Today's Quiz 🔥 Streak 7  |
|                                                   |
|  ■■■□□□□□□□  30%                                  |
|  Question 3 of 10 | 2 min left                    |
+---------------------------------------------------+
|                                                   |
|                   ABASH                           |
|                                                   |
+---------------------------------------------------+
|  (A) To step down from power                      |
+---------------------------------------------------+
|  [X] (C) To reduce or subside                     | <- Selected Option (Red Background)
+---------------------------------------------------+
|  [✓] (B) To embarrass or make ashamed             | <- Correct Option (Green Border)
+---------------------------------------------------+
|  (D) To shorten or abridge                        |
+---------------------------------------------------+
|  ✗ Wrong                                          | <- Alert Banner (Red, Outfit Bold)
|  Correct answer: To embarrass.                    |
|                                                   |
|  Why?                                             |
|  ABASH means to make someone ashamed or           |
|  embarrassed.                                     |
|                                                   |
|  How confident were you?                          |
|  ( ) Guess      ( ) Somewhat sure      ( ) Sure   | <- Confidence Rating ⭐
|                                                   |
|  [ Continue → ]                                   | <- CTA Button (Teal background)
+---------------------------------------------------+
```

### 3. Explanation / Feedback State (Correct Option Selected)
```
+---------------------------------------------------+
|  (x) Leave              Today's Quiz 🔥 Streak 7  |
|                                                   |
|  ■■■□□□□□□□  30%                                  |
|  Question 3 of 10 | 2 min left                    |
+---------------------------------------------------+
|                                                   |
|                   ABASH                           |
|                                                   |
+---------------------------------------------------+
|  (A) To step down from power                      |
+---------------------------------------------------+
|  [✓] (B) To embarrass or make ashamed             | <- Selected Option (Green Background)
+---------------------------------------------------+
|  (C) To reduce or subside                         |
+---------------------------------------------------+
|  (D) To shorten or abridge                        |
+---------------------------------------------------+
|  ✓ Correct!                                       | <- Alert Banner (Green, Outfit Bold)
|  You remembered:                                  |
|  ABASH means to embarrass or make ashamed.        | <- Memory Reinforcement ⭐
|                                                   |
|  Example:                                         |
|  He was **ABASHED** by the laughter.              |
|                                                   |
|  Mnemonic:                                        |
|  A-BASH: Embarrassed at a bashful party.          |
|                                                   |
|  How confident were you?                          |
|  ( ) Guess      ( ) Somewhat sure      ( ) Sure   | <- Confidence Rating ⭐
|                                                   |
|  [ Continue → ]                                   | <- CTA Button (Teal background)
+---------------------------------------------------+
```

### 4. Results Screen
```
+---------------------------------------------------+
|                                                   |
|                 Quiz Complete                     | <- Title (Outfit Bold, 24sp)
|                                                   |
|                     ( 80% )                       | <- Ring Score (Animated 0% to 80%)
|                                                   |
|    8 Correct                    2 Incorrect       | <- Scoring Breakdown
|                                                   |
|    Time: 4 min                  Mastered: +6      | <- Session stats
|                                                   |
|  ───────────────────────────────────────────────  |
|  Needs Review                                     | <- Section Header
|  • ABATE  • ABRIDGE                               |
|                                                   |
|  [ Review Incorrect Words ]                       | <- Primary Action (Launches sub-session)
|                                                   |
|  [ Return to Home ]                               | <- Secondary Muted Action
|                                                   |
+---------------------------------------------------+
```

## 🧩 Components
1.  **Top Status Bar & Tracker:**
    *   Streak indicator on the right showing `Today's Quiz 🔥 7-day streak`.
    *   Graphical horizontal progress bar (`■■■□□□□□□□`), percentage (`30%`), fraction (`Question 3 of 10`), and an estimated time remaining indicator (`2 min left`).
2.  **Question Renderer Card:**
    *   Centered card displaying the question content with defined borders. Uses a polymorphic rendering template.
3.  **Options List Stack:**
    *   Contains selectable answers. Option items are styled with rounded corners and level 1 surface colors.
4.  **Explanation & Feedback Card:**
    *   Appears at the bottom of the screen after answering.
    *   Includes definitions, contextual example sentences (with the target word highlighted in **Bold Amber**), and mnemonic strings (only shown if present in the database).
    *   Contains the **Confidence Rating** group: Three option choices (`Guess`, `Somewhat sure`, `Very sure`).
    *   Houses the primary `Continue →` button.
5.  **Results Card Dashboard:**
    *   Displays the completion score ring, duration of the quiz, mastery counts, and a separated list of incorrect items labeled under "Needs Review".

## 🔄 Lifecycle States
*   **Empty State:** Shown if no quizzes are generated/available:
    ```
    No quizzes available today.
    [ Create Custom Quiz ]   [ Review Flashcards ]
    ```
*   **Answer Pending:** Input choices are inactive; the progress timer is counting down/tracking duration. Next button is hidden.
*   **Option Selected / 100ms Pause:** The tap registers with a haptic tick, pausing for `100ms` before styling results.
*   **Feedback Displayed:** Color-codes options (Teal for correct, Red for selected incorrect, Green borders for correct answers not selected). Displays the explanation card, reinforcement prompt, confidence rating choices, and reveals the `Continue →` button.
*   **Quiz Complete:** Displays final accuracy metrics, streak status, and incorrect words summary.

## 🖐️ Interactions & Navigation Loop
*   **Tap Choice:** Starts the 100ms pause, locks other selections, and displays evaluation feedback.
*   **Confidence Select:** Records user confidence rating into the spaced repetition algorithm to determine subsequent card weights.
*   **Tap Continue:** Transitions to the preloaded next question.
*   **Quiz Navigation Loop:** The app enforces a strict educational loop:
    `Study Session` $\rightarrow$ `Results` $\rightarrow$ `Review Incorrect (Launches mini-quiz for wrong answers)` $\rightarrow$ `Finish` $\rightarrow$ `Home`.

## 🎬 Animations
*   **Option Evaluation Fade:** Transition to correct/incorrect color states occurs over `150ms` after the initial `100ms` click-confirmation delay.
*   **Results Circular Score:** The results ring animates its progress value from `0%` to the final accuracy percentage over `700ms` using an `easeOutCubic` curve.
*   **Question Slide:** The current question card slides off-screen left, while the next preloaded question enters from the right.

## 📐 Responsive Behavior
*   **Phones (<600dp):** Vertical scroll stack; options and cards fill `90%` of screen width.
*   **Tablets & Desktops (>600dp):** Question cards and option widths are restricted to a maximum of `600dp` to maintain optimal visual reading widths and comfortable tap reachability.

## ♿ Accessibility
*   Touch targets for options are locked at a minimum height of `48dp` with generous horizontal padding.
*   High-contrast color changes (Green/Red) are always paired with icon decorators (e.g., `[✓]` or `[X]`) for color-blind accessibility.
*   Uses haptics to confirm answers: short single click for taps, double vibration for success, heavy single pulse for wrong answers.

## 🛠️ Flutter & Riverpod Structure
*   **Independent Widgets:** Build `StudySessionPage` using separate widgets to isolate rebuilds:
    *   `ProgressBar` (observes current index state).
    *   `QuestionCard` (renders polymorphic layout of active question).
    *   `OptionsList` (tracks choice selection state).
    *   `BottomFeedbackCard` (manages explanation sheet visibility and confidence rating).
*   Use Riverpod's `StateNotifier` to maintain the session state engine independently of layout, enabling the same state engine to feed MCQ, Spelling, or Matching presentations.

## 📋 Session Rules
*   **Randomization:** Questions in a session are randomized automatically.
*   **Uniqueness:** No duplicate vocabulary words can be tested within the same session.
*   **Immediate Progress Updates:** Correct answers update learning databases instantly to protect user effort from app crashes.
*   **Review Logging:** Incorrectly answered words are automatically added to the active user's "Needs Review" SQLite table.
*   **State Resumability:** The quiz session state persists locally. If interrupted, it launches back to the exact question index on app restart.
