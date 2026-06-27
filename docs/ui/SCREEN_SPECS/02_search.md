# Screen Specification: 02_search

## 🎯 Purpose
Provide an instant, simple, and distraction-free search experience for dictionary lookups, giving absolute priority to exact matches.

## 🏆 User Goal
Type a query, view autocomplete suggestions, locate an exact word match instantly, and explore related search results.

## 🧭 Entry & Exit Points
*   **Entry:** Tapping the search bar on Home screen (01_home).
*   **Exit:** 
    *   Tapping Back arrow $(<)$ $\rightarrow$ Returns to Home (01_home).
    *   Selecting a word suggestion, exact match, or search result $\rightarrow$ Opens Word Details (03_word_details).

---

## 🧭 Search Flow Sequence

```
[ Search Input Field ]
         ↓
[ Recent Searches / Popular Searches ] (If input is empty)
         ↓
[ Typing State (Debounced 300ms) ]
         ↓
[ Autocomplete Suggestions List ]
         ↓
[ EXACT MATCH (Highlighted Separately at Top) ] (If available)
         ↓
[ OTHER RELATED RESULTS LIST ]
```

---

## 🧩 Components

1.  **Active Search Input:** Focused text field with clear $(X)$ button and leading back arrow $(<)$.
2.  **Recent Searches List:** Horizontal or vertical list displayed when input is empty. Includes a "Clear History" button.
3.  **Exact Match Card:** A prominent Level 1 surface card placed at the very top of results when the typed query matches a database headword exactly.
    *   *Aesthetics:* Features a subtle Amber highlight border and displays the word in Outfit Bold (`22sp`) with a Teal definition preview.
4.  **Other Results List:** A vertical, scrollable list of broader matches (spelling approximations, prefix matches, synonym matches) separated by thin dividers.
5.  **No Results Panel:** Typography-only empty state.

---

## 🔄 Lifecycle States

*   **Initial:** Keyboard is open; shows recent searches.
*   **Typing / Suggestions:** Input field has text; reveals real-time Suggestions list.
*   **Searching:** Tonal skeleton shimmer loader pulses below the search bar.
*   **Results:** Displays the **Exact Match** card (if found) followed by the **Other Results** list.
*   **No Results:** Displays: *"No matches found. Check spelling."* with a CTA to browse the A-Z directory.
*   **Offline:** Uses cached search index from SQLite; hides network suggestion overlays.

---

## 🖐️ Interactions & Gestures
*   **Query Input:** Triggers query search with **300ms debouncing** to protect database I/O performance.
*   **Clear Button:** Tapping $(X)$ clears text instantly, resets results state, and retains keyboard focus.
*   **Select Word:** Tapping any search row opens Details.

---

## 🎬 Animations
*   **Screen Morph:** The Search Bar dummy container from the Home screen morphs into the active Search Input via a **Hero animation**.
*   **Fade-In Results:** Results list and Exact Match card fade in over `150ms`.

---

## ♿ Accessibility
*   Autofocus activates the soft keyboard automatically on entry.
*   The "Exact Match" block is announced explicitly by screen readers: *"Exact match found: [Word]. Tap to view details."*
*   Touch targets for all list rows are at least `48dp` high.

---

## 🛠️ Flutter Implementation Notes
*   Manage search state using `SearchState` and Riverpod providers.
*   Separate the database query into two logical steps:
    1.  `SELECT * FROM words WHERE word = ? LIMIT 1` (to extract the exact match).
    2.  `SELECT * FROM words WHERE word LIKE ? OR definition LIKE ?` (to load the broader related results).
*   Ensure text field automatically triggers focus via `FocusNode.requestFocus()` on page entry.
*   Use `keyboardType: TextInputType.text` and `textInputAction: TextInputAction.search`.

---

## ✅ Screen Success Criteria

A successful Search screen should allow users to:
*   Start typing immediately upon transition (zero latency focus).
*   Locate and open the exact match within **1 tap** from typing.
*   Reset the search screen with **1 tap** on the clear button.
*   Retrieve and render search suggestions/results within **150ms** after debouncing.
