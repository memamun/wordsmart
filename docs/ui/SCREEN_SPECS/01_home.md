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
*   **Tier 1 (Critical Focus):** Active Search Bar, Continue Learning (Daily Goal progress), Review Due.
*   **Tier 2 (Secondary Context):** Word of the Day (Featured Card), Quick Practice (Quick Quiz & Flashcards emphasis).
*   **Tier 3 (Supporting Actions):** Recent Words, Hit Parade list, Stories & Bookmarks menu links.

## 📐 Layout Structure
The Home screen is organized in a clean vertical stack.

```
+---------------------------------------------------+
|  [Good Morning/Afternoon/Evening, User]  (Avatar) | <- Personalized Top App Bar
+---------------------------------------------------+
|                                                   |
|      [   Search 1,900+ vocabulary words...   ]    | <- Search Bar (readOnly = true)
|                                                   |
+---------------------------------------------------+
|  +---------------------------------------------+  |
|  | Today's Goal: 8 / 20 words     ██████░░░░   |  | <- Continue Learning Card (Featured Card)
|  | [Resume]                                    |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  +---------------------------------------------+  |
|  | Review Due: 15 words     ≈ 4 minutes        |  | <- Review Due Card
|  | [Start Review]                              |  | <- Urgency Action CTA
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  Word of the Day                                  | <- Section Header (Outfit 18sp SemiBold)
|  +---------------------------------------------+  |
|  |  ABATE                                      |  | <- Word (Outfit Bold)
|  |  [uh-bayt] • verb                           |  | <- Pronunciation • POS (Inter)
|  |  অনুবাদ: প্রশমিত হওয়া                          |  | <- Hind Siliguri Bengali
|  |  Definition: to subside; to reduce          |  | <- English Definition (Inter)
|  |  (🔊) Audio                 (⭐) Bookmark     |  | <- Inline action text buttons
|  +---------------------------------------------+  | <- Standard WordSmart Card
+---------------------------------------------------+
|  Quick Practice                                   | <- Section Header (Outfit 18sp SemiBold)
|  [ Quick Quiz (Primary) ]  [ Flashcards (Primary) ] <- Prominent study buttons
|  Stories (Muted text)      Bookmarks (Muted text)  <- Muted secondary options
+---------------------------------------------------+
|  Recent Words                                     | <- Section Header (Outfit 18sp SemiBold)
|  • ABASH (v.)  • ABERRATION (n.)  • ABDICATE (v.) | <- Horizontal scroll list
+---------------------------------------------------+
|  Hit Parade                                       | <- Section Header (Outfit 18sp SemiBold)
|  1. ABASH      (v.)  To embarrass or make...  (>) | <- Row 1 (Sorted by frequency)
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
1.  **Top App Bar:** Personalized greeting based on system clock (*Good Morning*, *Good Afternoon*, *Good Evening*) and circular Profile avatar.
2.  **Search Bar:** Material 3 `SearchBar` configured with `readOnly = true` and dynamic hints.
3.  **Continue Learning Card:** Standard WordSmart Card. Shows progress as numerical value `8 / 20 words` with a horizontal Teal block progress bar `██████░░░░` with `Resume` CTA.
    *   *First-time User Empty State:* If there is no study history, displays *"No learning progress yet."* with a prominent `Start Learning` button.
4.  **Review Due Card:** Standard WordSmart Card. Displays due reviews count (`15 words`) paired with an estimated completion time (`≈ 4 minutes`) and a clear `Start Review` action button.
    *   *Empty State:* If zero reviews are due, displays: *"All caught up! Next review tomorrow."*
5.  **Word of the Day Card:** Standard WordSmart Card component. Displays Word $\rightarrow$ Pronunciation • POS $\rightarrow$ বাংলা অর্থ $\rightarrow$ English Definition $\rightarrow$ Audio / Bookmark inline action text buttons.
6.  **Quick Practice Row:** Row with primary filled buttons (`Quick Quiz`, `Flashcards`) and secondary muted text buttons (`Stories`, `Bookmarks`).
7.  **Recent Words:** A horizontal scrollable list displaying a maximum of **10 words** ordered newest first.
8.  **Hit Parade List:** List capped at 3 words sorted strictly **by frequency** (not alphabetically) with a `See All` CTA text button.

## 🔄 Lifecycle States
*   **Initial:** Home loads instantly showing personalized welcome message and cached Word of Day.
*   **Loading:** Pulsing shimmers match search, streak card, and Word of Day templates.
*   **Offline:** Displays cached SQLite database values, hiding the cloud sync indicators.
*   **Error:** Shows: *"Unable to load today's progress."* with `Retry` and `Continue Offline` actions.

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
*   **Tablet (600–840dp):** Two-column layout:
    *   *Left Column:* Search Bar, Continue Learning Card, Review Due Card, Word of the Day Card.
    *   *Right Column:* Recent Words, Quick Practice, Hit Parade.
*   **Desktop (>840dp):** Centered reading width capped at `800dp` with generous side gutters.

## ♿ Accessibility
*   Interactive buttons maintain a minimum tap target of `48dp`.
*   All progress bars and streak icons have descriptive semantic text mapping for screen readers.

## 🛠️ Flutter Notes
*   Use `SliverList` and `SliverToBoxAdapter` inside a single `CustomScrollView` for smooth scrolling.
*   Wrap the Word of the Day Hero card in a `KeepAlive` wrapper to prevent rebuilds on scroll.
*   Persist Home scroll position using `PageStorageKey`.
*   Mark all layout containers and static spacers as `const` widgets to minimize repaint boundaries.

## ✅ Success Criteria
A successful Home screen should allow users to:
*   Start searching within **2 seconds** of launch.
*   Resume learning within **1 tap** from the landing page.
*   Access today's review without scrolling (above the fold).
*   Identify the Word of the Day immediately upon landing.
*   Reach any primary study mode within **2 taps**.
*   Understand what to do next within **3 seconds** of landing.
