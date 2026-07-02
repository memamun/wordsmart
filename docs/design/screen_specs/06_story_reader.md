# Screen Specification: 06_story_reader

## 🎯 Purpose
Provide an immersive, highly customizable, distraction-free reading space that prioritizes the long-form reading experience first and dictionary access second. The reader features a Kindle-style Focus Mode with adaptive typography, multi-state translations, and context-preserving interactive vocabulary highlights.

## 🏆 User Goal
Read long-form English stories, quickly reference translations without leaving the reading pane, customize fonts/themes for eye comfort during long sessions, and review encountered vocabulary.

## 🧭 Entry / Exit
*   **Entry:** Selecting a story card or tapping "Resume Reading" on the Story Library dashboard ([06_story_library](file:///home/mamun/wordsmart/docs/ui/screen_specs/06_story_library.md)).
*   **Exit:** Tapping the Back arrow $(<)$ returns to the Story Library ([06_story_library](file:///home/mamun/wordsmart/docs/ui/screen_specs/06_story_library.md)).

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Story text column.
*   **Tier 2 (Secondary Context):** Inline quick definition overlay, Apple Books-style Preferences sheet (`Aa` options: Font size, Line height, Theme, Translation mode), translation paragraphs.
*   **Tier 3 (Supporting Actions):** Detailed definition bottom sheet (mini-dictionary), reading stats (time elapsed, words encountered), progress bar, audio narration control.

## 📐 Layout Structure
The reader pane is centered with margins set to fit a column width of maximum `700dp` to maintain optimal typographic limits (`60–75` characters per line). 

### 1. Reading Mode (Kindle-style Focus Mode - Default)
No Chrome is shown. The AppBar, status bar, and progress bar fade out during active reading. Tapping once anywhere on page whitespace toggles the visibility of the AppBar and progress controls.
```
+---------------------------------------------------+
|  (<-) Back           Echoes of the Past      (Aa) | <- Top bar (Appears on tap)
+---------------------------------------------------+
|  The storm finally ABATED after midnight, leaving | <- Highlighted word (Amber/Teal/Regular)
|  the streets quiet.                               |
|                                                   |
|  ঝড়টি অবশেষে মধ্যরাতের পর প্রশমিত হয়েছিল...        | <- Translation (Paragraph/Tapped block)
|                                                   |
|  He felt abashed by the sudden silence.           |
|                                                   |
+---------------------------------------------------+
|  Story 12  •  35%  ██████░░░░  •  4 min left      | <- Progress bar (Kindle style)
+---------------------------------------------------+
```

### 2. Focus Vocabulary Mode (Quick Definition Overlay)
Tapping a highlighted word displays a quick definition overlay *inline* without opening a bottom sheet, keeping the reader fully immersed in the sentence context. The tapped word glows softly.
```
+---------------------------------------------------+
|  (<-) Back           Echoes of the Past      (Aa) |
+---------------------------------------------------+
|  The storm finally [ ABATED ] after midnight...   | <- Tapped Word Glows
|                                                   |
|  +---------------------------------------------+  |
|  |  ABATED  [VERB]                             |  | <- Quick Definition Overlay ⭐
|  |  Bengali: উপশম হয়েছিল                         |  |
|  |  Meaning: To become less intense or severe. |  |
|  |  [ Learn More ]     [ Close ]               |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  Story 12  •  35%  ██████░░░░  •  4 min left      |
+---------------------------------------------------+
```

### 3. Detailed Bottom Sheet (Mini-Dictionary)
If the user taps `Learn More` from the Quick Definition Overlay or long-presses the word, a detailed bottom sheet opens showing full definition context.
```
+---------------------------------------------------+
|  ABATE  [Saved]                              (★) | <- Word Header, Saved tag, and Star toggle
|  [VERB]  •  uh-BAYT                               | <- Part of speech & pronunciation
|                                                   |
|  বাংলা অর্থ: উপশম করা / হ্রাস পাওয়া                 | <- Translation ⭐
|                                                   |
|  Definition:                                      |
|  To become less intense or widespread.            |
|                                                   |
|  Example:                                         |
|  The storm finally **ABATED** after midnight.     | <- Amber bolded target word
|                                                   |
|  +---------------------------------------------+  |
|  | Mnemonic:                                   |  |
|  | Rebate makes the price ABATE.               |  | <- Mnemonic hint
|  +---------------------------------------------+  |
|                                                   |
|  (🔊) Pronounce  •  [ Open Full Details → ]      | <- Quick Audio & Details Navigation
+---------------------------------------------------+
```

### 4. Story Completion Screen
Appears when the user reaches the end of the text column.
```
+---------------------------------------------------+
|                                                   |
|                 Story Complete!                   | <- Title (Outfit Bold, 24sp)
|                                                   |
|                       🎉                          |
|                                                   |
|               You encountered 18 words            |
|                                                   |
|               Vocabulary Stats:                   |
|               • Words Learned: 12                 |
|               • New Vocabulary: 6                 |
|               • Reading Time: 5 min               | <- Reading Statistics ⭐
|                                                   |
|  [ Practice Words ]                               | <- Launches sub-session
|  [ Start Quiz ]                                   |
|  [ Home ]                                         |
|                                                   |
+---------------------------------------------------+
```

## 🧩 Components
1.  **Reading Pane Canvas:**
    *   Renders paragraphs centered within a capped typographic margin.
    *   Uses Flutter's `SelectableText.rich` instead of `RichText` to allow native selection, accessibility screen-readers, and copying.
2.  **Vocabulary Highlight Styles:**
    *   Highlighted terms change styles depending on user learning mastery:
        *   **Unknown Word:** Thick Amber underline or Amber background overlay (e.g. `rgba(255, 191, 0, 0.15)`).
        *   **Learning Word:** Styled with a Teal outline border.
        *   **Mastered Word:** Normal text (highlight styling completely removed).
3.  **Reading Preferences Dialog (`Aa`):**
    *   An Apple Books-style dropdown overlay providing:
        *   **Font Size Adjustment:** `A-` and `A+` controls.
        *   **Line Height Toggles:** `Compact`, `Regular`, `Wide`.
        *   **Themes:** `Light` (black text on white), `Dark` (white text on dark charcoal `#121212`), `Sepia` (dark brown text on warm warm sepia `#F4ECD8`).
        *   **Translation Modes:**
            *   *English Only:* Bengali blocks hidden.
            *   *Paragraph (Bilingual):* Bengali translation block displayed beneath each English paragraph.
            *   *Bengali Hidden:* Translation is hidden but reveals itself beneath a paragraph when that specific paragraph is double-tapped.
4.  **Audio Narration Player (Future-Proof):**
    *   The top bar reserves space for a `Play Audio` control which highlights sentences sequentially as the narration progresses (for post-MVP integration).

## 🔄 Lifecycle States
*   **Loading:** Skeletons pulse text shapes.
*   **Reading (Focus Mode):** Top/bottom bars hidden. Only the story text column is shown.
*   **Reading (Toolbar Active):** Top navigation and bottom progress indicators visible.
*   **Quick Definition Opened:** Overlay card displayed inline above/below the tapped word.
*   **Details Opened:** WordDetails bottom sheet visible.
*   **Story Completed:** Displays statistics and review actions.

## 🖐️ Interactions
*   **Single Tap Word:** Reveals the `Quick Definition Overlay` (Focus Vocabulary Mode).
*   **Double Tap Word:** Saves / unsaves the word in the Saved Library immediately (gives haptic tick).
*   **Long Press Word:** Bypasses overlay and opens the `Detailed Bottom Sheet` (Mini-Dictionary).
*   **Tap Page Whitespace:** Toggles toolbar visibility.
*   **Double Tap Paragraph:** Toggles Bengali translation block for that specific paragraph (if in `Bengali Hidden` mode).

## 📐 Responsive Behavior
*   **Phones (<600dp):** Margins are set to `20dp`. Standard text scaling.
*   **Tablets & Desktops (>600dp):** Columns are locked to a width of `700dp` centered on the viewport to ensure comfortable eye movement.

## ♿ Accessibility
*   Supports native system text-scaling.
*   `Sepia` and `Dark` modes reduce eye strain in low light.
*   Supports screen readers through `SelectableText.rich` structure.

## 🛠️ Flutter Notes
*   Use `SelectableText.rich` with a list of `TextSpan` elements. Bind `TapGestureRecognizer`, `LongPressGestureRecognizer`, and `DoubleTap` listeners to the target word spans.
*   Store typography configuration (theme, font size, line spacing) in a Riverpod preferences provider and cache to local SharedPreferences.
*   Keep the scroll offset synced. Write scroll updates to the local SQLite reading progress table.

## 📋 Reading Session Rules
*   **Automatic Progress Logging:** Scroll progress and paragraph index positions are saved automatically to SQLite.
*   **Preference Persistence:** Font sizing, themes, and translation configurations are remembered across stories.
*   **Dynamic Highlights:** Highlight styling updates instantly if a word's mastery state changes.
*   **View Retention:** Tapping highlights or loading sheets never shifts the current scroll viewport.
*   **Resume Scroll:** Returning to a story restores the reader to their exact scroll position.
*   **Review Linkage:** Completing a story compiles all encountered vocabulary into a customized Review Session.
