# Screen Specification: 02_search

## 🎯 Purpose
Provide an instant, simple, and distraction-free search experience for dictionary lookups.

## 🏆 User Goal
Type query, view suggestions, and select a word to open its details.

## 🧭 Entry & Exit Points
*   **Entry:** Tapping the search bar on Home screen.
*   **Exit:** 
    *   Tapping Back arrow $(<)$ $\rightarrow$ Returns to Home (01_home).
    *   Selecting a result/suggestion $\rightarrow$ Opens Word Details (03_word_details).

## 🧩 Components
1.  **Active Search Input:** Focused text field with clear $(X)$ button.
2.  **Recent Searches List:** Displayed when search input is empty.
3.  **Autocomplete Suggestions:** Real-time dropdown suggestions.
4.  **Search Results List:** Complete matching results with definition preview.
5.  **No Results Panel:** Typography-only empty state.

## 🔄 Lifecycle States
*   **Initial:** Shows recent searches history.
*   **Typing:** Suggestions list updates in real-time.
*   **Searching:** Tonal skeleton loader pulses during active query lookups.
*   **Results:** Displays matching list of word items.
*   **No Results:** Displays *"No matches found. Check spelling."*

## 🖐️ Interactions & Gestures
*   **Query Input:** Triggers query search with **300ms debouncing** to prevent database overload.
*   **Clear Button:** Tapping $(X)$ clears the search bar instantly and retains keyboard focus.

## 🎬 Animations
*   **Screen Slide:** Transition slides the page from right-to-left over `200ms`.
*   **Suggestion Fade:** Suggestions fade in smoothly (`150ms`).

## ♿ Accessibility
*   Text input uses semantic autocomplete triggers.
*   Suggestions list elements have minimum height of `48dp`.

## 🛠️ Flutter Implementation Notes
*   Implement search state using `SearchState` and Riverpod providers.
*   Bind keyboard actions (`textInputAction: TextInputAction.search`) to execute search on keyboard submit.
*   Ensure text field automatically triggers focus via `FocusNode.requestFocus()` on page entry.
