# WordSmart Design System v2

*   **Version:** 2.0
*   **Platform:** Flutter (Material 3)
*   **Target OS:** Android 16+ (SDK 36+), iOS 18+
*   **Theme Concept:** Premium Editorial Learning Experience

---

## 🏛️ Design Philosophy

WordSmart is not a dashboard. WordSmart is not a productivity tracker.

WordSmart is a premium vocabulary reading and learning experience. Every screen should feel calm, focused, elegant, and distraction-free. The vocabulary itself is the hero; the interface should disappear behind the content. The user should always know: *"I opened this app to learn words."*

---

## 🎯 UX Principles

### 1. Search First
Search is the primary action. Everything else is secondary. The search bar is the visual anchor of the Home screen.

### 2. Content First
Typography has higher priority than cards. Cards should never overpower words. The vocabulary word itself should always be the largest visual element.

### 3. Progressive Disclosure
Never overwhelm the learner. Show only essential information first, revealing more details through interaction.
*   **Discovery Flow:** Word $\rightarrow$ Pronunciation $\rightarrow$ Bengali Meaning $\rightarrow$ Definition $\rightarrow$ Examples $\rightarrow$ Roots $\rightarrow$ Derivatives $\rightarrow$ Collocations.

### 4. Visual Rhythm
Use generous whitespace. Maintain an 8dp spacing grid. Avoid visual clutter and let every section breathe.

### 5. Low Cognitive Load
Avoid excessive icons, unnecessary borders, and bright colors. Reduce decision friction and highlight only critical actions.

---

## 🎨 Visual Identity

| Style Attributes | Avoid (Anti-patterns) | Inspiration |
| :--- | :--- | :--- |
| Premium Editorial | Gaming UI / Gamified Badges | Readwise Reader |
| Minimal Material 3 | Neon / Vibrant Highlights | Apple Books |
| Subtle Glass Surfaces | Heavy/Aggressive Glassmorphism | Apple Dictionary |
| Elegant Typography | Dashboard-like layouts | Notion |
| Calm & Luxurious Reading | Crypto-style cards / shadows | Kindle |

---

## 🌈 Color Palette

```yaml
background: '#121212'
surface: '#1E1E1E'
surface-elevated: '#262626'
primary: '#FFB900'          # Amber (attention guide)
secondary: '#26A69A'        # Teal (learning status)
accent: '#80D8FF'           # Accent highlights
error: '#FF6B6B'            # Alert states
text-primary: '#F5F5F5'     # High contrast off-white
text-secondary: '#B0B0B0'   # Muted metadata gray
divider: 'rgba(255, 255, 255, 0.08)'
```

---

## 🔤 Typography & Script Hierarchy

*   **Display Word:** Outfit Bold · `48sp` (Main vocabulary word).
*   **Headline:** Outfit SemiBold · `28sp` (Section titles & screen headers).
*   **Body Text:** Inter · `16sp` (Examples, collocations, descriptions).
*   **Definition:** Inter Medium · `17sp` (English definitions).
*   **Bengali Text:** Hind Siliguri · `17sp` (Bengali translations, relaxed line-height).
*   **Label:** JetBrains Mono · `12sp` (Metadata, part of speech tags).

---

## 📐 Elevation & Corner Radii

### Elevation
Never use heavy shadows. Rely on Material 3 tonal elevations (color overlays). A very subtle Amber outer glow is permitted exclusively for the active "Word of the Day" hero container.

### Corners
*   **Cards:** `16dp` (rounded-2xl)
*   **Buttons:** `20dp` (rounded-xl)
*   **Search Input:** `28dp` (pill-shaped)
*   **Avatar:** Circular (`50%` radius)

### Motion
*   **Duration:** `250ms`
*   **Curve:** `easeOutCubic`
*   **Style:** No exaggerated or bouncy animations. Transitions must feel natural and physical.

---

## 🧩 Core Components list
1.  **Search Bar:** Centered, pill-shaped visual anchor.
2.  **Word Card:** Tonal glass surface containing headword and definition.
3.  **Section Header:** Bold Outfit typography, generous top margin.
4.  **Chip:** Low-opacity background capsule for tags.
5.  **Audio Button:** Circular glass tactile play button.
6.  **Bookmark Button:** Hollow outline to solid Amber fill star.
7.  **Progress Indicator:** Muted track with secondary Teal fill.
8.  **Empty State:** Distraction-free typography warning.
9.  **Loading Skeleton:** Soft pulsing level-2 tonal surfaces.
10. **Bottom Navigation:** M3 NavigationBar with flat surfaces.

---

## 🛠️ Flutter Compatibility & ThemeData mapping
All components are designed to map directly to standard Flutter Material 3 widgets:
*   `ColorScheme` maps colors directly (e.g. `primary` $\rightarrow$ `#FFB900`, `surface` $\rightarrow$ `#1E1E1E`).
*   `SearchBar` represents the Home search anchor.
*   `Card` utilizes `shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))`.
*   `FilledButton` and `OutlinedButton` map directly to standard Material buttons with `20dp` border radius.
*   `NavigationBar` implements bottom navigation.
*   `SliverAppBar` handles editorial parallax headers in scrollable list screens.

---

## ♿ Accessibility & Dark Mode
*   **Touch Targets:** Minimum `48dp` x `48dp` for all interactive elements.
*   **Contrast:** Fully compliant with WCAG AA+ guidelines.
*   **Dynamic Text:** Font scaling supported out of the box using `sp` units.
*   **Dark Mode:** Native Dark theme by default, future light mode adaptation maps to high-contrast paper tones.
