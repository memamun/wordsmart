# Screen Specification: 05_quiz

## 🎯 Purpose
Test vocabulary recall through active drills (MCQ, Matching, Spelling) and provide instant visual feedback.

## 🏆 User Goal
Answer questions, view score results, and check incorrect terms.

## 🧭 Entry & Exit Points
*   **Entry:** Tapping "Quiz" quick action on Home screen.
*   **Exit:** 
    *   Tapping Quit $(X)$ $\rightarrow$ Opens confirmation dialog before returning to Home.
    *   Completing Quiz $\rightarrow$ Shows Quiz Results summary.

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

## 🖐️ Interactions & Gestures
*   **Select Option:** Tapping an option locks the selection and plays success/warning haptic feedback.
*   **Tap Review Word:** Tapping a review item opens its full Word Details page.

## 🎬 Animations
*   **Slide transition:** Tapping "Next" slides the current question off-screen and introduces the new question.
*   **Feedback Flash:** Option card border flashes when matching pairs fail.

## ♿ Accessibility
*   Buttons have high-contrast text and exceed `48dp` tap targets.
*   Navigation is locked via a `PopScope` (Flutter) to prevent accidental exit during a quiz session.

## 🛠️ Flutter Implementation Notes
*   Manage active quiz state using a Riverpod StateNotifier to track progress, list of questions, and correct/incorrect counts.
*   Inject the generated `wordsmart.db` questions list dynamically using a local DataSource query.
