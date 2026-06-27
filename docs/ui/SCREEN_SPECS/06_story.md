# Screen Specification: 06_story

## 🎯 Purpose
Provide a contextual dual-language reading space where vocabulary words are highlighted in natural sentences.

## 🏆 User Goal
Read stories, listen to narration, tap highlighted words to view definitions, and toggle translations.

## 🧭 Entry & Exit Points
*   **Entry:** Tapping "Story Reader" or selecting "Stories" tab on BottomNavBar.
*   **Exit:** Tapping Back returns to Home or Story directory.

## 🧩 Components
1.  **Story Header:** Title, difficulty rating, and estimated reading time.
2.  **Bilingual Reader Pane:** Scrollable text body.
3.  **Highlighted Terms:** Vocabulary words styled in Amber with an underline.
4.  **Translation Toggle:** Floating button to reveal/hide Bengali translations block-by-block.
5.  **Inline Word Sheet:** Bottom sheet overlay showing quick meaning of tapped vocabulary.

## 🔄 Lifecycle States
*   **Reading Mode:** Full English story text is visible.
*   **Word Selected:** Bottom sheet opens displaying definition, translation, and a button for full details.
*   **Bilingual Mode:** Bengali translation paragraphs appear directly under each English paragraph.

## 🖐️ Interactions & Gestures
*   **Tap Highlighted Word:** Launches the contextual `Inline Word Sheet`.
*   **Tap Outside Sheet:** Dismisses the overlay sheet immediately.

## 🎬 Animations
*   **Bottom Sheet Slide:** Slide-up sheet from bottom over `200ms` using `easeOutCubic`.
*   **Translation Fade:** Translation paragraphs fade in smoothly (`150ms`).

## ♿ Accessibility
*   Clickable highlights use native text scaling.
*   The translation toggle button contains descriptive screen reader labeling.

## 🛠️ Flutter Implementation Notes
*   Render the story text using a `RichText` widget with split `TextSpan` and `TapGestureRecognizer` to bind tap events to highlighted terms.
*   Implement the overlay card using a standard `showModalBottomSheet()` with a translucent glass container.
