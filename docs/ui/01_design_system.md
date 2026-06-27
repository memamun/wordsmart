# WordSmart Design System Specifications

This document outlines the visual foundation, branding guide, and styling rules for WordSmart.

---

## 🎨 Visual Identity & Style

WordSmart's design is centered on **Enlightened Learning**. The visual tone targets sophisticated adult learners preparing for exams like GRE, SAT, and IELTS. It avoids playful or child-like illustrations, opting instead for a premium, clean, and highly focused aesthetic.

### Creative North Star: "The Tonal Sanctuary"
*   **Minimalism:** Avoid structural borders, boxes, and heavy dividers. Use padding and white space to separate logic blocks.
*   **Glassmorphism:** Use semi-transparent layers with high backdrop-blur and subtle borders at low opacity to create depth.
*   **Luminescence:** Elements emerge from a dark canvas through subtle variations in surface light and soft, atmospheric glows around active items.

---

## 🌈 Color Palette & Tonal Surface Tiers

| Token Name | Hex Code | Opacity | UI Role / Usage |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `#FFB900` | 100% | Amber. Used for the vocabulary word, primary active buttons, and selected states. |
| **Secondary Accent** | `#26A69A` | 100% | Muted Teal. Used for definitions, phonetic markings, correct answers, and progress. |
| **Canvas Background**| `#121212` | 100% | Base canvas. Deep charcoal to minimize eye fatigue in low-light environments. |
| **Surface Tier 1** | `#1E1E1E` | 100% | Card backings, dialogs, inputs, and floating containers. |
| **Surface Tier 2** | `#2C2C2C` | 100% | Hover/active states, active list item selections. |
| **Text Primary** | `#F5F5F5` | 100% | High-readability off-white for all primary text and headers. |
| **Text Secondary** | `#B0B0B0` | 100% | Muted light gray for subtitles, tags, and secondary metadata. |

---

## 📐 Typography & Bengali Integration

WordSmart utilizes three specific font pairings to maintain high contrast and editorial styling:

1.  **Outfit (Latin Display & Titles):**
    *   **Display Word:** `fontSize: 48px`, `fontWeight: 700`, `letterSpacing: -0.02em` (Mobile: `fontSize: 38px`).
    *   **Headline Large:** `fontSize: 32px`, `fontWeight: 600`, `lineHeight: 1.3`.
2.  **Inter (Latin Body & Labels):**
    *   **Body Large:** `fontSize: 18px`, `fontWeight: 400`, `lineHeight: 1.6`.
    *   **Body Medium:** `fontSize: 16px`, `fontWeight: 400`, `lineHeight: 1.5`.
3.  **Hind Siliguri (Bengali Content):**
    *   Integrated seamlessly for Bengali definitions and meanings.
    *   **Metric Adjustment:** Hind Siliguri text line-height must be increased by **20%** compared to Latin text to accommodate the script's ascenders and descenders.

---

## 📏 Layout & Spacing Rules

WordSmart follows a strict **8dp Baseline Grid** to maintain engineering alignment:

*   **Primary Padding:** Cards and screens use `base * 3` (**24dp**) side margins on mobile.
*   **Gap Scale:**
    *   `element-gap`: **16dp** (vertical gaps between standard list items/inputs).
    *   `section-gap`: **32dp** (vertical gaps between distinct content blocks like card definitions and examples).
*   **List Items:** List items must be borderless. Spacing is maintained using `list-item-padding` (**16dp**) and tonal color shifts on tap/hover.

---

## 🛡️ Shapes & Radii

*   **Containers & Cards:** Use a uniform corner radius of `0.5rem` (**8dp**) for all content cards, search bars, and progress panels to maintain structural alignment.
*   **Interactive Components:** Pill-shaped elements (buttons, filter tags) use `rounded-xl` (**24dp**) or fully circular frames.

---

## 💾 Elevation & Shadows

*   **Tonal Elevations:** Instead of drop shadows, elevation is represented by shifting surface colors (Base `#121212` -> Card `#1E1E1E` -> Active `#2C2C2C`).
*   **Atmospheric Glow:** The active word details card features a soft Amber outer drop shadow to create a light-emitting feel:
    *   `box-shadow: 0 10px 30px rgba(255, 185, 0, 0.08)`
