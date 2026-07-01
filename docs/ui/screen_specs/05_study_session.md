# Screen Specification: 05_quiz

## 🎯 Purpose
Test vocabulary recall through active drills (MCQ, Matching, Spelling) and provide instant visual feedback.

## 🏆 User Goal
Answer questions, view score results, and check incorrect terms.

## 🧭 Entry / Exit
*   **Entry:** Tapping "Quiz" quick action on Home screen (01_home).
*   **Exit:** 
    *   Tapping Quit $(X)$ $\rightarrow$ Opens confirmation dialog before returning to Home.
    *   Completing Quiz $\rightarrow$ Shows Quiz Results summary.

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Active Quiz question card, choice options stack.
*   **Tier 2 (Secondary Context):** Correct/Incorrect color feedback overlays, Progress bar.
*   **Tier 3 (Supporting Actions):** Results ring, scrollable list of review words, exit confirmation.

## 📐 Layout Structure
The MCQ layout follows a structured vertical layout.
```
+---------------------------------------------------+
|  (x) Quit               [ Question 3 / 10 ]       | <- Status Bar
+---------------------------------------------------+
|  What is the meaning of:                          |
|                                                   |
|  ABASH                                            | <- word (Outfit SemiBold, 28sp)
|  /əˈbæʃ/                                          |
|                                                   |
+---------------------------------------------------+
|  (A) To step down from power                      | <- Option A (Level 1 surface)
+---------------------------------------------------+
|  (B) To embarrass or make ashamed                 | | <- Option B (Correct - Teal fill)
+---------------------------------------------------+
|  (C) To reduce or subside                         | <- Option C (Incorrect - Red outline)
+---------------------------------------------------+
|  (D) To shorten or abridge                        | <- Option D (Level 1 surface)
+---------------------------------------------------+
```

## 🧩 Components
1.  **Question Card:** Displays vocabulary term or definition.
2.  **MCQ Option Stack:** 4 selectable answer rows.
3.  **Quiz Progress Bar:** Top indicator bar.
4.  **Results Ring:** Circular percentage indicator.
5.  **Review List:** Scrollable list of incorrectly answered words.

## 🔄 Lifecycle States
*   **Answer Pending:** Options are displayed in inactive state.
*   **Option Selected:** Correct answer turns Teal; incorrect selection turns Red.
*   **Results Summary:** Displays total score, accuracy rating, and review items.
*   **Error:** Show notification on load failure.

## 🖐️ Interactions
*   **Select Option:** Tapping an option locks the selection and plays success/warning haptic feedback.
*   **Tap Review Word:** Tapping a review item opens its full Word Details page.

## 🎬 Animations
*   **Slide transition:** Tapping "Next" slides the current question off-screen and introduces the new question.
*   **Feedback Flash:** Option card border flashes when matching pairs fail.

## 📐 Responsive Behavior
*   **Phone (<600dp):** Vertical stack, options list occupies full width with margins.
*   **Tablet & Desktop (>600dp):** Layout is centered, capping MCQ options width to `600dp` to maintain optimal scanning and reachability.

## ♿ Accessibility
*   Buttons have high-contrast text and exceed `48dp` tap targets.
*   Navigation is locked via a `PopScope` (Flutter) to prevent accidental exit during a quiz session.

## 🛠️ Flutter Notes
*   Manage active quiz state using a Riverpod StateNotifier to track progress, list of questions, and correct/incorrect counts.
*   Inject the generated `wordsmart.db` questions list dynamically using a local DataSource query.

## ✅ Success Criteria
A successful Quiz screen should allow users to:
*   Identify the question text immediately upon page transition.
*   Select an option with **1 tap** on the item card.
*   View visual correct/incorrect feedback within **100ms** of selection.
*   Complete session and view score summary ring immediately.
