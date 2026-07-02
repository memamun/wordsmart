import 'package:flutter/material.dart';

/// Centralized color tokens for the WordSmart design system.
///
/// All color literals should reference these tokens instead of
/// inline `Color(0xFF...)` values. This ensures visual consistency
/// and makes theme updates a single-file change.
abstract final class AppColors {
  // ── Canvas & Surface ──────────────────────────────────────────
  /// Level 0 background canvas
  static const Color canvas = Color(0xFF121212);

  /// Level 1 elevated surface (cards, sheets)
  static const Color surface = Color(0xFF1E1E1E);

  /// Level 2 elevated surface (dialogs, popovers)
  static const Color surfaceHigh = Color(0xFF2C2C2C);

  // ── Brand ─────────────────────────────────────────────────────
  /// Primary accent — teal
  static const Color teal = Color(0xFF26A69A);

  /// Secondary accent — amber/gold
  static const Color amber = Color(0xFFFFB900);

  /// Tertiary accent — coral/salmon
  static const Color coral = Color(0xFFFF8A80);

  // ── Text ──────────────────────────────────────────────────────
  /// Primary text (headings, titles)
  static const Color textPrimary = Color(0xFFF5F5F5);

  /// Secondary text (subtitles, descriptions)
  static const Color textSecondary = Color(0xFFB0B0B0);

  /// Muted text (hints, timestamps)
  static const Color textMuted = Color(0xFF888888);

  /// Dark text for light surfaces
  static const Color textDark = Color(0xFF555555);

  // ── Feedback ──────────────────────────────────────────────────
  /// Success / correct answer
  static const Color success = Color(0xFF66BB6A);

  /// Error / incorrect answer
  static const Color error = Color(0xFFEF5350);

  /// Warning / attention
  static const Color warning = Color(0xFFFFA726);

  // ── Utility ───────────────────────────────────────────────────
  /// Divider / border
  static const Color divider = Color(0xFF333333);

  /// Disabled state
  static const Color disabled = Color(0xFF616161);

  // ── Semantic ──────────────────────────────────────────────────
  /// Mnemonic / memory aid text
  static const Color mnemonicText = Color(0xFFD5C4AB);
}
