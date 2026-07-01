# WordSmart Design System Guide

This document establishes the structural components, semantic color rules, iconography guidelines, and layout restrictions (Don'ts) for WordSmart.

---

## 🎨 Semantic Color System
Color must communicate meaning, not decoration. The color palette maps semantic values to standard interface roles:

| Semantic Role | Hex Code | UI Application |
| :--- | :--- | :--- |
| **Primary** | `#26A69A` | Teal. Primary action outlines, selection highlights, progress |
| **Secondary** | `#80D8FF` | Light Blue. Sub-highlights, secondary details |
| **Success** | `#26A69A` | Teal. Correct answers, completions |
| **Warning / Active**| `#FFB900` | Amber. active streaks, active daily goals, bookmark stars |
| **Error** | `#FF6B6B` | Soft Red. Wrong quiz answers, danger zone actions |
| **Info** | `#80D8FF` | Light Blue. Supportive notification cards |
| **Accent** | `#FFB900` | Amber. High-priority focal point badges |
| **Surface** | `#1E1E1E` | Flat card container backings |
| **Outline** | `rgba(255,255,255,0.08)` | Thin transparent card outlines (1dp) |
| **Divider** | `rgba(255,255,255,0.08)` | Hairline dividers |
| **Text** | `#F5F5F5` | Off-white. Primary reading text |

---

## 💬 Iconography System
*   **Icon Library:** Use **Rounded Material Symbols** exclusively.
*   **Minimalist Icon Rule:** Restrict icons strictly to Danger controls, Audio play triggers, Notification settings, and Storage panels. Text labels are preferred elsewhere.
*   **Filled vs Outlined States:**
    *   *Outlined (`☆`):* Represents inactive or toggled-off states (e.g. Unsaved Bookmark).
    *   *Filled (`★`):* Represents active or toggled-on states (e.g. Saved Bookmark).

---

## 🚫 Design Restrictions (The Don'ts)
To preserve visual consistency, layout developers must adhere to the following rules:
*   **Don't** use more than 2 accent colors on any single view.
*   **Don't** render more than one Hero progress card above the fold.
*   **Don't** nest cards (avoid putting card containers inside other cards).
*   **Don't** overlay dialog windows on top of other active dialogs.
*   **Don't** render more than one Floating Action Button (FAB) on a screen.
*   **Don't** float action buttons directly over scrollable body reading text.
*   **Don't** mix multiple scroll directions (e.g. nested vertical and horizontal grids), except for the horizontal mini RecentWordsCarousel.
*   **Don't** present more than one solid primary CTA button per view.
*   **Don't** use heavy backdrop blurs (keep filters minimal to avoid rendering latency).
*   **Don't** specify drop shadows exceeding `12dp`.
