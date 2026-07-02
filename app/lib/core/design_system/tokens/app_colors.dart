import 'package:flutter/material.dart';

/// Raw hex colors defined by the brand guidelines.
/// Features and widgets must NEVER reference this class directly.
abstract final class AppPalette {
  static const Color canvas = Color(0xFF121212);
  static const Color surface = Color(0xFF1E1E1E);
  static const Color surfaceHigh = Color(0xFF2C2C2C);
  static const Color teal = Color(0xFF26A69A);
  static const Color amber = Color(0xFFFFB900);
  static const Color coral = Color(0xFFFF8A80);
  static const Color offWhite = Color(0xFFF5F5F5);
  static const Color lightGrey = Color(0xFFB0B0B0);
  static const Color mediumGrey = Color(0xFF888888);
  static const Color darkGrey = Color(0xFF555555);
  static const Color borderOverlay = Color(0x14FFFFFF); // 8% transparent white overlay
  
  // Legacy/utility palette elements
  static const Color grey61 = Color(0xFF616161);
  static const Color sandBiege = Color(0xFFD5C4AB);
}

/// Semantic colors used by widgets throughout the application.
abstract final class AppColors {
  static const Color canvas = AppPalette.canvas;
  static const Color surface = AppPalette.surface;
  static const Color surfaceHigh = AppPalette.surfaceHigh;
  
  /// Primary brand actions and triggers
  static const Color primary = AppPalette.teal;

  /// Intentionally identical to primary in v0.5.x.
  /// They remain separate semantic tokens so they can diverge later
  /// without changing widget code.
  static const Color success = AppPalette.teal;
  
  static const Color error = AppPalette.coral; // Soft Red
  static const Color warning = AppPalette.amber;
  static const Color divider = AppPalette.borderOverlay;
  
  static const Color textPrimary = AppPalette.offWhite;
  static const Color textSecondary = AppPalette.lightGrey;
  static const Color textMuted = AppPalette.mediumGrey;
  static const Color textDark = AppPalette.darkGrey;
  
  static const Color disabled = AppPalette.grey61;
  static const Color mnemonicText = AppPalette.sandBiege;

  // Preserve some legacy tags temporarily to prevent compilation errors
  // but mark them as deprecated/to-be-removed.
  @deprecated
  static const Color teal = AppPalette.teal;
  @deprecated
  static const Color amber = AppPalette.amber;
  @deprecated
  static const Color coral = AppPalette.coral;
}
