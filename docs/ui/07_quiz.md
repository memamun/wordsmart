# Quiz Screen Wireframe & Spec

This document defines the layout variants, visual feedback rules, and results screen for vocabulary drills and quizzes.

---

## 🏛️ Quiz Layouts

### 1. Multiple Choice Question (MCQ)
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
|  (B) To embarrass or make ashamed                 | <- Option B (Correct - Teal fill)
+---------------------------------------------------+
|  (C) To reduce or subside                         | <- Option C (Incorrect - Red outline)
+---------------------------------------------------+
|  (D) To shorten or abridge                        | <- Option D (Level 1 surface)
+---------------------------------------------------+
```

### 2. Matching Drills
```
+---------------------------------------------------+
|  [ Match the pairs ]                              |
+---------------------------------------------------+
|                                                   |
|   ABATE  [selected]  ( )     ( )  To shorten      |
|   ABASH              ( )     ( )  To reduce       |
|   ABRIDGE            ( )     ( )  To embarrass    |
|                                                   |
+---------------------------------------------------+
```

---

## 📝 Component Specifications

### 1. MCQ Option Cards
*   **Default State:** Background `#1E1E1E`, outline `rgba(255,255,255,0.08)`, text `#F5F5F5`.
*   **Correct Selected State:** Background turns to 10% Teal (`rgba(38,166,154,0.1)`), outline turns to solid Teal (`#26A69A`), text stays `#F5F5F5`.
*   **Incorrect Selected State:** Background turns to 10% Red (`rgba(255,107,107,0.1)`), outline turns to solid Red (`#FF6B6B`).

### 2. Match Column Nodes
*   **Column A (English Words) & Column B (Meanings):**
    *   Tapping a node highlights it with an Amber outline.
    *   Tapping a correct matching node in the opposite column animates both cards connecting, fading them to a muted gray to indicate success.
    *   Mismatch flashes both cards in Red (`#FF6B6B`) for `300ms` before resetting.

---

## 🏆 Quiz Results Screen
After completing the last question, the quiz transitions to the results summary.
*   **Header:** `QUIZ COMPLETED` styled in Outfit Bold (`28sp`, `#FFB900`).
*   **Score Ring:** A circular progress indicator showing the score (e.g. `8 / 10`) and accuracy percentage (e.g. `80% Accuracy`) in the center.
*   **Incorrect Words Review:** A list section titled "Words to Review" displaying cards for all incorrect answers. Tapping any card opens its full **Word Details** screen.
*   **Action Buttons:**
    *   *Retry:* Outlined button.
    *   *Continue Study:* Filled button with Amber background.
