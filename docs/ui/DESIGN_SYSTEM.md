# WordSmart Design System v2.0

*   **Platform:** Flutter (Material 3)
*   **Target OS:** Android 16+, iOS 18+
*   **Theme Concept:** Premium Editorial Learning Experience

---

## 🎨 Color Palette Tokens

| Token Name | Hex Value | UI Role / Usage |
| :--- | :--- | :--- |
| **Background** | `#121212` | Main page canvas (Deep Charcoal) |
| **Surface** | `#1E1E1E` | Primary cards, inputs, and container backings |
| **Surface Elevated**| `#262626` | Elevated panels, active states, list overlays |
| **Primary** | `#FFB900` | Amber. Vocabulary display word, bookmarks, primary actions |
| **Secondary** | `#26A69A` | Teal. Definitions, success indicators, progress |
| **Accent** | `#80D8FF` | Light Blue. Sub-highlights, secondary details |
| **Error** | `#FF6B6B` | Soft Red. Warning states, overdue items |
| **Text Primary** | `#F5F5F5` | Off-white. High contrast reading text and headlines |
| **Text Secondary** | `#B0B0B0` | Muted gray. Subtitles, metadata, and labels |
| **Divider** | `rgba(255,255,255,0.08)` | Thin transparent outlines and separations |

---

## 🔤 Typography Tokens

All text scales align to standard Material 3 typography roles.

*   **Display Word:** Outfit Bold · `48sp` (Vocabulary headword).
*   **Headline:** Outfit SemiBold · `28sp` (Screen headers & section titles).
*   **Body Text:** Inter · `16sp` (Contextual sentences, examples).
*   **Definition:** Inter Medium · `17sp` (English definition).
*   **Bengali Text:** Hind Siliguri · `17sp` (Bengali translation, lines formatted with `+20%` height).
*   **Label:** JetBrains Mono · `12sp` (Metadata, part of speech chips).

---

## 📐 Shape & Corner Tokens

*   **Cards:** `16dp` (rounded-2xl)
*   **Buttons:** `20dp` (rounded-xl)
*   **Search Input:** `28dp` (pill-shaped)
*   **Avatar:** Circular (`50%` radius)
*   **Stroke Width:** `1dp` for outlines.

---

## 🎬 Motion & Animation Tokens

*   **Duration:** `200ms` to `250ms` (standard transition limit).
*   **Curve:** `easeOutCubic` (natural deceleration).
*   **Allowed Transitions:** Fade, Scale, Hero, Card Elevation, Ripple, Page Transition.

---

## 🛠️ Flutter Material 3 Compatibility Mapping

The design tokens map directly to the `ThemeData` configuration in Flutter:

```dart
ThemeData darkTheme = ThemeData(
  useMaterial3: true,
  brightness: Brightness.dark,
  colorScheme: ColorScheme.dark(
    background: const Color(0xFF121212),
    surface: const Color(0xFF1E1E1E),
    surfaceVariant: const Color(0xFF262626),
    primary: const Color(0xFFFFB900),
    secondary: const Color(0xFF26A69A),
    error: const Color(0xFFFF6B6B),
    onBackground: const Color(0xFFF5F5F5),
    onSurface: const Color(0xFFF5F5F5),
    onSurfaceVariant: const Color(0xFFB0B0B0),
    outline: const Color(0x15FFFFFF), // rgba(255,255,255,0.08)
  ),
  cardTheme: CardTheme(
    color: const Color(0xFF1E1E1E),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
      side: const BorderSide(color: Color(0x15FFFFFF), width: 1),
    ),
    elevation: 0,
  ),
  searchBarTheme: SearchBarThemeData(
    backgroundColor: MaterialStateProperty.all(const Color(0xFF1E1E1E)),
    shape: MaterialStateProperty.all(
      RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
    ),
    elevation: MaterialStateProperty.all(0),
  ),
);
```
