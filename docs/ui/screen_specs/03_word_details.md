# Screen Specification: 03_word_details

## 🎯 Purpose
The flagship learning page of WordSmart, displaying comprehensive vocabulary details under the progressive disclosure paradigm.

## 🏆 User Goal
Read meaning, listen to audio, examine contextual examples, etymology roots, related derivatives, and update word study status.

## 🧭 Entry / Exit
*   **Entry:** Selecting any word from Home (01_home), Search Results (02_search), Saved Words ([07_saved_library](file:///home/mamun/wordsmart/docs/ui/screen_specs/07_saved_library.md)), or Study Session ([05_study_session](file:///home/mamun/wordsmart/docs/ui/screen_specs/05_study_session.md)).
*   **Exit:** Tapping Back arrow $(<)$ returns to the previous screen in the stack trace.

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Word display, Bengali meaning, English definition.
*   **Tier 2 (Secondary Context):** Pronunciation (audio play), mnemonics, example sentences.
*   **Tier 3 (Supporting Actions):** Synonyms/Antonyms chips, Collocations, Derivatives, Roots, and Study Actions bottom bar.

## 📐 Layout Structure
The details page follows a clean, single-column scrollable sheet structured for scan readability:
```
[ Collapsible Sliver App Bar ]
              ↓
[ Word | Pronunciation | POS Chip | Difficulty Rating | Audio (🔊) | Bookmark (⭐) ]
              ↓
───────────────────────────────────────────── (Thin Divider)
[ Bengali Meaning | English Definition ]
              ↓
─────────────────────────────────────────────
[ Mnemonic Box ]
              ↓
─────────────────────────────────────────────
[ Example Sentences Stack ]
              ↓
─────────────────────────────────────────────
[ Synonyms Chip Row ]
              ↓
─────────────────────────────────────────────
[ Antonyms Chip Row ]
              ↓
─────────────────────────────────────────────
[ Collocations List ]
              ↓
─────────────────────────────────────────────
[ Derivatives List ]
              ↓
─────────────────────────────────────────────
[ Roots & Etymology Panel ]
              ↓
─────────────────────────────────────────────
[ Study Actions: (Mark as Mastered) | (Review Again) ]
```

## 🧩 Components
1.  **Sliver Header Wrapper:** Houses the scroll-responsive pinned title and global actions.
2.  **Word Header Block:** Large Outfit Bold headword (`48sp`), phonetic guide (`16sp`), uppercase POS label chip (e.g. `VERB`), and a subtitle difficulty rating tag (e.g. `GRE High Frequency`).
3.  **Core Meanings Card:** Level 1 surface showing translation in Hind Siliguri (`17sp`) and description in Inter Medium (`17sp`).
4.  **Mnemonic Card:** Translucent block with a soft Amber outline summarizing memory association hooks.
5.  **Examples Section:** Ordered list containing English sample sentences paired with muted Bengali translation text block-by-block.
6.  **Synonym & Antonym Rows:** Scrollable horizontal chip lists.
7.  **Roots Panel:** Root tag box (e.g. `Origin: Latin 'ab' meaning away`).
8.  **Study Actions Bar:** A bottom-anchored persistent button row:
    *   *Primary Action:* Teal-filled `Mark as Mastered` button.
    *   *Secondary Action:* Outlined `Review Again` button.

## 🔄 Lifecycle States
*   **Loading:** Skeletons pulse in shape of cards and details paragraphs.
*   **Loaded:** Details fade in over `200ms` using `easeOutCubic`.
*   **Audio Loading:** Spinner replaces audio volume icon.
*   **Audio Playing:** Volume waves pulse dynamically in sync with audio length.
*   **State Updated:** Success toast pops when study action (e.g. Mastered) is clicked.

## 🖐️ Interactions
*   **Vertical Scroll:** Translates and scales the large headword from the content canvas into a smaller text label inside the pinned sliver app bar.
*   **Tap Related Chip:** Recursively pushes a new `03_word_details` instance for the clicked synonym or antonym onto the navigation stack.

## 🎬 Animations
*   **Word Hero:** Headword Outfit text morphs size and coordinates from lists directly to header.
*   **Bookmark Toggle:** Star scale bounce (`0.8x` to `1.2x` to `1.0x` over `150ms`).

## 📐 Responsive Behavior
*   **Phone (<600dp):** Single-column layout, scrolling vertically, margins at `24dp`.
*   **Tablet (600–840dp):** Two-column layout: Left column contains the main Word header, meanings, and mnemonics; Right column contains Examples, Synonyms/Antonyms, Collocations, and Roots.
*   **Desktop (>840dp):** Centered reading layout capped at `800dp` width.

## ♿ Accessibility
*   All text uses scalable `sp` units to honor system text magnification settings.
*   Bengali Hind Siliguri text utilizes a dedicated line-height modifier (`+20%` padding) to prevent vowel overlap.
*   All buttons have touch target sizes exceeding `48dp` x `48dp`.

## 🛠️ Flutter Notes
*   Use `SliverAppBar` with `flexibleSpace` to handle headword collapse.
*   Use `RichText` or standard column layouts for Example segments to keep the widget tree flat and performant.
*   Bind study actions directly to SQLite progress transactions via providers.

## ✅ Success Criteria
A successful Word Details screen should allow users to:
*   Read and understand the primary meaning/definition in **< 1 second** of page load.
*   Play the pronunciation audio with **1 tap** on the volume icon.
*   Toggle bookmarks with **1 tap** on the star icon.
*   Navigate to related synonym details with **1 tap** on chips.
*   Update study mastery status (e.g. Mastered) with **1 tap** on the bottom action bar.
