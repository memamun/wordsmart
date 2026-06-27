# WordSmart Design Tokens

This document contains visual design constants (tokens) for spacing, radii, elevations, opacity, stroke widths, and component sizes to maintain consistency across design specs and code.

---

## 📏 Spacing Scale
All margins and padding align to an **8dp baseline grid**.

*   `spacing-xs`: `4dp` (fine alignments between label and icon).
*   `spacing-sm`: `8dp` (margins between POS tags and phonetic texts).
*   `spacing-md`: `16dp` (standard gap between sibling cards, list items).
*   `spacing-lg`: `24dp` (primary screen outer padding on mobile).
*   `spacing-xl`: `32dp` (section spacing between definitions and lists).
*   `spacing-xxl`: `48dp` (large layout dividers and header top paddings).

---

## 📐 Corner Radii Scale

*   `radius-sm`: `4dp` (small checkboxes, inner card sub-elements).
*   `radius-md`: `8dp` (standard details cards, etymology panel).
*   `radius-lg`: `12dp` (dialog boxes, action chips).
*   `radius-xl` (Cards): `16dp` (main content word cards, progress summary cards).
*   `radius-xxl` (Buttons): `20dp` (primary filled and outlined action buttons).
*   `radius-full` (Search): `28dp` (pill-shaped search input bar).
*   `radius-circular`: `50%` (profile avatar frames).

---

## 💾 Elevation Tonal Levels
WordSmart uses Material 3 tonal elevation instead of traditional shadows.

*   `elevation-0`: `0dp` (flat surface background `#121212`).
*   `elevation-1`: `1dp` tonal overlay (Surface card background `#1E1E1E`).
*   `elevation-2`: `3dp` tonal overlay (Surface Elevated card background `#262626`).
*   `elevation-glow` (Hero): Soft Amber shadow overlay:
    *   `box-shadow: 0 10px 30px rgba(255, 185, 0, 0.08)`.

---

## 🌫️ Opacity Scale

*   `opacity-full`: `1.0` (active readable text).
*   `opacity-medium`: `0.6` (secondary subtitles, grey POS tags).
*   `opacity-disabled`: `0.38` (disabled states, inactive navigation labels).
*   `opacity-glass`: `0.08` (translucent outlines, card overlays).
*   `opacity-tint`: `0.1` (used for category chip background colors, e.g. 10% Teal).

---

## ✏️ Stroke Width Scale

*   `stroke-thin`: `1dp` (default card outline borders).
*   `stroke-thick`: `2dp` (focused active input fields, selected answer states).

---

## 📐 Icon & Avatar Dimensions

*   `icon-sm`: `20dp` (inside chips, bullet points).
*   `icon-md` (Default): `24dp` (standard toolbar icons, back buttons, chevrons).
*   `icon-lg`: `32dp` (featured card bookmarks).
*   `avatar-sm`: `32dp` diameter (header profile picture).
*   `button-audio-size`: `44dp` diameter (pronunciation audio trigger).
