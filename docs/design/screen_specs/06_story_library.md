# Screen Specification: 06_story_library

## 🎯 Purpose
Provide a content browsing directory where users can discover, search, filter, and track their reading progress across dual-language vocabulary-boosting stories. It acts as the gateway to the reading loop before transitioning into the immersive reader mode.

## 🏆 User Goal
Browse stories matching their current reading levels, resume unfinished stories quickly, and find target vocabulary word counts before starting.

## 🧭 Entry / Exit
*   **Entry:** Tapping the "Stories" quick link on the Home screen ([01_home](file:///home/mamun/wordsmart/docs/ui/screen_specs/01_home.md)), or selecting the "Library" tab (Tab 3).
*   **Exit:**
    *   Tapping a story card or "Resume Reading" launches the immersive Story Reader ([06_story_reader](file:///home/mamun/wordsmart/docs/ui/screen_specs/06_story_reader.md)).
    *   Selecting other tabs on the bottom navigation bar.

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Continue Reading card, story directory list.
*   **Tier 2 (Secondary Context):** Story search input, difficulty category filters (Beginner, Intermediate, Advanced), reading duration badges.
*   **Tier 3 (Supporting Actions):** Completion checkmarks, target vocabulary counts.

## 📐 Layout Structure
The interface is scrollable vertically. Margins are `24dp` on mobile screens.

```
+---------------------------------------------------+
|  [Stories]                                        | <- Title (Outfit Bold, 28sp)
+---------------------------------------------------+
|  [ Search stories...                            ] | <- Material 3 SearchBar
+---------------------------------------------------+
|  Filter:  ( All )   ( Beginner )   ( Intermediate)  | <- Filter chips row
+---------------------------------------------------+
|  CONTINUE READING                                 | <- Section Header (Outfit SemiBold)
|  +---------------------------------------------+  |
|  |  Story 12: Echoes of the Past               |  |
|  |  ██████░░░░ 60%  •  4 min left              |  | <- Progress bar & estimate
|  |  [ Resume Reading ]                         |  | <- Primary resume button
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  ALL STORIES                                      | <- Section Header (Outfit SemiBold)
|  +---------------------------------------------+  |
|  |  Story 1: The Abatement Storm    [Beginner] |  | <- Level Tag
|  |  Words: 15  •  Time: 5 min   [✓ Completed]  |  | <- Completed status
|  +---------------------------------------------+  |
|  +---------------------------------------------+  |
|  |  Story 2: A Knight's Abdication [Intermed ] |  |
|  |  Words: 24  •  Time: 8 min   [ Not Started] |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  [Home]  [Study]  [Library]  [Profile]           | <- Bottom Navigation Bar
+---------------------------------------------------+
```

## 🧩 Components
1.  **Search Bar:**
    *   A standard Material 3 search bar for live-filtering story titles.
2.  **Filter Chips Row:**
    *   Horizontal scrollable row containing toggles: `All`, `Beginner` (CEFR A1-A2), `Intermediate` (CEFR B1-B2), `Advanced` (CEFR C1-C2).
3.  **Continue Reading Resume Widget:**
    *   A standard elevated card containing the title of the user's active story.
    *   Displays progress as a graphical bar (`██████░░░░ 60%`), estimated minutes left, and a `Resume Reading` button.
    *   **Visibility Rule:** Hidden if there are no active, unfinished stories in progress.
4.  **Story Cards List:**
    *   A list displaying cards for available stories.
    *   Each card features: Story Title, Difficulty Badge, Estimated Reading Time (e.g., `5 min`), Target Vocabulary Words count (e.g., `15`), and a status indicator (`Completed` with a green checkmark or `Not Started` in muted gray).

## 🔄 Lifecycle States
*   **Loading:** Skeletons mimic the size and spacing of story cards while retrieving records from the database.
*   **Loaded:** Displays active list sorted by latest activity first, then by difficulty.
*   **Empty:** Shown if search parameters yield no results:
    ```
    No stories match your filter query.
    [ Reset Filters ]
    ```

## 🖐️ Interactions
*   **Tap Filter Chip:** Re-filters the list dynamically.
*   **Tap Card:** Launches [06_story_reader](file:///home/mamun/wordsmart/docs/ui/screen_specs/06_story_reader.md) showing the story selected.
*   **Tap Resume:** Launches the reader automatically navigating to the user's exact saved paragraph position.

## 📐 Responsive Behavior
*   **Phones (<600dp):** Single-column layout.
*   **Tablets & Desktops (>600dp):** Layout shifts into a grid format (2 or 3 columns of cards) capped at a maximum width of `800dp`.

## ♿ Accessibility
*   Text contrast ratios meet WCAG AA standards.
*   Level and completion badges are represented using distinct icon styles and text labels, not just color codes.
*   Cards have at least `48dp` tap targets.
