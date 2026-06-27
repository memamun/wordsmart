# WordSmart Interaction Guidelines

This document details navigation flows, gesture behaviors, haptic mappings, and sound guidelines to maintain a premium, unified user experience.

---

## 🧭 1. Navigation Flow & Hierarchy

WordSmart enforces a flat, distraction-free navigation hierarchy. Users must never feel lost.

*   **Main Navigation:** Controlled via the bottom `NavigationBar` with 4 target areas:
    1.  *Home / Search (Tab 1)*
    2.  *Study Deck (Tab 2)*
    3.  *Bookmarks (Tab 3)*
    4.  *Profile / Progress (Tab 4)*
*   **Maximum Navigation Depth:** `Home` $\rightarrow$ `Search Suggestions` $\rightarrow$ `Word Details`.
*   **Back Navigation:** Every sub-screen must feature a prominent Back arrow icon $(<)$ in the top app bar. Double tap or swipe-to-pop gestures are disabled for primary back actions.

---

## 🖐️ 2. Allowed & Disallowed Gestures

To maintain ease of use, all interactions are optimized for **one-handed thumb usage** in the bottom half of the screen.

### Allowed Gestures
*   **Single Tap:** Primary action trigger (select option, play audio, toggle bookmark).
*   **Horizontal Drag / Swipe:** Restricted **only** to Flashcards.
    *   *Swipe Left:* Re-queues the card as Still Learning.
    *   *Swipe Right:* Marks the card as Mastered.
*   **Vertical Drag / Scroll:** Standard scrolling inside lists and detail views.
*   **Long Press:** Permitted only on word tiles to reveal a contextual definition bottom sheet overlay.

### Disallowed Gestures
*   No multi-touch gestures.
*   No horizontal swipes outside the Flashcard card container.
*   No complex multi-finger shortcuts.

---

## 📳 3. Haptic Feedback Mappings

Haptic feedback is a critical UX indicator representing success or error states.

*   **Light Click (HapticFeedback.lightImpact):**
    *   Tapping the bookmark star button.
    *   Switching tabs on the BottomNavBar.
    *   Clicking a category filter chip.
*   **Success Confirmation (HapticFeedback.vibrate / Success):**
    *   Answering a quiz question correctly.
    *   Swiping a flashcard as "Mastered".
*   **Warning Notification (HapticFeedback.heavyImpact / Warning):**
    *   Answering a quiz question incorrectly.
    *   Database transaction failures or connection timeout errors.

---

## 🔊 4. Sound Design Rules

*   **Silent UI:** All UI interactions (button clicks, menu opens, tab switches) must remain completely silent to minimize distractions.
*   **Voice Narration:** Pronunciation audio is the only sound permitted in the app. It must be initiated only by:
    1.  User tapping the Audio button.
    2.  Autoplay setting enabled (triggers play only when Word Details screen opens).

---

## 💫 5. Microinteractions Choreography

### Bookmark Star Fills
1.  User taps the outline star.
2.  Trigger light haptic click.
3.  Icon rotates slightly and scales down to `0.8x`, then expands to `1.2x` filled with Amber, settling at `1.0x` over `150ms`.

### Audio Button Pulse
1.  User taps play button.
2.  If audio loading is delayed, a translucent circular ring loader rotates.
3.  During active audio play, the icon pulses between `1.0x` and `1.1x` in sync with the audio duration.
