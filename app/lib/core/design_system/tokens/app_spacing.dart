/// Centralized spacing tokens for the WordSmart design system.
///
/// Use these constants instead of inline numeric padding/margin
/// values to maintain a consistent spatial rhythm across the app.
abstract final class AppSpacing {
  /// 4.0 — tight internal padding
  static const double xs = 4;

  /// 8.0 — small gaps, icon padding
  static const double sm = 8;

  /// 16.0 — standard gap between list tiles and cards
  static const double md = 16;

  /// 24.0 — primary screen outer edge margins
  static const double lg = 24;

  /// 32.0 — large vertical breaks between page sections
  static const double xl = 32;

  /// 48.0 — top headers margin spacing
  static const double xxl = 48;

  /// 32.0 — legacy/extended page-level top/bottom margins
  static const double xxxl = 32;

  /// 48.0 — legacy/extended hero spacing
  static const double hero = 48;

  // ── Border Radius ─────────────────────────────────────────────
  /// 4.0 — small rounded corners (checkboxes, inline tags)
  static const double radiusSm = 4;

  /// 8.0 — medium rounded corners (etymology panels, search rows)
  static const double radiusMd = 8;

  /// 12.0 — standard rounded corners (dialog overlays, filter chips)
  static const double radiusLg = 12;

  /// 16.0 — large rounded corners (standard cards)
  static const double radiusXl = 16;

  /// 20.0 — primary filled/outlined buttons capsule shape
  static const double radiusXxl = 20;

  /// 28.0 — pill-shaped search input bar
  static const double radiusFull = 28;
}
