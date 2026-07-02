# Screen Specification: 01_home

## 🎯 Purpose
The landing page and primary visual center of the application. It establishes a calm, reading-focused vocabulary experience immediately upon launch. The layout is built as a dynamic composition of sections that adjusts to the user's current learning state, guiding them directly to their next high-priority activity.

## 🏆 User Goal
Search for a word, instantly see their next study task, check daily streak momentum, review the Featured Word of the Day, and browse vocabulary collections.

## 🧭 Entry / Exit
*   **Entry:** App boot/launch, or tapping the "Home" tab on the bottom navigation bar.
*   **Exit:**
    *   Tapping the Search Bar transitions to Search Suggestions ([02_search](file:///home/mamun/wordsmart/docs/ui/screen_specs/02_search.md)).
    *   Tapping the Featured Word, recent words, or collection cards opens Word Details ([03_word_details](file:///home/mamun/wordsmart/docs/ui/screen_specs/03_word_details.md)).
    *   Tapping study action buttons launches Review Sessions ([04_review_session](file:///home/mamun/wordsmart/docs/ui/screen_specs/04_review_session.md)) or Study Sessions ([05_study_session](file:///home/mamun/wordsmart/docs/ui/screen_specs/05_study_session.md)).

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Compact personalized greeting, smart search bar, Priority Section (Merged Goal + Momentum Card).
*   **Tier 2 (Secondary Context):** Today's Word (Featured Card), Quick Actions row, conditional Featured Section.
*   **Tier 3 (Supporting Actions):** Tap-friendly Recent Words (with descriptive recency labels), Curated Collections list, Bottom Navigation Bar.

## 📐 Layout Structure
The screen is managed via a single `CustomScrollView` supporting a pull-to-refresh `RefreshIndicator` gesture. Margin padding is `24dp` on mobile screens.

```
+---------------------------------------------------+
|  Good morning, Mamun                              | <- Compact greeting ⭐
|  🔥 12-day streak • 412 words mastered            | <- Streak & Words summary (High priority) ⭐
|  Ready to continue?                               |
+---------------------------------------------------+
|  [ Search "capricious"...                       ] | <- Smart Search (Rotated Hint Loop) ⭐
+---------------------------------------------------+
|  PRIORITY SECTION (Goal + Momentum + Progress)    | <- Section Header
|  ┌─────────────────────────────────────────────┐  |
|  | Today's Goal                                |  | <- Title
|  | Keep your learning streak alive.            |  | <- Streak motivation subtitle ⭐
|  | ██████░░░░ 40%                              |  | <- Goals bar
|  | 8 of 20 completed                           |  |
|  | Next Review • 15 words ready                |  | <- Review reminder
|  |                                             |  |
|  | [ Start Review ]                            |  | <- Primary Action Button (Solid Amber)
|  └─────────────────────────────────────────────┘  |
+---------------------------------------------------+
|  TODAY'S WORD                                     | <- Section Header (Apple Books Style)
|  ┌─────────────────────────────────────────────┐  |
|  |  ABATE                     [GRE] [Advanced] |  | <- Headword & Badges (badges optional) ⭐
|  |                                             |  |
|  |  বাংলা অর্থ: প্রশমিত হওয়া                     |  | <- Meaning First
|  |                                             |  |
|  |  English Definition: to reduce or subside   |  | <- Definition Second
|  |  ─────────────────────────────────────────  |  | <- Divider
|  |  /əˈbeɪt/    VERB                            |  | <- Metadata Last
|  |                                             |  |
|  |  (🔊) Pronounce             (⭐) Save        |  | <- Action Buttons
|  └─────────────────────────────────────────────┘  | <- Tapping card opens Details ⭐
+---------------------------------------------------+
|  QUICK ACTIONS                                    | <- Section Header
|  [ Practice ]       [ Review Session ]            | <- Primary buttons (Row) ⭐
|  ─────────────────────────────────────            | <- Divider line
|  Stories            Saved Words                   | <- Secondary text links (Row)
+---------------------------------------------------+
|  FEATURED SECTION (Dynamic Slot)                  | <- Generic Dynamic Section Header
|  ┌─────────────────────────────────────────────┐  |
|  | Story 12: Echoes of the Past                |  | <- Continue Reading (or Quiz challenge, etc.)
|  | ██████░░░░ 42% Complete                     |  |
|  | [ Resume Reading ]                          |  |
|  └─────────────────────────────────────────────┘  |
+---------------------------------------------------+
|  CONTINUE WHERE YOU LEFT OFF                      | <- Section Header
|  ┌──────────────┐ ┌──────────────┐ ┌───────────┐  |
|  | ABATE        | | ABASH        | |ABERRATION |  | <- Mini Card Grid
|  | Reviewed 2h  | | Opened y'day | | Opened 3d |  | <- Descriptive recency labels ⭐
|  └──────────────┘ └──────────────┘ └───────────┘  |
+---------------------------------------------------+
|  WORD COLLECTIONS                                 | <- Section Header
|  ┌─────────────────────────────────────────────┐  |
|  | • 📚 GRE High Frequency                     |  | <- Collection list with icons ⭐
|  | • 📘 SAT Essentials                         |  |
|  | • 🧠 Academic Vocabulary                    |  |
|  |                                             |  |
|  | [ See All Collections → ]                   |  | <- Expand Trigger
|  └─────────────────────────────────────────────┘  |
+---------------------------------------------------+
|  [Home]  [Study]  [Library]  [Profile]             | <- Bottom Navigation Bar (Tab 3 Library) ⭐
+---------------------------------------------------+
```

## 🧱 Home Composition Rules
The Home screen layout is adaptive and data-driven. The composition adheres to the following guidelines:
*   **Single Hero Cap:** Never display more than one Hero card above the fold.
*   **CTA Button Limits:** Never stack more than two call-to-action buttons together.
*   **Dynamic Collapse:** Featured and dynamic sections collapse completely when no progress/target data exists.
*   **Urgency Reordering:** Sections may reorder based on active study urgency (e.g. prioritizing overdue review lists over routine daily goal items).
*   **No Scroll Default:** The user should never need to scroll to discover the next recommended learning action.

## 🏛️ Component Tree
The layout is constructed by compiling these modular section containers and components:
```text
HomePage
│
├── GreetingSection
│
├── SearchSection
│
├── PriorityCard
│
├── FeaturedWordCard
│
├── QuickActions
│
├── FeaturedSlot
│
├── RecentWordsCarousel
│
├── CollectionsList
│
└── BottomNavigation
```

## 🧩 Sections Composition
1.  **GreetingSection:**
    *   Greeting banner:
        ```
        Good morning, Mamun
        🔥 12-day streak • 412 words mastered
        Ready to continue?
        ```
    *   Dynamic momentum summary text. Displays active streak count and total mastered words.
2.  **SearchSection:**
    *   Material 3 capsule input with a read-only search action.
    *   **Search Pinning Rule:** When the keyboard opens, the search field remains pinned at the top of the viewport, with suggestion items scrolling underneath.
    *   Uses a rotated search suggestion loop:
        1.  *Recent search:* `Search "abate"`
        2.  *Saved words:* `Search your bookmarked words...`
        3.  *Popular collection:* `Search GRE words...`
        4.  *Fallback default:* `Search any word...`
3.  **PrioritySection (PriorityCard Component):**
    *   Consolidates daily progress statistics and immediate study targets into a single card.
    *   Layout features: Today's Goal text, streak motivation subtitle (*"Keep your learning streak alive."*), graphical horizontal goal progress bar (`██████░░░░ 40%`), number of completed words (`8 of 20 completed`), next review status details (`Next Review • 15 words ready`), and the primary solid Amber `Start Review` action button.
    *   **Urgent > Routine rule:** If reviews are due, the primary button points to Spaced Review. If reviews are caught up, it prompts routine learning drills.
    *   **Empty State (Welcome Mode):** Shown for new users:
        ```
        Welcome to WordSmart
        Start with today's word.
        [ Start Learning ]
        ```
4.  **FeaturedWordSection (FeaturedWordCard Component):**
    *   Editorial featured widget (labeled *"Today's Word"*).
    *   Hierarchy details: spelling headword (Outfit Bold, `48sp`), optional difficulty/exam tags (e.g. `[GRE]`, `[Advanced]` - *rendered only when available*), Bengali meaning (`20sp`), English Definition (`16sp`), horizontal divider line, phonetic pronunciation, POS, and action button bar (Audio, Save status).
    *   **Micro Interaction Rule:** Circular Audio play buttons and Bookmark star status toggles remain fixed, but tapping anywhere else on the card opens Word Details ([03_word_details](file:///home/mamun/wordsmart/docs/ui/screen_specs/03_word_details.md)).
5.  **QuickActionsSection:**
    *   Renders study launchers grouped by priority:
        *   *Primary Row:* `Practice` (quizzes) and `Review Session` (SRS) buttons.
        *   *Horizontal Divider:* Thin hairline spacer.
        *   *Secondary Row:* `Stories` (Story Library) and `Saved Words` (Saved Library) text buttons.
6.  **FeaturedSection (FeaturedSlot Component):**
    *   A generic container slot reserved for dynamic content. Only one widget is rendered based on system priorities:
        *   *Slot A (Continue Reading):* Story cover card showing completed percentages (`42% Complete`) and a `Resume` trigger. (Only visible if `hasStoryProgress == true`).
        *   *Slot B (Daily Challenge):* Custom spelling quiz.
        *   *Slot C (AI Recommendations):* Tailored word highlights.
7.  **RecentWordsSection (RecentWordsCarousel Component):**
    *   Horizontal scroll list of tap-friendly mini card widgets displaying recently reviewed terms (e.g. ABATE, ABASH).
    *   Displays descriptive recency labels (`Reviewed 2h ago`, `Opened yesterday`, `Opened 3 days ago`) rather than learning mastery badges.
8.  **CollectionsSection (CollectionsList Component):**
    *   Clean stacked card with icons prepended:
        *   `📚 GRE High Frequency`
        *   `📘 SAT Essentials`
        *   `🧠 Academic Vocabulary`
    *   Capped to display only the top 3 collections, followed by a `[See All Collections →]` link.
9.  **BottomNavigation:**
    *   Tab 1: **Home** (this screen).
    *   Tab 2: **Study** (accesses review sessions and practice quizzes).
    *   Tab 3: **Library** (hosts Stories Library ([06_story_library](file:///home/mamun/wordsmart/docs/ui/screen_specs/06_story_library.md)), Saved Library ([07_saved_library](file:///home/mamun/wordsmart/docs/ui/screen_specs/07_saved_library.md)), and Collections).
    *   Tab 4: **Profile** (launches Profile summary and Dashboard stats ([08_learning_dashboard](file:///home/mamun/wordsmart/docs/ui/screen_specs/08_learning_dashboard.md)) containing Settings shortcut ([09_preferences](file:///home/mamun/wordsmart/docs/ui/screen_specs/09_preferences.md))).

## 🔄 Lifecycle States
*   **Initial Loading:** Skeleton placeholders mimic the priority card and featured word blocks.
*   **Loaded:** Renders the dynamic segments structure, syncing statistics instantly.
*   **Offline/Error:** Reverts to cached values, displaying retry banners if local data queries fail.

## 🖐️ Interactions
*   **Pull-to-Refresh:** Pull down gesture triggers a `RefreshIndicator` update.
    *   **Performance Rule:** Refresh *only* WOTD details, greeting stats, and goal progress. Do NOT rebuild the entire page structure on refresh.
*   **Tap Search:** Opens active Search Suggestions.
*   **Tap Cards:** Initiates route navigation transitions.

## 🎬 Animations
*   **Fade Through Transition:** Flicking states or swapping components inside the Priority Section uses an `AnimatedSwitcher` executing a `FadeThroughTransition` over `250ms`.
*   **Morphing Search:** The search input capsule transitions smoothly to full-page inputs.

## 📐 Responsive Behavior
*   **Phone (<600dp):** Vertical scroll stack.
*   **Tablets & Desktops (>600dp):** Centered layout capped at `800dp` maximum width.

## ♿ Accessibility
*   Buttons maintain a minimum tap target height of `48dp`.
*   Text scale multipliers scale typography boundaries gracefully up to 200%.

## 🛠️ Flutter & Riverpod Structure
*   **AutomaticKeepAliveClientMixin:** Scrolling sections (RecentWords, Collections) are built using lazy Slivers wrapped in keep-alive states to prevent layout shifts on rebuild.
*   The page utilizes a single `CustomScrollView` with a `RefreshIndicator` and independent Riverpod provider listeners.

## ⚡ Performance Budget
*   **First Meaningful Paint:** `< 300ms` on baseline devices.
*   **First Interaction latency:** `< 100ms`.
*   **Search morph transition:** `< 200ms`.
*   **Minimum Frame Rate:** `60fps` (or maximum `120fps`) during scroll sweeps.
*   **Initial memory footprint:** `< 100MB`.

## ✅ Success Criteria
The Home screen should answer these questions within `3 seconds` of landing:
1.  **What should I study now?** (Visible in the merged Priority card above the fold).
2.  **How am I doing today?** (Streak 🔥 and goal completion totals visible instantly in the header and card).
3.  **What is today's featured word?** (Today's Word card highlighted).
4.  **Can I search immediately?** (Search capsule available above the fold).
5.  **Can I view my overall stats dashboard?** (Tab 4 "Profile" bottom navigation tab visible).
