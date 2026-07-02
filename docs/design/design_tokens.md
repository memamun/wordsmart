# WordSmart Design Tokens

This document details the exact visual constants (tokens) for spacing, corner radii, elevation levels, opacities, and stroke weights across the WordSmart application.

---

## 📏 Spacing Grid
All paddings and layout coordinates are built around an **8dp baseline grid**.

*   `spacing-xs`: `4dp` (tight alignments, icon-to-label gaps)
*   `spacing-sm`: `8dp` (margins between POS tags and subtitles)
*   `spacing-md`: `16dp` (standard gap between list tiles and cards)
*   `spacing-lg`: `24dp` (primary screen outer edge margins)
*   `spacing-xl`: `32dp` (large vertical breaks between page sections)
*   `spacing-xxl`: `48dp` (top headers margin spacing)

---

## 📐 Corner Radii
*   `radius-sm`: `4dp` (checkboxes, inline tags)
*   `radius-md`: `8dp` (etymology panels, search history rows)
*   `radius-lg`: `12dp` (dialog overlays, filter chips)
*   `radius-xl` (Cards): `16dp` (standard WordCards and ProgressCards)
*   `radius-xxl` (Buttons): `20dp` (primary filled and outlined button capsule shapes)
*   `radius-full` (Search): `28dp` (pill-shaped SearchBar)
*   `radius-circular`: `50%` (avatar frames)

---

## 💾 Elevation & Tonal Levels
WordSmart uses Material 3 tonal elevations (overlay tints) rather than drop shadows.
*   `elevation-0`: `0dp` (Flat page canvas `#121212`)
*   `elevation-1`: `1dp` tonal overlay (Surface card background `#1E1E1E`)
*   `elevation-2`: `3dp` tonal overlay (Elevated card background `#262626`)
*   `elevation-glow` (Hero Glow): Amber shadow overlay:
    `box-shadow: 0 10px 30px rgba(255, 185, 0, 0.08)`

---

## 🌫️ Opacity Scale
*   `opacity-full`: `1.0` (active body text)
*   `opacity-active-icon`: `0.89` (primary toolbar icons)
*   `opacity-medium`: `0.6` (secondary labels, muted POS chips)
*   `opacity-disabled`: `0.38` (disabled states, inactive navigation labels)
*   `opacity-glass`: `0.08` (translucent outlines, card overlays)
*   `opacity-tint`: `0.1` (category tag background opacity)

---

## ✏️ Stroke Widths
*   `stroke-thin`: `1dp` (default border outline for cards)
*   `stroke-thick`: `2dp` (focused input outline, selected answer state outlines)

---

## 📐 UI Dimensions
*   `icon-sm`: `20dp` (embedded inside chips or chips inline lists)
*   `icon-md`: `24dp` (toolbar icons, back chevrons)
*   `icon-lg`: `32dp` (large star bookmark toggles)
*   `avatar-sm`: `32dp` diameter (header profile picture)
*   `button-audio-size`: `44dp` diameter (touch-friendly pronunciation audio buttons)

---

## 🥞 Z-Index Layers
*   `layer-base`: `0` (main scroll canvas)
*   `layer-sticky`: `10` (pinned headers, search inputs)
*   `layer-navigation`: `100` (bottom navigation bars)
*   `layer-modal`: `1000` (dialogs, bottom sheets)
*   `layer-toast`: `2000` (undo snackbars, notifications)

---

## 🖱️ Interaction States (Opacity Overlays)
*   `state-hover`: `4%` white overlay (`rgba(255,255,255,0.04)`)
*   `state-pressed`: `12%` white overlay (`rgba(255,255,255,0.12)`)
*   `state-focused`: `12%` white overlay (`rgba(255,255,255,0.12)`)
