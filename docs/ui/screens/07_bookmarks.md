# Screen Specification: 07_bookmarks

## 🎯 Purpose
A saved dictionary repository allowing users to organize, filter, and review words they have bookmarked.

## 🏆 User Goal
Search saved words, filter by part of speech or mastery level, and remove bookmarks.

## 🧭 Entry & Exit Points
*   **Entry:** Tapping "Bookmarks" tab on bottom navigation bar.
*   **Exit:** 
    *   Tapping any word $\rightarrow$ Opens Word Details (03_word_details).
    *   Tapping other BottomNavBar tabs.

## 🧩 Components
1.  **Contextual Search:** Small text field searching exclusively inside bookmarks.
2.  **Filter Chip Row:** Horizontal scrollable row of status filters (All, Learning, Mastered, Nouns).
3.  **Saved List:** Scrollable list of borderless word tiles.
4.  **Bookmark Toggle:** Solid Amber star (`#FFB900`) representing saved state.

## 🔄 Lifecycle States
*   **Empty:** Displays fallback text: *"Start bookmarking words."*
*   **Loaded:** Displays list of saved words.
*   **Undo Pending:** Temporarily preserves toggled-off item, shows Undo toast.

## 🖐️ Interactions & Gestures
*   **Tap Bookmark Star:** Changes star to outline. Triggers **3-second delay** and displays Undo Toast before removing word from local list.
*   **Tap Filter Chip:** Updates query filter instantly.

## 🎬 Animations
*   **Undo Toast Slide:** Toast slides up from bottom (`150ms`).
*   **Item Dismiss:** Item slides horizontally off the list when deleted.

## ♿ Accessibility
*   Accidental deletion prevention prevents immediate list shifting, aiding motor control accessibility.
*   Each list item has clear screen reader announcement for word details.

## 🛠️ Flutter Implementation Notes
*   Use Riverpod provider to manage the filtered list state.
*   Implement deletion delay inside the Notifier class using a Dart `Timer` that triggers database transaction upon expiration unless cancelled.
