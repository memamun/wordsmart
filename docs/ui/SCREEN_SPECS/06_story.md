# Screen Specification: 06_story

## 🎯 Purpose
Provide a contextual dual-language reading space where vocabulary words are highlighted in natural sentences.

## 🏆 User Goal
Read stories, listen to narration, tap highlighted words to view definitions, and toggle translations.

## 🧭 Entry / Exit
*   **Entry:** Tapping "Story Reader" or selecting "Stories" tab on BottomNavBar.
*   **Exit:** Tapping Back returns to Home or Story directory.

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Story text pane, highlighted vocabulary terms.
*   **Tier 2 (Secondary Context):** Inline Word sheet overlay, translation paragraph blocks.
*   **Tier 3 (Supporting Actions):** Floating translation toggles, Story header metadata.

## 📐 Layout Structure
The bilingual story reader pane scrolls vertically:
```
[ Story Header: Title | Reading Time | Difficulty ]
                     ↓
[ Paragraph 1 (English) with Highlighted Word ]
                     ↓
[ Paragraph 1 (Bengali Translation) ] (Muted, toggled)
                     ↓
[ Paragraph 2 (English) ... ]
                     ↓
+-------------------------------------------------+
|  ABATE (v.) - to subside; to reduce        (>)  | <- Inline Word Sheet (Bottom Sheet)
+-------------------------------------------------+
```

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
*   **Loading:** Shimmer blocks represent paragraphs loading from database.

## 🖐️ Interactions
*   **Tap Highlighted Word:** Launches the contextual `Inline Word Sheet`.
*   **Tap Outside Sheet:** Dismisses the overlay sheet immediately.
*   **Tap Translation Button:** Toggles display of translation paragraphs.

## 🎬 Animations
*   **Bottom Sheet Slide:** Slide-up sheet from bottom over `200ms` using `easeOutCubic`.
*   **Translation Fade:** Translation paragraphs fade in smoothly (`150ms`).

## 📐 Responsive Behavior
*   **Phone (<600dp):** Paragraphs display in full screen width with `24dp` margins, font size matches standard body.
*   **Tablet & Desktop (>600dp):** Reading pane margins expand, capping text column width to `700dp` to maintain optimal reading line length (50-75 characters per line).

## ♿ Accessibility
*   Clickable highlights use native text scaling.
*   The translation toggle button contains descriptive screen reader labeling.

## 🛠️ Flutter Notes
*   Render the story text using a `RichText` widget with split `TextSpan` and `TapGestureRecognizer` to bind tap events to highlighted terms.
*   Implement the overlay card using a standard `showModalBottomSheet()` with a translucent glass container.

## ✅ Success Criteria
A successful Story screen should allow users to:
*   Read story paragraphs comfortably with natural typography spacing.
*   Reveal definition bottom sheet with **1 tap** on highlighted word.
*   Toggle Bengali translations with **1 tap** on the floating action button.
*   Navigate to full details page from bottom sheet with **1 tap**.
