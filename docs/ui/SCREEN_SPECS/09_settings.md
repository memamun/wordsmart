# Screen Specification: 09_settings

## 🎯 Purpose
Provide user customization options for vocabulary intake, translations, audio, and database maintenance.

## 🏆 User Goal
Toggle translations, adjust reading font sizes, configure daily review limits, and manage local data.

## 🧭 Entry / Exit
*   **Entry:** Tapping "Settings" on Profile screen, or navigating via BottomNavBar (Settings category).
*   **Exit:** Tapping other BottomNavBar tabs.

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Bengali translations toggle, Audio Autoplay toggle.
*   **Tier 2 (Secondary Context):** Text size slider with live resizing preview, Daily Intake limits.
*   **Tier 3 (Supporting Actions):** Dangerous actions (database reset), App version footer metadata.

## 📐 Layout Structure
The settings screen lists configuration options grouped logically by category. Side margins are `24dp`.
```
+---------------------------------------------------+
|  [Settings]                                       | <- Screen Header (Outfit Bold, 28sp)
+---------------------------------------------------+
|  GENERAL STUDY SETTINGS                           | <- Group Header
|  -----------------------------------------------  |
|  Bengali Translations                   [Switch]  | <- Toggle switch (Teal when active)
|  Audio Autoplay                         [Switch]  | <- Autoplay word pronunciation
|  Text Size (Resizing Preview)           [Slider]  | <- Slider control
|  -----------------------------------------------  |
+---------------------------------------------------+
|  SPACED REPETITION SETTINGS                       | <- Group Header
|  -----------------------------------------------  |
|  Daily Word Intake Count                 ( 10 )   | <- Option selector
|  Study Reminders                        [Switch]  | <- Push notification toggle
|  SR Algorithm Profile                   (Std)     | <- Choice selector
|  -----------------------------------------------  |
+---------------------------------------------------+
|  DATA & SECURITY                                  | <- Group Header
|  -----------------------------------------------  |
|  Backup Progress Database                         | <- Action row
|  Clear Learning History / Reset App               | <- Dangerous action (Red text)
|  -----------------------------------------------  |
+---------------------------------------------------+
|  WordSmart v2.0.0 (Material 3 Production)         | <- Muted Footer (Mono, 12sp)
+---------------------------------------------------+
```

## 🧩 Components
1.  **Switch Rows:** Toggle settings (Bengali Translations, Autoplay Audio, Notifications).
2.  **Text Size Slider:** Slider adjustment with dynamic text size preview box.
3.  **Dropdown Selectors:** Daily Word Intake limits.
4.  **Dangerous Action Buttons:** Clear study database (red text).

## 🔄 Lifecycle States
*   **Normal:** Settings display.
*   **Dialog Open:** Material 3 `AlertDialog` opens to confirm learning history reset.
*   **Saving:** Shows saving overlay when database settings sync.

## 🖐️ Interactions
*   **Toggle Switch:** State changes with immediate click haptic feedback.
*   **Drag Slider:** Changes text scale factor multiplier in real-time.
*   **Tap Clear History:** Opens reset dialog.

## 🎬 Animations
*   **AlertDialog Fade:** Dialog fades into view.
*   **Switch Slide:** Toggle knob slides over `150ms`.

## 📐 Responsive Behavior
*   **Phone (<600dp):** Vertical list group display.
*   **Tablet & Desktop (>600dp):** Layout is centered, capping settings block width to `600dp` to maintain accessibility and clean layout margins.

## ♿ Accessibility
*   Text Size slider provides a visual preview for visually impaired users.
*   Switches have accessible labels mapping state (e.g. *"Bengali translations enabled"* / *"disabled"*).

## 🛠️ Flutter Notes
*   Store simple settings (toggles, font sizes) using `SharedPreferences` (or similar key-value store) injected into a local settings DataSource.
*   Use a `ListTile` paired with a trailing `Switch` to keep settings layout Material 3 compliant.

## ✅ Success Criteria
A successful Settings screen should allow users to:
*   Toggle critical learning parameters (e.g. Translation) with **1 tap**.
*   Preview font text size changes immediately during slider drag.
*   Verify dangerous reset history commands through **2-step dialog confirmations**.
*   Persist changed preferences instantly to local storage.
