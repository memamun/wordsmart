# WordSmart Accessibility Standards

This document establishes the accessibility (a11y) rules for WordSmart to ensure an inclusive educational experience for all learners.

---

## 📐 Touch Targets
*   **Minimum Target Size:** All interactive touch points (buttons, star icons, list row items, switches) must measure a minimum of `48dp` x `48dp` (Material 3 standard).
*   **Padding Expansion:** Small icons (e.g. `24dp` bookmark star) must use inner padding to expand their active touch target boundary without altering visual size.

---

## 🎨 Contrast Targets
*   **Minimum Contrast Ratio:** Text-to-background contrast ratios must meet or exceed **4.5:1** (WCAG AA standard) for both Light and Dark themes.
*   **Disabled State Contrast:** Inactive text outlines and labels must remain legible at a minimum ratio of **3:1**.
*   **High Contrast Override:** Users can toggle "High Contrast Mode" in Preferences, replacing glassmorphic surfaces with solid high-contrast border lines.

---

## 📖 Typography & Text Scaling
*   **Dynamic Font Scaling:** UI layouts must support dynamic text size adjustments (up to `200%` system scaling) without clipping, overlapping, or hiding text.
*   **Line Heights:** All body text elements must specify a minimum line height factor of `1.4` (`Hind Siliguri` translations require `+20%` height factor) to prevent text crowding.

---

## 🎬 Motion Adjustments (Reduced Motion)
*   **Reduced Motion Override:** When the user enables the system "Reduce Motion" setting or toggles it inside Preferences:
    *   Scale bounces on stars, flipping rotations on cards, and page slide transitions are disabled.
    *   Transition animations revert to instant updates or soft `100ms` opacity fades.

---

## 🎙️ Screen Reader Optimizations
*   **Semantic Structures:** All interactive elements must feature distinct semantic descriptions for screen readers:
    *   *Streaks:* Screen reader announces: *"Active streak: 12 days."* rather than reading out the fire emoji.
    *   *Progress bars:* Announce completed percentages (e.g. *"Goal progress: 8 of 20 words completed, 40 percent"*).
    *   *Headwords:* Announce spelling, POS chip details, and meanings as a unified block when focused.
*   **Announcements:** Dynamically post semantic announcements when results lists load (e.g. *"Search query complete. 12 related words found."*).

---

## 📐 Landscape Layout Rules
*   **Scroll Panes:** All settings, details, and study screens must wrap their layout inside scroll views (`SingleChildScrollView` or `CustomScrollView`) when rotated to landscape, preventing screen overflow errors.
*   **Capping width:** Columns cap content width to `800dp` maximum, keeping visual margins comfortable.

---

## 📳 Haptic Mappings
Haptic feedback is mapped to support low-vision navigation:
*   **Light Click (`HapticFeedback.lightImpact`):** Triggered on toggling bookmark stars, switching nav tabs, and sliding preferences.
*   **Success Tick (`HapticFeedback.vibrate`):** Triggered on answering a Study quiz correctly, rating a card as Mastered, and recovering removed items via Undo snackbars.
*   **Warning Notification (`HapticFeedback.heavyImpact`):** Triggered on incorrect quiz answers and Danger zone confirmation triggers.
