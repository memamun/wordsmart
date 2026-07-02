import 'package:flutter/material.dart';

/// Centralized animation tokens for the WordSmart design system.
///
/// Use these constants instead of inline duration/curve values
/// to maintain consistent motion across the app.
abstract final class AppAnimation {
  /// Delay before showing feedback (e.g., correct/incorrect flash)
  static const Duration feedbackDelay = Duration(milliseconds: 800);

  /// Duration for flashcard flip animation
  static const Duration cardFlip = Duration(milliseconds: 400);

  /// Duration for fade-in transitions
  static const Duration fadeIn = Duration(milliseconds: 200);

  /// Default easing curve for most animations
  static const Curve defaultCurve = Curves.easeInOut;
}
