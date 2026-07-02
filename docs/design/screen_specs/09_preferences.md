# Screen Specification: 09_preferences

## 🎯 Purpose
Provide user configuration options to personalize the vocabulary learning experience, reading environment, audio feedback, search matching, and storage tools. Referred to in the user interface as **Settings**, the internal architecture is structured as a Preferences system.

## 🏆 User Goal
Customize study intake targets, configure Kindle-style reading fonts and themes, manage local databases, download offline audio assets, and set reminder notifications.

## 🧭 Entry / Exit
*   **Entry:** Tapping the settings icon on the Profile screen (Tab 4).
*   **Exit:** Tapping the Back arrow $(<)$ returns to the Profile screen.

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Learning preferences (Daily Goal, Review Size), Reading preferences (Theme, Font Size, Line Spacing, Column Width).
*   **Tier 2 (Secondary Context):** Audio playback switches, reminder schedules, search parameters, accessibility toggles.
*   **Tier 3 (Supporting Actions):** Storage utilities (Backups, Download managers), About metadata, Danger Zone reset controls.

## 📐 Layout Structure
The screen is built using a `CustomScrollView` with a `SliverAppBar`. Below the fold, layout elements are grouped inside distinct Material 3 surface cards to maintain clean grid separation. Margins are `24dp` on mobile.

```
+---------------------------------------------------+
|  (<-) Back                                        | <- Top App Bar
+---------------------------------------------------+
|  Settings                                         | <- Screen Header (Outfit Bold, 28sp)
|  Good evening, Mamun                              | <- Warm greeting header ⭐
|  Customize your learning experience.              |
+---------------------------------------------------+
|  LEARNING                                         | <- Section Header
|  ┌─────────────────────────────────────────────┐  |
|  | Daily Goal                     20 words  >  |  | <- Preference Card Group ⭐
|  | ─────────────────────────────────────────── |  |
|  | Review Session Size            15 words  >  |  |
|  | ─────────────────────────────────────────── |  |
|  | Show Bengali Meaning           [ ON Switch ]|  |
|  | ─────────────────────────────────────────── |  |
|  | Study Difficulty               GRE       >  |  |
|  └─────────────────────────────────────────────┘  |
+---------------------------------------------------+
|  READING PREFERENCES                              | <- Section Header
|  ┌─────────────────────────────────────────────┐  |
|  | Text Size                      [ Slider ]   |  |
|  | ─────────────────────────────────────────── |  |
|  | Column Width                   Auto      >  |  |
|  | ─────────────────────────────────────────── |  |
|  | Font                           Default   >  |  |
|  | ─────────────────────────────────────────── |  |
|  | Theme                          Dark      >  |  | <- System, Dark, Light choices ⭐
|  └─────────────────────────────────────────────┘  |
+---------------------------------------------------+
|  DANGER ZONE                                      | <- Group Header (Red text) ⭐
|  ┌─────────────────────────────────────────────┐  |
|  | Reset Learning Progress                     |  | <- Dangerous Action (Red font)
|  | ─────────────────────────────────────────── |  |
|  | Delete All Bookmarks                        |  |
|  | ─────────────────────────────────────────── |  |
|  | Clear Search History                        |  |
|  └─────────────────────────────────────────────┘  |
+---------------------------------------------------+
|  WordSmart v2.0.0 (Material 3 Production)         |
+---------------------------------------------------+
```

## 🧩 Components
1.  **Warm Header Banner:**
    *   Displays a greeting based on system clock details (*"Good evening, Mamun"*) and a subtitle (*"Customize your learning experience"*).
2.  **Learning Preference Card:**
    *   **Daily Goal:** Opens dialog to select words/day.
    *   **Review Size:** Adjusts Spaced repetition session sizes.
    *   **Show Bengali Meaning:** Switch to toggle translations globally.
    *   **Study Difficulty (Exam Mode):** Dropdown to toggle exam contexts: `GRE`, `IELTS`, `SAT`, `TOEFL`, or `General`.
3.  **Reading Preference Card:**
    *   **Text Size:** Slider control with inline preview text.
    *   **Column Width:** Selects character-per-line boundaries (`Compact 50`, `Auto 65`, `Wide 75`).
    *   **Font Selection:** Selects typography rendering face (`Default`, `Outfit`, `Inter`, `Dyslexic-friendly`).
    *   **Theme Selection:** Switches display states: `System`, `Dark`, `Light`.
