# Screen Specification: 02_search

## 🎯 Purpose
Provide an instant, simple, and distraction-free search experience for dictionary lookups, giving absolute priority to exact matches.

## 🏆 User Goal
Type a query, view autocomplete suggestions, locate an exact word match instantly, and explore related search results.

## 🧭 Entry / Exit
*   **Entry:** Tapping the search bar on Home screen (01_home).
*   **Exit:** 
    *   Tapping Back arrow $(<)$ $\rightarrow$ Returns to Home (01_home).
    *   Selecting a word suggestion, exact match, or search result $\rightarrow$ Opens Word Details (03_word_details).

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Active Search Input Field (with trailing clear and placeholder voice mic indicators).
*   **Tier 2 (Secondary Context):** Suggestions autocomplete dropdowns (while typing), Exact Match Card (highlighted at the top of results list).
*   **Tier 3 (Supporting Actions):** Recent Searches / Popular Searches lists, Related Results list.

## 📐 Layout Structure
The search screen features a layout that dynamically adjusts based on typing status.

```
[ Pinned Active Search Input Bar ]
  - Leading: Back arrow (<)
  - Center: Query input text
  - Trailing: Clear (X) | Future Mic icon
               ↓
+---------------------------------------------+
| RECENT SEARCHES                             | <- When input is empty
| • abase (x)   • aberration (x)              |
| [ Clear All ]                               |
+---------------------------------------------+
| SUGGESTIONS (Autocomplete list)             | <- While typing, before submit
| • ab...                                     |
| • aba...                                    |
+---------------------------------------------+
| EXACT MATCH (Highlighted Separately)        | <- Search results loaded
| +-----------------------------------------+ |
| | ABATE (v.) [uh-bayt]                    | | <- Standard Featured Card component
| | definition preview | Bengali Meaning    | |
| +-----------------------------------------+ |
+---------------------------------------------+
| RELATED RESULTS                             | <- Broad matches ranked listing
| 1. abash (v.) /əˈbæʃ/                       |
| 2. abdicate (v.) /ˈæbdɪkeɪt/                |
+---------------------------------------------+
```

## 🧩 Components
1.  **Active Search Input:** Focused text field with clear $(X)$ button, leading back arrow $(<)$, and a disabled/placeholder microphone icon reserving UI space for future voice search.
2.  **Recent Searches List:** Displays a maximum of **10 items** ordered newest first. Each row features a trailing delete button. A "Clear All" text button sits at the footer.
    *   *Empty History State:* If history is empty, recent searches are replaced by a grouped list of **Popular Searches**, **Hit Parade** terms, and a **Random Word** recommendation.
3.  **Exact Match Card:** Employs the standard WordSmart **Featured Card** component from the Design System. Placed at the top of results when query matches a headword exactly.
4.  **Related Results List:** Vertical list showing related vocabulary matches. Result item layout displays: *Word $\rightarrow$ Pronunciation $\rightarrow$ POS Chip $\rightarrow$ Definition $\rightarrow$ Bengali Meaning (optional)*.
5.  **No Results Panel:** Typography-only empty state.

## 🔄 Lifecycle States
*   **Initial:** Keyboard is open; shows recent searches (or popular list fallback).
*   **Typing:** Autocomplete suggestions update continuously in real-time. Results update continuously in the background. No loading indicators or pulsing skeletons are shown during normal typing to preserve the feeling of instant local lookup.
*   **Results:** Displays the **Exact Match** card (if found) followed by the **Related Results** list (capped at a maximum of **20 visible results** using lazy loading).
*   **No Results:** Displays: *"No matches found. Check spelling."*
*   **Offline:** Uses cached search index from SQLite; hides network suggestion overlays.

## 🖐️ Interactions
*   **Query Input:** Triggers query search with **300ms debouncing** to protect local SQLite database performance.
*   **Recent Swipe/Delete:** Swiping left on a recent search item removes it from local history.
*   **Clear Button:** Tapping $(X)$ clears text instantly, resets results state, and retains keyboard focus.
*   **History Addition Rule:** A search term is added to the user's history **only** when they tap and open its Word Details screen, never while typing.

## 🎬 Animations
*   **Screen Morph:** The Search Bar dummy container from the Home screen morphs into the active Search Input via a **Hero animation**.
*   **Fade-In Results:** Results list and Exact Match card fade in over `150ms`.

## 📐 Responsive Behavior
*   **Phone (<600dp):** Full-screen search layout, results lists scroll vertically in single-column.
*   **Tablet & Desktop (>600dp):** Search results list and Exact Match card display in a centered layout with a maximum width of `800dp` to maintain optimal scanning width.

## ♿ Accessibility
*   Autofocus activates the soft keyboard automatically on entry.
*   Announces *"X results found"* via screen reader accessibility triggers whenever the results list updates.
*   Touch targets for all list rows are at least `48dp` high.

## 🛠️ Flutter Notes
*   Manage search state using `SearchState` and Riverpod providers.
*   **Repository Responsibilities:**
    *   Resolve exact headword match.
    *   Resolve related matches.
    *   Return ranked search results.
*   Ensure text field automatically triggers focus via `FocusNode.requestFocus()` on page entry.
*   Use `keyboardType: TextInputType.text` and `textInputAction: TextInputAction.search`.

---

## 🗂️ Search Ranking Rules
Matches must be returned ordered strictly by relevance:
1.  **Exact Headword Match** (e.g. Query "abate" matches "abate")
2.  **Prefix Match** (e.g. Query "aba" matches "abash", "abate")
3.  **Whole Word Match** (e.g. Query word matches compound word parts)
4.  **Derivative Match** (e.g. Query matches derivative form suffixes)
5.  **Synonym Match** (e.g. Query matches related synonym metadata)
6.  **Definition Match** (e.g. Query word is found in English/Bengali descriptions)
7.  **Fuzzy Match (Future)** (e.g. Minor spelling typos corrected automatically)

---

## ⏱️ Performance Targets
*   **Keyboard Appears:** $< 100\text{ms}$
*   **Suggestions Load:** $< 100\text{ms}$
*   **Results Load:** $< 150\text{ms}$
*   **Details Navigation:** $< 200\text{ms}$

---

## ✅ Success Criteria
A successful Search screen should allow users to:
*   Start typing immediately upon transition (zero latency focus).
*   Locate and open the exact match within **1 tap** from typing.
*   Find the desired word using no more than **3 to 4 keystrokes** on average.
*   Reset the search screen with **1 tap** on the clear button.
*   Retrieve and render search suggestions/results within **150ms** after debouncing.
