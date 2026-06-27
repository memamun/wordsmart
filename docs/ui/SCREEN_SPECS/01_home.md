# Screen Specification: 01_home

## 🎯 Purpose
The landing page and primary visual center of the application. It establishes the calm, editorial vocabulary focus on launch.

## 🏆 User Goal
Search for a word, view the daily word, check learning progress, and launch study drills.

## 🧭 Entry & Exit Points
*   **Entry:** App boot/launch, or tapping the "Home" tab on BottomNavBar.
*   **Exit:** 
    *   Tapping Search Bar $\rightarrow$ Transitions to Search Suggestions Screen (02_search).
    *   Tapping Word of the Day $\rightarrow$ Opens Word Details (03_word_details).
    *   Tapping Quick Practice $\rightarrow$ Opens Flashcards (04_flashcards) or Quiz (05_quiz).

## 🧩 Components
1.  **Top App Bar:** Outfit SemiBold title `WordSmart` and Profile avatar.
2.  **Search Bar Anchor:** Non-editable pill-shaped dummy text input.
3.  **Continue Learning Card:** Daily word intake progress (e.g. `12 Words Left`).
4.  **Review Due Card:** Spaced repetition count (e.g. `15 Due`).
5.  **Word of the Day Card:** Main hero card featuring a large display word, part of speech chip, audio play, and bookmark toggle.
6.  **Quick Practice Row:** 4 monochrome circular action buttons.
7.  **Hit Parade List:** Top GRE/SAT vocabulary words list.

## 🔄 Lifecycle States
*   **Initial:** Home elements load instantly on app boot.
*   **Loading:** Skeletons pulse in place of progress cards and Word of the Day.
*   **Offline:** Displays cached database values for streak and Word of the Day.
*   **Error:** Displays connection/cache error card with a retry CTA.

## 🖐️ Interactions & Gestures
*   **Tap Search:** Instantly opens the Search page with keyboard auto-focus.
*   **Tap Word of the Day:** Opens Details screen.
*   **Tap Bookmark Star:** Instantly toggles bookmark database state with haptic click.

## 🎬 Animations
*   **Page Enter:** Muted fade-in.
*   **Hero Transition:** Tapping Word of the Day hero-animates the Outfit headword to the details page.

## ♿ Accessibility
*   All buttons have touch targets $\ge 48\text{dp}$.
*   Streak and progress cards contain semantic descriptive label strings for screen readers.

## 🛠️ Flutter Implementation Notes
*   Utilize `SliverList` and `SliverToBoxAdapter` inside a `CustomScrollView` to keep list scrolling smooth.
*   Bind the search bar using a Hero tag to animate it to the top of the Search Suggestions screen.
