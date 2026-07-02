# Screen Specification: 07_saved_library

## 🎯 Purpose
Provide a personal vocabulary dashboard ("Saved Words" or "My Vocabulary") where users browse, search, filter, and track learning progress for saved terms. The screen integrates vocabulary metadata and active progress stats directly with review sessions, upgrading bookmarks from simple links into a centralized learning hub.

## 🏆 User Goal
Monitor saved vocabulary statistics, filter words by learning status and parts of speech, search across multiple definitions/translations, launch review drills for saved items, and preview words.

## 🧭 Entry / Exit
*   **Entry:** Tapping "Saved Words" or "Bookmarks" secondary button inside the Library tab (Tab 3) or Home quick action row.
*   **Exit:**
    *   Tapping any word tile or swiping right opens Word Details ([03_word_details](file:///home/mamun/wordsmart/docs/ui/screen_specs/03_word_details.md)).
    *   Tapping "Start Session" launches a Review Session ([04_review_session](file:///home/mamun/wordsmart/docs/ui/screen_specs/04_review_session.md)) focused exclusively on saved words.
    *   Tapping other BottomNavBar tabs.

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Saved word tiles list, statistics header, bulk review button.
*   **Tier 2 (Secondary Context):** Smart search input, multi-group filters (Status, Type, Sort), learning progress bars.
*   **Tier 3 (Supporting Actions):** Star toggle icon, undo toast, collapsible date group headers ("Recently Added").

## 📐 Layout Structure
The screen uses a `CustomScrollView` structure with a pinned header. Margins are `24dp` on mobile screens.

```
+---------------------------------------------------+
|  Saved Words                                      | <- SliverAppBar Title
|  128 words saved                                  |
+---------------------------------------------------+
|  SUMMARY STATS                                    |
|  128 Saved  •  37 Mastered  •  91 Learning        | <- Statistics Header ⭐
+---------------------------------------------------+
|  [ Review Saved Words (128)  •  Start Session ]   | <- Bulk Review Action ⭐
+---------------------------------------------------+
|  [  Search headword, definition, meaning...  ]    | <- Smart Search ⭐
+---------------------------------------------------+
|  STATUS: (All)  (Learning)  (Mastered)            | <- Persistent Filter Header ⭐
|  TYPE:   (All)  (Noun)  (Verb)  (Adjective)       |
|  SORT:   (A-Z)  (Recently Saved)  (Most Reviewed) |
+---------------------------------------------------+
|  Recently Added: Today                            | <- Grouped sections ⭐
|  +---------------------------------------------+  |
|  |  ABASH  [VERB]                        (★)  |  | <- Tile Layout ⭐
|  |  to embarrass or make ashamed.              |  |
|  |  ██████░░░░ 60%  •  Learning                |  | <- Progress Badge / Bar ⭐
|  +---------------------------------------------+  |
|  +---------------------------------------------+  |
|  |  ABATE  [VERB]                        (★)  |  |
|  |  to reduce or subside.                      |  |
|  |  ██████████ 100% •  Mastered  [✓]            |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  [Home]  [Study]  [Library]  [Profile]           | <- Bottom Navigation Bar
+---------------------------------------------------+
```

## 🧩 Components
1.  **Sliver Statistics Header:**
    *   Displays totals at a glance: `128 Words Saved  •  37 Mastered  •  91 Learning`.
2.  **Bulk Review CTA:**
    *   A prominent filled Teal button at the top to launch a spaced repetition session using only bookmarked words: `Review Saved Words (128)  •  Start Session →`.
3.  **Smart Search Bar:**
    *   A text input field that parses queries across multiple indices: headword spelling, English definition text, Bengali translation meanings, and synonym listings.
4.  **Persistent Multi-Group Filter Panel:**
    *   Laid out as a pinned sliver header separating filters into three logical rows:
        *   **Status:** `All`, `Learning`, `Mastered`.
        *   **Type (POS):** `All`, `Noun`, `Verb`, `Adjective`, `Adverb`.
        *   **Sort:** `A-Z`, `Recently Saved`, `Most Reviewed`, `Recently Studied`.
5.  **Grouped Saved List:**
    *   Collapsible chronological section headers group items by date saved: `Today`, `Yesterday`, `This Week`, `Older`.
6.  **Progress-Integrated Word Tile:**
    *   Features: Word spelling (Outfit Bold, 18sp), Part of Speech tag, primary definition snippet, bookmark star status button, and a visual progress bar (`██████░░░░ 60% Learning` or `100% Mastered [✓]`).
    *   **Interactive Swipe Actions:**
        *   *Swipe Left:* Triggers removal with a 3-second undo toast.
        *   *Swipe Right:* Navigates to [03_word_details](file:///home/mamun/wordsmart/docs/ui/screen_specs/03_word_details.md).
    *   **Future-Proof Multi-selection:** Long pressing adjacent checkboxes (V2 feature) allows bulk actions (Delete, Export, Quiz, Review).

## 🔄 Lifecycle States
*   **Empty State:** Shown if no words are saved:
    ```
    No saved words yet
    Save important vocabulary while studying.
    
    [ Browse Dictionary ]
    ```
    *(Displays a subtle grayed background illustration above the CTA).*
*   **Loaded:** Groups items chronologically and live-filters based on search queries.
*   **Undo Toast Pending:** Displays a snackbar showing `Word removed from Saved list. [ Undo ]`. The item remains in a temporary buffer for `3 seconds` before writing the delete transaction to the SQLite database.

## 🖐️ Interactions
*   **Tap Star Icon or Swipe Left:** Initiates the 3-second undo delay, temporarily removing the tile visually and spawning the Undo toast. Tapping `Undo` returns the item immediately with no database changes.
*   **Tap Tile or Swipe Right:** Opens [03_word_details](file:///home/mamun/wordsmart/docs/ui/screen_specs/03_word_details.md).
*   **Long Press Tile:** Opens a quick preview dialog overlay showing pronunciation, definition translation, shortcut audio button, and bookmark toggle without navigating away from the list page.
*   **Stories Integration:** If a saved word is encountered inside the story reader, the reader's bottom sheet automatically highlights its status by showing a `Saved` tag.

## 📐 Responsive Behavior
*   **Phones (<600dp):** Vertical single-column list view.
*   **Tablets (600–840dp):** Shifts into a two-column vertical list for dense scanning.
*   **Desktops (>840dp):** Centered layout capped at `800dp` maximum width.

## ♿ Accessibility
*   Includes buttons for all swipe gestures to ensure access for motor-impaired users.
*   Tap targets for star icons are padded to a minimum of `48dp`.
*   Feedback actions play light haptic clicks for toggle/preview, and success ticks on undo recovery.

## 🛠️ Flutter Notes
*   Construct the page using a `CustomScrollView` with a `SliverAppBar` (containing title/summary), a `SliverPersistentHeader` (pinned filter panel), and a `SliverList` or `SliverAnimatedList` to handle slide dismiss animations smoothly.
*   State management uses a Riverpod provider to query `BookmarkRepository` and `ProgressRepository` dynamically, combining data.

## 📋 Session Rules
*   **Local Persistence:** Saved words are stored in local SQLite tables and persist across restarts.
*   **Delayed Deletion:** Removing an item triggers a `3-second` delay before committing changes to SQLite.
*   **Context Scope:** Search inputs and filters apply only to items in the saved collection.
*   **Preference Caching:** Filter toggles and sorting selections are cached and restored automatically.
*   **Session Cross-linking:** Saved items can be loaded directly into customized Review Sessions and Quizzes.
*   **Global Synchronization:** Adding or removing saved words from details or story pages updates the Saved Library instantly.
