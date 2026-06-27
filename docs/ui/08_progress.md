# Progress Dashboard Screen Wireframe & Spec

This document defines the layout, data visualizations, and progress trackers for the **Progress / Analytics** dashboard of WordSmart.

---

## 🏛️ Layout Structure (Top-to-Bottom)

The dashboard is structured to give an immediate high-level summary of the user's momentum followed by detailed metrics. Side margins are **24dp**.

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

---

## 📝 Component Specifications

### 1. Streak Panel
*   **Style:** Translucent Level 1 surface card with a custom Amber outline.
*   **Typography:** Outfit SemiBold (`28sp`, `#FFB900` Amber).
*   **Icon:** High-contrast Amber fire glyph.

### 2. Stats Grid
*   **Layout:** Two adjacent columns using `12dp` spacing.
*   **Style:** Level 1 cards (`#1E1E1E`), no border lines, `16dp` rounded corners.
*   **Data Numbers:** Outfit Bold (`24sp`, `#F5F5F5`).
*   **Labels:** Inter Regular (`14sp`, `#B0B0B0`).

### 3. Mastery Breakdown Bars
*   **Visual Chart:** Horizontal bars matching the progress indicator specifications.
*   **Teal fill** represents Mastered status.
*   **Muted Amber fill** represents Learning status.
*   **Muted Gray background** represents Unlearned/Stub status.

---

## ⚙️ Study Settings
The bottom segment of the Progress screen hosts study settings:
1.  **Daily Target:** A slider or dropdown to select daily word intake (`5`, `10`, `15`, `20` words).
2.  **Review Algorithm Modifiers:** Toggle selectors to adjust Spaced Repetition algorithms (e.g. *Standard*, *Exam Prep* for quicker review intervals, *Mnemonic Only*).
3.  **Bengali Translation Toggle:** Global switch to enable or disable Bengali meanings inside flashcards and dictionary queries.
