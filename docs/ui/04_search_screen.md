# WordSmart Home / Search Screen Wireframe & Spec

This document defines the layout, state transitions, and component hierarchy for the primary **Home / Search** screen of WordSmart.

---

## 🏛️ Layout Structure (Top-to-Bottom)

The screen is a scrollable container with a fixed Bottom Navigation Bar. Spacing aligns to the 8dp grid, and screen side margins are **24dp**.

```
+---------------------------------------------------+
|  [WordSmart]                             (Avatar) | <- Top App Bar
+---------------------------------------------------+
|                                                   |
|      [   Search 1,900+ vocabulary words...   ]    | <- Large Search Bar
|                                                   |
+---------------------------------------------------+
|  +---------------------------------------------+  |
|  | Today's Progress: 12 Words Left    [Resume] |  | <- Continue Learning Card
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  +---------------------------------------------+  |
|  | 15 Due for Review     (Teal 72% Mastery)    |  | <- Review Due Card
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  WORD OF THE DAY                                  | <- Section Header
|  +---------------------------------------------+  |
|  |  ABATE                                 (🔊) |  | <- display-word (Outfit Bold)
|  |  [uh-bayt]   (v.)                       (⭐) |  | <- Pronunciation, Chip, Bookmark
|  |                                             |  |
|  |  অনুবাদ: প্রশমিত হওয়া / হ্রাস পাওয়া             |  | <- Hind Siliguri Bengali
|  |  Definition: to subside; to reduce          |  | <- Inter Definition
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  QUICK PRACTICE                                   | <- Section Header
|  [ Quiz ]   [ Flashcards ]   [ Story ]   [ Saved ] | <- Grid of Circular Actions
+---------------------------------------------------+
|  HIT PARADE (HIGH FREQUENCY)                      | <- Section Header
|  1. ABASH      (v.)  To embarrass or make...  (>) | <- Row 1
|  2. ABDICATE   (v.)  To step down from a...   (>) | <- Row 2
|  3. ABERRATION (n.)  A deviation from standard (>) | <- Row 3
+---------------------------------------------------+
|  [Home]  [Study]  [Bookmarks]  [Profile]         | <- bottom navigation bar
+---------------------------------------------------+
```

---

## 📝 Component Specifications

### 1. Top App Bar
*   **Title:** `WordSmart` styled in Outfit SemiBold (`28sp`, `#F5F5F5`).
*   **Actions:** Right-aligned circular avatar (`32dp` diameter) linking to Profile.
*   **Elevation:** `0dp` (merges flatly into background).

### 2. Large Search Bar
*   **Implementation:** Follows `Search Bar` reusable spec.
*   **Margins:** Top `16dp`, Bottom `24dp`.
*   **Focus Behavior:** Tapping launches the **Search Results Page** with overlay transition (no new page load, just state swap).

### 3. Continue Learning & Review Cards
*   **Layout:** Two adjacent columns (or two stacked cards depending on screen width).
*   **Style:** Translucent Level 1 surface, no border lines, `16dp` rounded corners.
*   **Teal progress bar** indicates mastery score.

### 4. Word of the Day (Hero)
*   **Style:** Translucent Level 1 surface with a subtle Amber drop glow (`rgba(255, 185, 0, 0.08)` shadow).
*   **Word:** "ABATE" displayed in Outfit Bold (`48sp`, `#FFB900`).
*   **POS Chip:** Small pill, background `rgba(38, 166, 154, 0.1)`, text Teal `v.`.
*   **Interactive Buttons:** Play Audio (🔊) and Toggle Bookmark (⭐) right-aligned.

### 5. Quick Practice Grid
*   **Layout:** Row of 4 items with equal spacing.
*   **Buttons:** Circular glass surfaces (`56dp` diameter) with minimal outline and monochrome icons representing Quiz, Flashcards, Story Reader, and Bookmarks.

### 6. Hit Parade List
*   **Header:** `HIT PARADE` styled in Outfit SemiBold (`20sp`, `#B0B0B0`), uppercase, with leading spacing.
*   **List Item:**
    *   Left-aligned rank number in JetBrains Mono (`14sp`).
    *   Headword in Outfit SemiBold (`18sp`, `#F5F5F5`).
    *   POS Tag in JetBrains Mono (`12sp`, `#B0B0B0`).
    *   Right-aligned grey Chevron icon (`>`).
    *   Divider: `1px` thin divider line separating items.

---

## 🔄 Interaction States & Rules
*   **Scroll Behavior:** The page scrolls vertically with a standard Material physics friction. The Top App Bar stays pinned or scrolls off dynamically (Sliver).
*   **Loading State:** Replaces cards with pulsing light gray skeletons.
*   **Offline State:** Displays the last cached Word of the Day.
