# WordSmart Motion System

This document outlines the standard transitions, animation curves, durations, and choreography rules for the WordSmart platform.

---

## ⏱️ Duration Scales
Animations must remain subtle and support usability rather than call attention to themselves.

*   `duration-fast`: `150ms` (bookmark toggle bounces, swipe clears, button clicks)
*   `duration-standard`: `200ms` (standard page shifts, list tile ripples, search suggestions loads)
*   `duration-slow`: `300ms` (major card flips, full page Hero expansions, database restore indicators)

---

## 📈 Deceleration Curves
WordSmart maps physical deceleration properties using curves aligned with Material 3:

*   **Standard Curve (`easeOutCubic`):** Natural deceleration used for items shifting inside active screen views (e.g. details sections expand).
*   **Entrance Curve (`easeOut`):** Used for incoming elements entering the screen viewport boundary.
*   **Exit Curve (`easeIn`):** Used for outgoing elements exiting the screen boundary.
*   **Emphasized Curve (`easeInOutCubic`):** Heavy, slow easing transitions for major Hero expansion transformations or screen-wide transitions.

---

## 🎬 Transition Choreography Rules

### 1. Home to Search Transition
*   **Action:** Tapping the search bar triggers search suggestions.
*   **Choreography:** The Home search capsule morphs to the top pinned Search Input Bar via a **Hero animation** (`200ms`), while suggestions list items fade and slide up from the bottom boundary (`duration-standard`).

### 2. Search to Word Details Transition
*   **Action:** Selecting a search result opens the word details.
*   **Choreography:** The vocabulary headword text executes a **Hero animation** from the ResultTile list position to the details display title position. Sibling explanation cards fade in progressively under the header over `duration-standard`.

### 3. Star Bookmark Toggle
*   **Action:** Tapping the bookmark star button.
*   **Choreography:** The star icon plays a micro scale bounce (`0.8x` scale down $\rightarrow$ `1.2x` spring overshoot $\rightarrow$ `1.0x` settlement) over `150ms` (`duration-fast`).

### 4. Review Flashcard Swipe
*   **Action:** Swiping card in spacing reviews.
*   **Choreography:** Swiped cards slide off-screen horizontally following the user's drag coordinates, applying a dynamic tilt rotation factor (`0.15` radians maximum) before dissolving. The incoming card beneath is preloaded, scaling up from `95%` to `100%` on card dismissal completion.

### 5. Theme Transition (Light / Dark)
*   **Action:** Changing app themes in Preferences.
*   **Choreography:** The screen elements transition using a cross-fade overlay (`CrossFade`) lasting exactly `200ms` (`duration-standard`) to prevent visual flashing.

### 6. Priority Card Flip (State changes)
*   **Action:** Toggling goal metrics or loading spaced reviews in the Priority Section.
*   **Choreography:** Swapping card widgets uses an `AnimatedSwitcher` executing a `FadeThroughTransition` lasting `250ms`.
