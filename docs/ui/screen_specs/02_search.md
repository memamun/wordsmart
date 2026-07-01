# Screen Specification: 02_search

## 🎯 Purpose
Provide an instant, simple, and distraction-free search experience for dictionary lookups, giving absolute priority to exact headword matches. The layout behaves as a strict state-machine, showing only relevant widgets for the user's active search phase.

## 🏆 User Goal
Type a query, navigate autocomplete suggestions, locate an exact word match instantly, and explore related search results.

## 🧭 Entry / Exit
*   **Entry:** Tapping the search bar on Home screen ([01_home](file:///home/mamun/wordsmart/docs/ui/screen_specs/01_home.md)).
*   **Exit:** 
    *   Tapping the Back arrow $(<)$ returns to Home ([01_home](file:///home/mamun/wordsmart/docs/ui/screen_specs/01_home.md)).
    *   Selecting a word suggestion, exact match, or search result opens Word Details ([03_word_details](file:///home/mamun/wordsmart/docs/ui/screen_specs/03_word_details.md)).

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Active Search Input Field (Back arrow, input, clear button).
*   **Tier 2 (Secondary Context):** Suggestions autocomplete lists (during typing state), Exact Match Card (highlighted at the top of submitted results).
*   **Tier 3 (Supporting Actions):** Recent Searches / Discover Section (initial state), Related Results list (submitted state).

## 📐 Layout Structure
The search screen is built as a state-based layout. Pinned components stay anchored at the top, while content views scroll underneath.

```
[ Pinned Active Search Input Bar ]
  - Leading: Back arrow (<)
  - Center: Query input text
  - Trailing: Clear (X)
               ↓
+---------------------------------------------+
| STATE A: INITIAL / EMPTY STATE              |
|                                             |
| RECENT SEARCHES                             |
| • abase (x)   • aberration (x)              |
| [ Clear All ]                               |
|                                             |
| DISCOVER                                    |
| • Popular searches: GRE, SAT, Academic      |
| • Random Word recommendation                |
| • Recently Added list                       |
+---------------------------------------------+
| STATE B: TYPING STATE                       |
|                                             |
| SUGGESTIONS (Autocomplete dropdown list)     |
| • ab...                                     |
| • aba...                                    |
| • abat...                                   |
| (Arrow keys select, Enter submits query)    |
+---------------------------------------------+
| STATE C: SUBMITTED RESULTS STATE            |
|                                             |
| EXACT MATCH (Highlighted Card Component)    |
| +-----------------------------------------+ |
| | ABATE (verb)                            | | <- Lean card component ⭐
| | বাংলা: প্রশমিত হওয়া                        | |
| | to reduce or subside                    | |
| +-----------------------------------------+ |
|                                             |
| RELATED RESULTS (Ranked matches listing)    |
| 1. abash (verb) - to embarrass            | | <- No duplicates of exact match ⭐
| 2. abdicate (verb) - to give up power      | | <- Lean details (no phonetics) ⭐
+---------------------------------------------+
```

## 🧩 Components
1.  **Active Search Input Bar:** Focused text field displaying a leading Back arrow $(<)$, query text input box, and trailing Clear $(X)$ button. (Placeholder microphone icons are hidden).
2.  **Recent Searches List:** Displays a maximum of **10 latest items** ordered newest first (caching up to 50 items in local database history). Each row features a trailing delete button. Tapping `Delete` removes the history item and spawns an Undo toast with a `3-second` buffer. A "Clear All" text button sits at the footer.
3.  **Discover Panel:** Rendered when history is empty:
    *   *Popular Tags:* Horizontal chips (e.g. GRE, SAT, Academic).
    *   *Random Word:* Displays a fresh word headword and meaning block.
    *   *Recently Added:* Displays 3 recently imported words.
4.  **Suggestions List (Autocomplete):** Vertical overlay listing query completions.
    *   **Keyboard Navigation Rule:** Suggestion lists support arrow key highlights (Up/Down) and selection (Enter) via Flutter's `Shortcuts`, `Actions`, and `FocusTraversal` systems.
5.  **Exact Match Card:** Renders the standard WordSmart **Featured Card** component when the query matches a headword exactly.
6.  **Related Results List:** Vertical list showing related vocabulary matches. Result item layout displays spelling, POS chip, Bengali translation, and definition snippets. (Phonetics and pronunciation audio are moved to the details screen to maintain a lean, scan-friendly search layout).
7.  **No Results Panel:** Displays: *"No matches found. Check spelling."*

## 🧱 Search Behavior Rules
The Search screen acts as a strict local query engine:
*   **Debounced Queries:** Queries execute after a **300ms debounce** to protect SQLite read limits.
*   **No Simultaneous Views:** Suggestions autocomplete lists and results lists are mutually exclusive. Once results are submitted, suggestions disappear.
*   **Optimistic sqlite Search:** Queries execute locally. Optimistic updates are used with no shimmer overlays or spinners.
*   **Duplicate Prevention:** The exact match item is removed from the related results list.
*   **Keyboard Retention:** The software keyboard remains open when query results update.
*   **Session Persistence:** Query string, scroll coordinates, and search results lists are cached in memory during active sessions. Navigating back from Details restores this state instantly.

## 🔄 Lifecycle States
*   **Initial:** Query is empty; renders recent searches / Discover panel. Keyboard is open.
*   **Typing:** Shows autocomplete suggestions dropdown list only.
*   **Results (Submitted):** Shows exact match card and related results list.
*   **No Results:** Shows spelling recommendations fallback panel.
*   **Error:** Shows: *"Query lookup failed. Tap to retry."*

## 🖐️ Interactions
*   **Clear query:** Tapping $(X)$ clears text, resets state to Initial, and retains keyboard focus.
*   **Open Details:** History updates **only** when a word details screen is opened, never during autocomplete typing loops.

## 🎬 Animations
*   **Search Hero Morph:** Morph transition morphs search bars on entry.
*   **State CrossFade:** Changing between Initial, Typing, and Submitted states executes a `CrossFade` animation over `150ms`.

## 📐 Responsive Behavior
*   **Phones (<600dp):** Full-screen list views.
*   **Tablets & Desktops (>600dp):** Capped card container width locked to `800dp` centered on screen.

## ♿ Accessibility
*   Autofocus requests keyboard focus instantly on page entry.
*   Screen readers announce: *"X results found"* whenever results list updates.

## 🛠️ Flutter & Riverpod Clean State Architecture
*   **Sealed State Pattern:** Manage states using Dart sealed classes:
    ```dart
    sealed class SearchState {}
    class SearchInitial extends SearchState { final List<String> history; }
    class SearchTyping extends SearchState { final List<String> suggestions; }
    class SearchResults extends SearchState { final Word? exactMatch; final List<Word> relatedResults; }
    class SearchNoResults extends SearchState {}
    class SearchError extends SearchState { final String message; }
    ```
*   **Unidirectional Flow:**
    `SearchController` $\rightarrow$ `Debouncer` $\rightarrow$ `SearchUseCase` $\rightarrow$ `VocabularyRepository` $\rightarrow$ `SQLiteDataSource`.
*   Ensure suggestions select highlights map to `FocusNode` traversals.

## 🗂️ Search Scope (Future Ready)
*   **Current default:** All Vocabulary index.
*   **Future scopes:** Collections, Stories, Bookmarks, Roots (reserved in repository layers).

## ⏱️ Performance Targets
*   **Keyboard Appears:** $< 100\text{ms}$
*   **Local SQLite suggestions lookup:** $< 100\text{ms}$
*   **Local SQLite results lookup:** $< 150\text{ms}$
*   **Details Navigation:** $< 200\text{ms}$
*   **Frame rate:** Capped at `60fps` (or maximum `120fps`) during scroll sweeps.

## ✅ Success Criteria
The Search screen should allow users to:
1.  Begin typing immediately upon entry.
2.  Navigate suggestion items using software keyboard arrows.
3.  Verify that search inputs, scroll coordinates, and lists persist when returning from Details.
4.  Remove history items and recover them instantly via a 3-second Undo snackbar.
5.  Locate exact matches within **1 tap** from typing.
