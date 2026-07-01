# Screen Specification: 07_bookmarks

## 🎯 Purpose
A saved dictionary repository allowing users to organize, filter, and review words they have bookmarked.

## 🏆 User Goal
Search saved words, filter by part of speech or mastery level, and manage bookmarked words with safety.

## 🧭 Entry / Exit
*   **Entry:** Tapping "Bookmarks" tab on bottom navigation bar.
*   **Exit:** 
    *   Tapping any word $\rightarrow$ Opens Word Details (03_word_details).
    *   Tapping other BottomNavBar tabs.

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Bookmarked words list, search input.
*   **Tier 2 (Secondary Context):** Filter chips (POS, learning state).
*   **Tier 3 (Supporting Actions):** Star toggle icon, undo toast notification.

## 📐 Layout Structure
The Bookmarks screen displays a clean, filterable list of all saved words. Side margins are `24dp`.
```
+---------------------------------------------------+
|  [Bookmarks]                                      | <- Screen Header (Outfit Bold, 28sp)
+---------------------------------------------------+
|  [  Search bookmarked words...  ]                 | <- Contextual Search Input
+---------------------------------------------------+
|  (All)   (Learning)   (Mastered)   (Nouns)        | <- Filter Chips row
+---------------------------------------------------+
|                                                   |
|  ABASH                                      (⭐) | <- Saved Word Item 1
|  To embarrass or make ashamed.                    |
|  -----------------------------------------------  | <- Divider
|  ABATE                                      (⭐) | <- Saved Word Item 2
|  To subside or reduce.                            |
|                                                   |
+---------------------------------------------------+
```

## 🧩 Components
1.  **Contextual Search:** Small text field searching exclusively inside bookmarks.
2.  **Filter Chip Row:** Horizontal scrollable row of status filters (All, Learning, Mastered, Nouns).
3.  **Saved List:** Scrollable list of borderless word tiles.
4.  **Bookmark Toggle:** Solid Amber star (`#FFB900`) representing saved state.

## 🔄 Lifecycle States
*   **Empty:** Displays fallback text and illustration:
    *   *"No bookmarked words yet."*
    *   *"Save important words while studying."*
    *   `[Browse Words]` CTA button.
*   **Loaded:** Displays list of saved words.
*   **Undo Pending:** Temporarily preserves toggled-off item, shows Undo toast.

## 🖐️ Interactions
*   **Tap Bookmark Star:** Changes star to outline. Triggers **3-second delay** and displays Undo Toast before removing word from local list.
*   **Tap Filter Chip:** Updates query filter instantly.

## 🎬 Animations
*   **Undo Toast Slide:** Toast slides up from bottom (`150ms`).
*   **Item Dismiss:** Item slides horizontally off the list when deleted.

## 📐 Responsive Behavior
*   **Phone (<600dp):** Single-column vertical list layout.
*   **Tablet & Desktop (>600dp):** Centered grid layout displaying saved words in card layout columns to maximize canvas usage.

## ♿ Accessibility
*   Accidental deletion prevention prevents immediate list shifting, aiding motor control accessibility.
*   Each list item has clear screen reader announcement for word details.

## 🛠️ Flutter Notes
*   Use Riverpod provider to manage the filtered list state.
*   Implement deletion delay inside the Notifier class using a Dart `Timer` that triggers database transaction upon expiration unless cancelled.

## ✅ Success Criteria
A successful Bookmarks screen should allow users to:
*   Locate and search a bookmarked word within **2 seconds** of landing.
*   Toggle filters (e.g. Nouns) with **1 tap** on chips.
*   Remove word from bookmarks with **1 tap** on star.
*   Accidental removal recovered immediately with **1 tap** on the Undo toast.
