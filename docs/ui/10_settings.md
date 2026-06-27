# Settings Screen Wireframe & Spec

This document defines the layout, toggles, and data controls for the **Settings** screen of WordSmart.

---

## 🏛️ Layout Structure (Top-to-Bottom)

The settings screen lists configuration options grouped logically by category. Side margins are **24dp**.

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

---

## 📝 Component Specifications

### 1. Toggle Switches
*   **Widget:** `Switch` (Flutter Material 3)
*   **Active Colors:** Track `#26A69A` (Teal), thumb `#F5F5F5` (off-white).
*   **Inactive Colors:** Standard Material 3 gray track.

### 2. Text Size Slider
*   **Widget:** `Slider` (Flutter)
*   **Range:** `0.8` to `1.4` multiplier.
*   **Real-time Preview Box:** Below the slider, a preview card shows display text in Outfit (`18sp`) and Inter (`14sp`) resizing dynamically as the slider is dragged.

### 3. Dangerous Action Rows
*   **Clear History Action:** Styled with red error color (`#FF6B6B`) for text and icons.
*   **Confirmation Prompt:** Triggers a Material 3 `AlertDialog` with clear, high-contrast buttons ("Cancel" and "Confirm Reset") to prevent accidental data loss.

---

## 🧭 Dynamic Theme Setup
*   **Theme Mode:** Selected to remain Dark Theme by default matching `#121212` backgrounds.
*   **System Integration:** Automatically coordinates status bar icons and bottom software keys to dark tones.
