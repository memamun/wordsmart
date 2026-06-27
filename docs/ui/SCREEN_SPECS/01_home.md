# Screen Specification: 01_home

## 🎯 Purpose
The landing page and primary visual center of the application. It establishes the calm, reading-focused vocabulary experience immediately upon launch, greeting the personalized user session.

## 🏆 User Goal
Search for a word, view the daily word, check learning progress, view recent study history, and launch review drills.

## 🧭 Entry / Exit
*   **Entry:** App boot/launch, or tapping the "Home" tab on BottomNavBar.
*   **Exit:** 
    *   Tapping Search Bar $\rightarrow$ Instantly pops active suggestions panel (02_search).
    *   Tapping Word of the Day or Recent Words $\rightarrow$ Opens Word Details (03_word_details).
    *   Tapping Quick Practice $\rightarrow$ Opens Flashcards (04_flashcards) or Quiz (05_quiz).

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Active Search Bar, Word of the Day.
*   **Tier 2 (Secondary Context):** Continue Learning (Streak & Progress), Review Due, Recent Words.
*   **Tier 3 (Supporting Actions):** Quick Practice (Quiz/Cards/Stories/Saved), Hit Parade list.

## 📐 Layout Structure
The Home screen is organized in a clean vertical stack.
```
+---------------------------------------------------+
|  [Welcome Back, User]                    (Avatar) | <- Top App Bar
+---------------------------------------------------+
|                                                   |
|      [   Search 1,900+ vocabulary words...   ]    | <- Search Bar (readOnly = true)
|                                                   |
+---------------------------------------------------+
|  +---------------------------------------------+  |
|  | Today's Goal: 8 / 20 words     ██████░░░░   |  | <- Continue Learning Card (with progress bar)
|  | [Resume]                                    |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  +---------------------------------------------+  |
|  | Review Due: 15 words     (Est: 4 min)       |  | <- Review Due Card
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  WORD OF THE DAY                                  | <- Section Header
|  +---------------------------------------------+  |
|  |  ABATE                                 (🔊) |  | <- display-word (Outfit Bold)
|  |  [uh-bayt]   (v.)                       (⭐) |  | <- Pronunciation, POS Chip, Bookmark
|  |                                             |  |
|  |  অনুবাদ: প্রশমিত হওয়া                          |  | <- Hind Siliguri Bengali
|  |  Definition: to subside; to reduce          |  | <- Inter Definition
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  QUICK PRACTICE                                   | <- Section Header
|  [ Quiz (Primary) ]   [ Flashcards (Primary) ]    | <- Prominent study buttons
|  Stories (Muted text)   Bookmarks (Muted text)    | <- Muted secondary options
+---------------------------------------------------+
|  RECENT WORDS                                     | <- Section Header
|  • ABASH (v.)  • ABERRATION (n.)  • ABDICATE (v.) | <- Horizontal scroll list
+---------------------------------------------------+
|  HIT PARADE (HIGH FREQUENCY)                      | <- Section Header
|  1. ABASH      (v.)  To embarrass or make...  (>) | <- Row 1
|  2. ABDICATE   (v.)  To step down from a...   (>) | <- Row 2
|  3. ABERRATION (n.)  A deviation from standard (>) | <- Row 3
|  [ See All ]                                      | <- Max 3 items + See All CTA
+---------------------------------------------------+
|  [Home]  [Study]  [Bookmarks]  [Profile]         | <- bottom navigation bar
+---------------------------------------------------+
```
*   **Above the Fold:** Search Bar, Continue Learning Card, Review Due Card, and Word of the Day header.
*   **Below the Fold:** Quick Practice, Recent Words, and Hit Parade list.

## 🧩 Components
1.  **Top App Bar:** Personalized welcome title and circular Profile avatar.
2.  **Search Bar:** Material 3 `SearchBar` configured with `readOnly = true` and dynamic hints.
3.  **Continue Learning Card:** Level 1 surface card with streak fire icon and Teal block progress bar `██████░░░░` with `Resume` CTA.
4.  **Review Due Card:** Level 1 card indicating due review counts and estimated completion duration.
5.  **Word of the Day Card:** Translucent card featuring large display word, part of speech chip, Bengali Hind Siliguri translation, English Inter definition, play button, and star bookmark toggle.
6.  **Quick Practice Row:** Row with primary filled buttons (Quiz, Cards) and secondary text buttons (Stories, Saved).
7.  **Recent Words:** A horizontal scrollable list displaying recently reviewed vocabulary words for quick recall.
8.  **Hit Parade List:** List capped at 3 high-frequency words with a `See All` CTA text button.

## 🔄 Lifecycle States
*   **Initial:** Home loads instantly showing personalized welcome message and cached Word of Day.
*   **Loading:** Pulsing shimmers match search, streak card, and Word of Day templates.
*   **Offline:** Displays cached SQLite database values, hiding the cloud sync indicators.
*   **Error:** Shows small error notice with a `Retry` button inside Card containers.

## 🖐️ Interactions
*   **Tap Search:** Triggers Hero transition to SearchSuggestions.
*   **Tap Word Card:** Tapping Word of Day opens Details.
*   **Tap Bookmark Star:** Instantly toggles bookmark with haptic click.
*   **Long Press Word of the Day:** Shows a quick definition popup bottom sheet.

## 🎬 Animations
*   **Search Hero:** Morph transition expands the Search Bar container on tap.
*   **Word of Day Hero:** Outfit display text translates to Details header.
*   **Bookmark Toggle:** Star scale bounce (`0.8x` to `1.2x` to `1.0x` over `150ms`).

## 📐 Responsive Behavior
*   **Phone (<600dp):** Vertical scroll stack with full `24dp` margins.
*   **Tablet (600–840dp):** Two-column layout: Left column = Search + Streak progress + Word of Day; Right column = Recent Words + Quick Practice + Hit Parade list.
*   **Desktop (>840dp):** Centered reading width capped at `800dp` with generous side gutters.

## ♿ Accessibility
*   Interactive buttons maintain a minimum tap target of `48dp`.
*   All progress bars and streak icons have descriptive semantic text mapping for screen readers.

## 🛠️ Flutter Notes
*   Use `SliverList` and `SliverToBoxAdapter` inside a single `CustomScrollView` for smooth scrolling.
*   Wrap the Word of the Day Hero card in a `KeepAlive` wrapper to prevent rebuilds on scroll.
*   Pre-cache the user's avatar image during app startup.
*   Mark all layout containers and static spacers as `const` widgets to minimize repaint boundaries.

## ✅ Success Criteria
A successful Home screen should allow users to:
*   Start searching within **2 seconds** of launch.
*   Resume learning within **1 tap** from the landing page.
*   Access today's review without scrolling (above the fold).
*   Identify the Word of the Day immediately upon landing.
*   Reach any primary study mode within **2 taps**.
