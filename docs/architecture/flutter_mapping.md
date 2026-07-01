# WordSmart Flutter Material 3 Mapping Guide

This document maps WordSmart design tokens and components to Flutter's Material 3 `ThemeData` configuration and custom `ThemeExtension` properties.

---

## 🎨 ThemeData Configuration
Implement global styles inside `ThemeData` so UI widgets inherit visual tokens automatically:

```dart
ThemeData wordSmartDarkTheme = ThemeData(
  useMaterial3: true,
  brightness: Brightness.dark,
  
  // 1. Color Scheme Mappings
  colorScheme: const ColorScheme.dark(
    background: Color(0xFF121212),       // Flat canvas background
    surface: Color(0xFF1E1E1E),          // Card containers
    surfaceVariant: Color(0xFF262626),   // Elevated cards/panels
    primary: Color(0xFF26A69A),          // Teal primary accent
    secondary: Color(0xFF80D8FF),        // Light Blue secondary
    error: Color(0xFFFF6B6B),            // Red error elements
    onBackground: Color(0xFFF5F5F5),     // Off-white text
    onSurface: Color(0xFFF5F5F5),        // Card text
    onSurfaceVariant: Color(0xFFB0B0B0), // Grey secondary labels
    outline: Color(0x15FFFFFF),          // rgba(255,255,255,0.08) divider
  ),

  // 2. Typography TextTheme Mapping
  textTheme: const TextTheme(
    displayLarge: TextStyle(
      fontFamily: 'Outfit',
      fontSize: 48,
      fontWeight: FontWeight.bold,
      color: Color(0xFFF5F5F5),
    ), // Vocabulary Display Word headwords
    headlineMedium: TextStyle(
      fontFamily: 'Outfit',
      fontSize: 28,
      fontWeight: FontWeight.w600,
      color: Color(0xFFF5F5F5),
    ), // Pinned screen headers & section titles
    titleLarge: TextStyle(
      fontFamily: 'Inter',
      fontSize: 17,
      fontWeight: FontWeight.w500,
      color: Color(0xFFF5F5F5),
    ), // English definition text
    bodyLarge: TextStyle(
      fontFamily: 'Inter',
      fontSize: 16,
      height: 1.4,
      color: Color(0xFFF5F5F5),
    ), // Example sentences and paragraphs
    labelLarge: TextStyle(
      fontFamily: 'JetBrainsMono',
      fontSize: 12,
      fontWeight: FontWeight.w500,
      color: Color(0xFFB0B0B0),
    ), // Metadata, POS tag chips, and details labels
  ),

  // 3. Card Configuration
  cardTheme: CardTheme(
    color: const Color(0xFF1E1E1E),
    elevation: 0,
    margin: EdgeInsets.zero,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16), // radius-xl
      side: const BorderSide(color: Color(0x15FFFFFF), width: 1), // stroke-thin
    ),
  ),

  // 4. Search Bar Configuration
  searchBarTheme: SearchBarThemeData(
    backgroundColor: MaterialStateProperty.all(const Color(0xFF1E1E1E)),
    elevation: MaterialStateProperty.all(0),
    shape: MaterialStateProperty.all(
      RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(28), // radius-full
        side: const BorderSide(color: Color(0x15FFFFFF), width: 1),
      ),
    ),
  ),

  // 5. Chips Configuration
  chipTheme: ChipThemeData(
    backgroundColor: const Color(0x1A26A69A), // 10% Teal
    elevation: 0,
    pressElevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12), // radius-lg
      side: BorderSide.none,
    ),
  ),

  // 6. Navigation Bar Configuration
  navigationBarTheme: NavigationBarThemeData(
    backgroundColor: Colors.transparent,
    elevation: 0,
    indicatorColor: const Color(0x1A26A69A), // Teal capsule highlight
    iconTheme: MaterialStateProperty.resolveWith((states) {
      if (states.contains(MaterialState.selected)) {
        return const IconThemeData(color: Color(0xFF26A69A));
      }
      return const IconThemeData(color: Color(0xFFB0B0B0));
    }),
  ),

  // 7. Button Theme Mappings
  filledButtonTheme: FilledButtonThemeData(
    style: FilledButton.styleFrom(
      backgroundColor: const Color(0xFFFFB900), // Amber active triggers
      foregroundColor: Colors.black,
      minimumSize: const Size(88, 48), // touch target
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20), // radius-xxl
      ),
    ),
  ),
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      foregroundColor: const Color(0xFF26A69A), // Teal outlines
      side: const BorderSide(color: Color(0xFF26A69A), width: 1),
      minimumSize: const Size(88, 48),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
    ),
  ),

  // 8. Text Input Form Fields Configuration
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: const Color(0xFF1E1E1E),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(28),
      borderSide: const BorderSide(color: Color(0x15FFFFFF), width: 1),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(28),
      borderSide: const BorderSide(color: Color(0xFF26A69A), width: 2), // stroke-thick
    ),
  ),

  // 9. Divider Theme Configuration
  dividerTheme: const DividerThemeData(
    color: Color(0x15FFFFFF),
    thickness: 1, // stroke-thin
    space: 1,
  ),

  // 10. ListTile Theme Configuration
  listTileTheme: const ListTileThemeData(
    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    minVerticalPadding: 12,
  ),
);
```

