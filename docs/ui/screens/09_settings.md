# Screen Specification: 09_settings

## 🎯 Purpose
Provide user customization options for vocabulary intake, translations, audio, and database maintenance.

## 🏆 User Goal
Toggle translations, adjust reading font sizes, configure daily review limits, and manage local data.

## 🧭 Entry & Exit Points
*   **Entry:** Tapping "Settings" on Profile screen, or navigating via BottomNavBar (Settings category).
*   **Exit:** Tapping other BottomNavBar tabs.

## 🧩 Components
1.  **Switch Rows:** Toggle settings (Bengali Translations, Autoplay Audio, Notifications).
2.  **Text Size Slider:** Slider adjustment with dynamic text size preview box.
3.  **Dropdown Selectors:** Daily Word Intake limits.
4.  **Dangerous Action Buttons:** Clear study database (red text).

## 🔄 Lifecycle States
*   **Normal:** Settings display.
*   **Dialog Open:** Material 3 `AlertDialog` opens to confirm learning history reset.

## 🖐️ Interactions & Gestures
*   **Toggle Switch:** State changes with immediate click haptic feedback.
*   **Drag Slider:** Changes text scale factor multiplier in real-time.
*   **Tap Clear History:** Opens reset dialog.

## 🎬 Animations
*   **AlertDialog Fade:** Dialog fades into view.
*   **Switch Slide:** Toggle knob slides over `150ms`.

## ♿ Accessibility
*   Text Size slider provides a visual preview for visually impaired users.
*   Switches have accessible labels mapping state (e.g. *"Bengali translations enabled"* / *"disabled"*).

## 🛠️ Flutter Implementation Notes
*   Store simple settings (toggles, font sizes) using `SharedPreferences` (or similar key-value store) injected into a local settings DataSource.
*   Use a `ListTile` paired with a trailing `Switch` to keep settings layout Material 3 compliant.
