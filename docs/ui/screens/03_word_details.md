# Screen Specification: 03_word_details

## 🎯 Purpose
The flagship learning page of WordSmart, displaying comprehensive vocabulary details under the progressive disclosure paradigm.

## 🏆 User Goal
Read meaning, listen to audio, examine contextual examples, etymology roots, and related derivatives.

## 🧭 Entry & Exit Points
*   **Entry:** Selecting any word from Home, Search Results, Bookmarks, or Quiz.
*   **Exit:** Tapping Back arrow $(<)$ returns to the previous screen in the stack trace.

## 🧩 Components
1.  **Sliver App Bar:** Collapsible bar with a Back button and Bookmark toggle.
2.  **Word Header:** Large Outfit vocabulary word, phonetics, and audio play button.
3.  **Meanings Card:** Translucent card with Bengali meaning and English definition.
4.  **Collocations List:** Common word partnerships.
5.  **Examples Stack:** English example sentences paired with Bengali translations.
6.  **Relationships Chips:** Synonym and Antonym tag rows.
7.  **Derivatives List:** List of suffixes/spelling variants.
8.  **Roots & Etymology Panel:** Origin card indicating root families.

## 🔄 Lifecycle States
*   **Loading:** Shimmer loader matches Card shapes.
*   **Loaded:** Content transitions in with fade.
*   **Audio Playing:** Play button changes state to dynamic visual ripple.
*   **Bookmark Toggle:** Star changes active/inactive status immediately.

## 🖐️ Interactions & Gestures
*   **Vertical Scrolling:** Collapses the large headword into a smaller text label inside the pinned sliver app bar.
*   **Tap related word:** Opens the details screen recursively for the tapped synonym or root word.

## 🎬 Animations
*   **Hero transition:** The headword Outfit text translates smoothly from the list item to the header title.
*   **Microinteractions:** Bookmark toggle scales `0.8x` $\rightarrow$ `1.2x` $\rightarrow$ `1.0x` with haptic click.

## ♿ Accessibility
*   Bengali Hind Siliguri text scale uses distinct line-height padding (+20%).
*   Audio button maintains a clean `48dp` touch target.

## 🛠️ Flutter Implementation Notes
*   Use `SliverAppBar` with `flexibleSpace` to handle headword collapse.
*   Utilize parallel Named-Future execution (`Future.wait`) in `WordRepositoryImpl` to load secondary relations simultaneously without positional coupling.
