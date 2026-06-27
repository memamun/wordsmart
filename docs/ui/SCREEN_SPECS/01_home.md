# Screen Specification: 01_home

## 🎯 Purpose
The landing page and primary visual center of the application. It establishes the calm, reading-focused vocabulary experience immediately upon launch, greeting the personalized user session.

## 🏆 User Goal
Search for a word, view the daily word, check learning progress, view recent study history, and launch review drills.

## 🧭 Entry & Exit Points
*   **Entry:** App boot/launch, or tapping the "Home" tab on BottomNavBar.
*   **Exit:** 
    *   Tapping Search Bar $\rightarrow$ Instantly pops active suggestions panel (02_search).
    *   Tapping Word of the Day or Recent Words $\rightarrow$ Opens Word Details (03_word_details).
    *   Tapping Quick Practice $\rightarrow$ Opens Flashcards (04_flashcards) or Quiz (05_quiz).

---

## 📊 Component Priority Matrix

*   **Tier 1 (Critical Focus):** Active Search Bar, Word of the Day.
*   **Tier 2 (Secondary Context):** Continue Learning (Streak & Progress), Review Due, Recent Words.
*   **Tier 3 (Supporting Actions):** Quick Practice (Quiz/Cards/Stories/Saved), Hit Parade list.

---

## 📐 Layout Structure (Top-to-Bottom)

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
|  RECENT WORDS                                     | <- Section Header
|  • ABASH (v.)  • ABERRATION (n.)  • ABDICATE (v.) | <- Horizontal scroll list
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
|  HIT PARADE (HIGH FREQUENCY)                      | <- Section Header
|  1. ABASH      (v.)  To embarrass or make...  (>) | <- Row 1
|  2. ABDICATE   (v.)  To step down from a...   (>) | <- Row 2
|  3. ABERRATION (n.)  A deviation from standard (>) | <- Row 3
|  [ See All ]                                      | <- Max 3 items + See All CTA
+---------------------------------------------------+
|  [Home]  [Study]  [Bookmarks]  [Profile]         | <- bottom navigation bar
+---------------------------------------------------+
```

### 📱 Information Density (Above the Fold)
To maintain immediate visual focus, the following elements must sit **above the fold** on standard 5.5" to 6.7" screens:
*   Top App Bar (Welcome back message)
*   Search Bar
*   Continue Learning Card & Review Due Card
*   Word of the Day Header (display word visible).
*   *Everything else* (Quick Practice, Recent Words, Hit Parade list) scrolls dynamically below the fold.

---

## 🧩 Component Specifications

### 1. Search Bar
*   **Implementation:** Material 3 `SearchBar`.
*   **Properties:** `readOnly = true`, displaying a flashing cursor emulation and hints.
*   **Interaction:** Tapping triggers a **Hero animation** transitioning the search container to the top of the Search Suggestions screen (02_search) with immediate soft keyboard launch.

### 2. Continue Learning Card
*   **Layout:** Level 1 surface card with streak fire icon.
*   **Goal Status:** Displays progress as numerical value `8 / 20 words` with a clean horizontal Teal block progress bar `██████░░░░`.
*   **CTA:** Includes a prominent `Resume` button.
*   **Empty State:** If there is no study history, displays *"No learning history yet."* with a prominent `Start Learning` button.

### 3. Review Due Card
*   **Content:** Displays due reviews count (`15 words`) paired with an estimated completion time calculated at `15s` per card (`Est: 4 min`) to lower user entry barrier.
*   **Empty State:** If zero reviews are due, card displays: *"All caught up! Next review tomorrow."*

### 4. Word of the Day
*   **Visual Hierarchy:** Word (Outfit Bold, `48sp`, Amber) $\rightarrow$ Pronunciation (`16sp`, Gray) $\rightarrow$ POS Chip (Teal background 10%) $\rightarrow$ Bengali Translation (Hind Siliguri, `17sp`) $\rightarrow$ English Definition (Inter Medium, `17sp`) $\rightarrow$ Play Audio (🔊) and Bookmark (⭐) action buttons.
*   **Aesthetics:** Translucent Level 1 surface with a very subtle Amber outer glow.

### 5. Quick Practice Section
*   **Priority:** `Quiz` and `Flashcards` are rendered as prominent filled buttons. Secondary actions (`Stories`, `Bookmarks`) are styled as muted text/outlined buttons to avoid visual clutter and maintain action hierarchy.

### 6. Hit Parade List
*   **Items Capping:** Displays a **maximum of 3 items** to prevent vertical list bloat.
*   **CTA:** Includes a `See All` text button at the bottom of the list to navigate to the full high-frequency vocabulary directory.

---

## 🔄 Screen States

*   **Initial:** Home loads instantly showing personalized welcome message and cached Word of Day.
*   **Loading:** Pulsing shimmers match search, streak card, and Word of Day templates.
*   **Offline:** Displays cached SQLite database values, hiding the cloud sync indicators.
*   **Error:** Shows small error notice with a `Retry` button inside Card containers.

---

## 🖐️ Interactions & Gestures
*   **Tap Search:** Triggers Hero transition to SearchSuggestions.
*   **Tap Word Card:** Tapping Word of Day opens Details.
*   **Tap Bookmark Star:** Instantly toggles bookmark with haptic click.
*   **Long Press Word of the Day:** Shows a quick definition popup bottom sheet.

---

## 🎬 Animations & Choreography
*   **Search Hero:** Morph transition expands the Search Bar container on tap.
*   **Word of Day Hero:** Outfit display text translates to Details header.
*   **Bookmark Toggle:** Star scale bounce (`0.8x` to `1.2x` to `1.0x` over `150ms`).

---

## ♿ Accessibility
*   Interactive buttons maintain a minimum tap target of `48dp`.
*   All progress bars and streak icons have descriptive semantic text mapping for screen readers.

---

## 🛠️ Flutter Performance Notes
*   Use `SliverList` and `SliverToBoxAdapter` inside a single `CustomScrollView` for smooth scrolling.
*   Wrap the Word of the Day Hero card in a `KeepAlive` wrapper to prevent rebuilds on scroll.
*   Pre-cache the user's avatar image during app startup.
*   Mark all layout containers and static spacers as `const` widgets to minimize repaint boundaries.

---

## 📐 Responsive Layout Rules
*   **Phone (<600dp):** Vertical scroll stack with full `24dp` margins.
*   **Tablet (600–840dp):** Two-column layout: Left column = Search + Streak progress + Word of Day; Right column = Recent Words + Quick Practice + Hit Parade list.
*   **Desktop (>840dp):** Centered reading width capped at `800dp` with generous side gutters.

---

## ✅ Screen Success Criteria

A successful Home screen should allow users to:
*   Start searching within **2 seconds** of launch.
*   Resume learning within **1 tap** from the landing page.
*   Access today's review without scrolling (above the fold).
*   Identify the Word of the Day immediately upon landing.
*   Reach any primary study mode within **2 taps**.
