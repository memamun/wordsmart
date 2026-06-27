# WordSmart Reusable Component Library Spec

This document defines the properties and implementation guidelines for the reusable components of the WordSmart Material 3 design system.

---

## 🔍 1. Search Bar
The central visual anchor of the application.
*   **Widget:** `SearchBar` (Flutter)
*   **Dimensions:** Height `56dp`, Width: match parent with `16dp` horizontal margins.
*   **Shape:** `RoundedRectangleBorder(borderRadius: BorderRadius.circular(28))` (Pill shape)
*   **Colors:** Background `#1E1E1E` (Surface), Border `rgba(255, 255, 255, 0.08)` (Divider).
*   **Typography:** Hint text in Inter, `#B0B0B0` (Text Secondary), size `16sp`.
*   **Icons:** Leading search icon in `#B0B0B0`.
*   **Interactive Behavior:** On focus, the border color animates to `#FFB900` (Primary Accent) with a soft glow, and keyboard launches instantly.

---

## 📇 2. Word Card
The primary content vessel.
*   **Widget:** `Card` (Flutter)
*   **Shape:** `RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))`
*   **Border:** `Border.all(color: rgba(255,255,255,0.08), width: 1)`
*   **Internal Padding:** `20dp` on all sides.
*   **Typography:** Word in Outfit Bold (`38sp`), Bengali definition in Hind Siliguri (`17sp`), definition in Inter Medium (`17sp`).
*   **Elevation:** Level 1 (`0dp` shadow, tonal color overlay).
*   **Hero variant:** Features an Amber shadow aura (`box-shadow: 0 10px 30px rgba(255, 185, 0, 0.08)`).

---

## 🏷️ 3. Chip (Tags)
Used for parts of speech and categories.
*   **Widget:** `RawChip` or `Chip` (Flutter)
*   **Shape:** `StadiumBorder` (fully rounded capsule)
*   **Padding:** Horizontal `12dp`, Vertical `6dp`.
*   **Colors:**
    *   *Noun/Verb/Adj:* 10% opacity Teal (`rgba(38, 166, 154, 0.1)`) background with 100% solid Teal text.
    *   *Special/Focus:* 10% opacity Amber (`rgba(255, 185, 0, 0.1)`) background with 100% solid Amber text.
*   **Typography:** JetBrains Mono, size `12sp`, bold, uppercase.

---

## 🔊 4. Audio Play Button
Tactile playback control for pronunciations.
*   **Widget:** `IconButton` inside a circular container.
*   **Dimensions:** Outer circle `44dp` x `44dp`.
*   **Shape:** Circular.
*   **Colors:** Translucent glass surface (`rgba(255, 255, 255, 0.05)`) with a thin outline. Volume icon in `#F5F5F5` (Text Primary).
*   **Tactile Animation:** Pressing scales the button to `0.95x` using `easeOutCubic` curve over `150ms`.

---

## ⭐ 5. Bookmark Button
Toggle indicator for saving words.
*   **Widget:** `IconButton` (Flutter)
*   **Inactive State:** Hollow outline star icon in `#B0B0B0` (Text Secondary).
*   **Active State:** Solid filled star icon in `#FFB900` (Primary Amber) with a subtle glowing filter.
*   **Behavior:** Instant state change with haptic feedback tick.

---

## 📊 6. Progress Indicator
Visual representation of word mastery.
*   **Widget:** `LinearProgressIndicator` (Flutter)
*   **Dimensions:** Height `8dp` (general UI) or `12dp` (statistics dashboard).
*   **Shape:** Fully rounded ends (`BorderRadius.circular(6)`).
*   **Colors:** Active track `#26A69A` (Secondary Teal), background track `#262626` (Surface Elevated).

---

## 📭 7. Empty State
Fallback screen when search has no results or list is empty.
*   **Layout:** Vertical centered stack with generous padding.
*   **Typography:** Header in Outfit SemiBold (`28sp`, `#F5F5F5`), Description in Inter (`16sp`, `#B0B0B0`).
*   **Style:** Clean, no childish cartoons or vectors. Focuses on an elegant, distraction-free typographic notice.

---

## 🧭 8. Bottom Navigation
Global tab router.
*   **Widget:** `NavigationBar` (Flutter Material 3)
*   **Dimensions:** Height `80dp`.
*   **Colors:** Background `#121212`, zero shadows, flat styling.
*   **Indicator:** Oval container (`#262626`) around the active icon.
*   **Selected Label Color:** `#FFB900` (Amber).
*   **Unselected Label Color:** `#B0B0B0`.