4.  **Audio Preference Card:**
    *   **Auto Play Pronunciation:** Switch to toggle audio autoplay on word loading.
    *   **Playback Speed:** Speed dropdown adjustment (`0.75x`, `1.0x`, `1.25x`, `1.5x`).
    *   **Download Audio Manager:** Opens utility to pre-download all offline audio assets (displays active database sizes e.g., `245 MB`).
5.  **Notifications Preference Card:**
    *   **Daily Reminder:** Toggles reminders.
    *   **Reminder Time:** Pops standard M3 TimePicker (`8:00 PM` default).
    *   **Review Reminders:** Toggles Spaced repetition alerts.
6.  **Search Settings Card:**
    *   **Prioritize Exact Match:** Toggles search weights.
    *   **Recent Searches:** Toggles recent history caching.
    *   **Maximum Suggestions:** Dropdown to limit suggestions counts (`5`, `10`, `15`).
7.  **Word Details Configuration Card:**
    *   Toggles for showing/hiding `Mnemonics`, `Roots`, `Examples`, and default `Collapse Sections` options.
8.  **Accessibility Settings Card:**
    *   Switches to configure: `Large Text`, `High Contrast`, `Reduce Motion`, `Haptic Feedback`, and `Screen Reader Optimizations`.
9.  **Storage Card:**
    *   Provides links to: `Backup Database`, `Restore Backup`, `Export Saved Words`, and `Import Backup`.
10. **Danger Zone Card:**
    *   Red-outlined container placed at the bottom of the list.
    *   Contains three destructive actions: `Reset Learning Progress`, `Delete All Saved Words`, and `Clear Search History`.
    *   **Danger Rule:** Icon indicators are used *only* for the Danger zone, Audio, Notifications, and Storage sections to maintain clean typography elsewhere.
11. **About Card:**
    *   Displays app version details (`v2.0.0`), `Privacy Policy` link, open-source `Licenses`, developer details, and a `Send Feedback` CTA.

## 🔄 Lifecycle States
*   **Normal Settings View:** Displays grouped preference cards.
*   **Dialog Confirms:** Open confirmation states for destructive resets or database restoration.
*   **Saving/Syncing:** Shows saving indicators when databases are imported/exported.
*   **Audio Download Empty State:** Shown inside the Download manager if no audio has been pre-downloaded:
    ```
    No audio downloaded yet.
    Download automatically?
    [ Enable ]
    ```

## 🖐️ Interactions & Verification
*   **Toggle Preferences Switch:** Instantly saves changes.
*   **Slider Live Preview:** Scale font previews instantly in the preview box during sliders drag.
*   **Destructive Reset Confirmation:** Destructive resets trigger 2-step verification dialogs before clearing SQLite tables.
*   **Theme Toggle:** Triggers system-wide color palette rebuilds.
*   **Future AI Toggle:** Holds space for `Enable AI Mnemonics [ON]` and `Cloud Sync [OFF]` toggles (V2).

## 🎬 Animations
*   **Theme Transition CrossFade:** Changes between Light/Dark themes perform a smooth `200ms` CrossFade animation.
*   **Section Expand:** Toggling sub-setting groups triggers an `AnimatedSize` expand.

## 📐 Responsive Behavior
*   **Phones (<600dp):** Single-column card stack.
*   **Tablets & Desktops (>600dp):** Capped card container width locked to `600dp` centered on screen.

## ♿ Accessibility
*   Includes `Reduce Motion` and `High Contrast` preferences to override default animations and colors.
*   Switches announce their state explicitly. Font sizes scale up to 200%.

## 🛠️ Flutter & Preferences Data Architecture
*   **Clean Architecture Separation:** Screen widgets interact strictly with a `SettingsRepository` via Riverpod providers. The repository coordinates updates with the local key-value storage class (`SettingsLocalDataSource` $\rightarrow$ SharedPreferences) to prevent the UI from depending directly on SharedPreferences.
*   Construct the page using a `CustomScrollView` with a `SliverAppBar`, a `SliverList` mapping section card structures, and `AnimatedSize` transition widgets.

## 📋 Session Rules
*   **Instant Writes:** Changed preferences write immediately to SharedPreferences.
*   **User Caching:** All configs (text size, line spacing, themes, translation states) persist across launches.
*   **Safety confirmation:** Reset database transactions require double dialog verification and cannot be undone once written to SQLite.

## ✅ Success Criteria
The preferences screen should allow users to perform these activities in `< 10 seconds`:
1.  Change learning preferences (Daily goal / Intake size).
2.  Change reading preferences (Theme / Column width / Font size).
3.  Configure study reminders.
4.  Backup user vocabulary databases.
5.  Restore user progress databases.
6.  Reset learning stats safely via Danger Zone dialog confirmations.
