# Bookmarks Screen Wireframe & Spec

This document defines the layout, filter chips, and interactive states for the saved vocabulary repository.

---

## 🏛️ Layout Structure (Top-to-Bottom)

The Bookmarks screen displays a clean, filterable list of all saved words. Side margins are **24dp**.

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
|  -----------------------------------------------  |
|  ABERRATION                                 (⭐) | <- Saved Word Item 3
|  A deviation from typical standard.               |
|                                                   |
+---------------------------------------------------+
```

---

## 📝 Component Specifications

### 1. Filter Chips Row
*   **Style:** Horizontal scrolling row of chip components.
*   **Selected State:** Filled Teal background (`rgba(38, 166, 154, 0.1)`) with solid Teal text.
*   **Unselected State:** Outline `rgba(255, 255, 255, 0.08)`, text `#B0B0B0`.

### 2. Saved Word Row Items
*   **Style:** Borderless list layout using `16dp` vertical spacing.
*   **Word:** Outfit SemiBold (`18sp`, `#F5F5F5`).
*   **Definition:** Inter Regular (`15sp`, `#B0B0B0`).
*   **Bookmark Toggle Icon:** Active solid Amber star (`#FFB900`).

---

## 🔄 Interaction & Accidental Removal Prevention
*   **Accidental Removal Prevention Rule:** Tapping the bookmark icon (⭐) toggles the star to hollow outline. However, to prevent accidental item deletion from the screen, the row **must not disappear immediately**.
*   **Undo Toast:** An undo toast appears at the bottom of the screen saying: *"Word removed from bookmarks"* with an `[Undo]` button.
*   **Deletion Delay:** The item is removed from the visible list only after a `3-second` delay or when the user navigates away from the screen, allowing immediate recovery of bookmarked data.