---

## 💎 WordSmart Theme Extensions
For properties unique to WordSmart that do not fit inside default ThemeData buckets, we define custom extensions:

```dart
class WordSmartThemeExtension extends ThemeExtension<WordSmartThemeExtension> {
  final TextStyle? displayWordStyle;
  final TextStyle? bengaliTextStyle;
  final TextStyle? difficultyChipStyle;
  final BoxShadow? featuredCardGlow;
  final Gradient? studyProgressGradient;
  final double? wordCardPadding;
  final double? sectionSpacing;

  const WordSmartThemeExtension({
    required this.displayWordStyle,
    required this.bengaliTextStyle,
    required this.difficultyChipStyle,
    required this.featuredCardGlow,
    required this.studyProgressGradient,
    required this.wordCardPadding,
    required this.sectionSpacing,
  });

  @override
  ThemeExtension<WordSmartThemeExtension> copyWith({
    TextStyle? displayWordStyle,
    TextStyle? bengaliTextStyle,
    TextStyle? difficultyChipStyle,
    BoxShadow? featuredCardGlow,
    Gradient? studyProgressGradient,
    double? wordCardPadding,
    double? sectionSpacing,
  }) {
    return WordSmartThemeExtension(
      displayWordStyle: displayWordStyle ?? this.displayWordStyle,
      bengaliTextStyle: bengaliTextStyle ?? this.bengaliTextStyle,
      difficultyChipStyle: difficultyChipStyle ?? this.difficultyChipStyle,
      featuredCardGlow: featuredCardGlow ?? this.featuredCardGlow,
      studyProgressGradient: studyProgressGradient ?? this.studyProgressGradient,
      wordCardPadding: wordCardPadding ?? this.wordCardPadding,
      sectionSpacing: sectionSpacing ?? this.sectionSpacing,
    );
  }

  @override
  ThemeExtension<WordSmartThemeExtension> lerp(
    ThemeExtension<WordSmartThemeExtension>? other,
    double t,
  ) {
    if (other is! WordSmartThemeExtension) return this;
    return WordSmartThemeExtension(
      displayWordStyle: TextStyle.lerp(displayWordStyle, other.displayWordStyle, t),
      bengaliTextStyle: TextStyle.lerp(bengaliTextStyle, other.bengaliTextStyle, t),
      difficultyChipStyle: TextStyle.lerp(difficultyChipStyle, other.difficultyChipStyle, t),
      featuredCardGlow: BoxShadow.lerp(featuredCardGlow, other.featuredCardGlow, t),
      studyProgressGradient: Gradient.lerp(studyProgressGradient, other.studyProgressGradient, t),
      wordCardPadding: lerpDouble(wordCardPadding, other.wordCardPadding, t),
      sectionSpacing: lerpDouble(sectionSpacing, other.sectionSpacing, t),
    );
  }
}
```
