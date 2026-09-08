package io.github.memamun.wordsmart.ui.theme

import androidx.compose.ui.graphics.Color

// ============================================================================
// WORDSMART DESIGN SYSTEM COLOR TOKENS (PARITY WITH WEB / web/src/index.css)
// ============================================================================

// --- Dark Mode Surface & Canvas ---
val CanvasDark = Color(0xFF090B11)          // --bg-canvas
val SurfaceDark = Color(0xFF121824)         // --bg-surface
val SurfaceElevatedDark = Color(0xFF1E293B) // --bg-surface-elevated
val BorderMutedDark = Color(0xFF2D3B55)     // --border-muted

// --- Light Mode Surface & Canvas ---
val CanvasLight = Color(0xFFF8FAFC)         // --bg-canvas
val SurfaceLight = Color(0xFFFFFFFF)        // --bg-surface
val SurfaceElevatedLight = Color(0xFFF1F5F9)// --bg-surface-elevated
val BorderMutedLight = Color(0xFFE2E8F0)    // --border-muted

// --- Dark Mode Text Hierarchy ---
val TextPrimaryDark = Color(0xFFF8FAFC)     // --text-primary
val TextSecondaryDark = Color(0xFFE2E8F0)   // --text-secondary
val TextMutedDark = Color(0xFF94A3B8)       // --text-muted

// --- Light Mode Text Hierarchy ---
val TextPrimaryLight = Color(0xFF0F172A)    // --text-primary
val TextSecondaryLight = Color(0xFF334155)  // --text-secondary
val TextMutedLight = Color(0xFF64748B)      // --text-muted

// --- Brand & Gamification Accents (Shared / High Contrast) ---
val ThemeYellow = Color(0xFFFFD54F)         // XP, Coins & Highlights
val ThemeYellowLight = Color(0xFFD97706)    // XP, Coins in Light Mode
val ThemeGreen = Color(0xFF69F0AE)          // Success, Mastered status
val ThemeGreenLight = Color(0xFF16A34A)     // Success in Light Mode
val ThemeCyan = Color(0xFF00E5FF)           // Primary Accent, Links, Roadmap
val ThemeCyanLight = Color(0xFF0284C7)      // Primary Accent in Light Mode
val ThemeRed = Color(0xFFFF5252)            // Danger, Hearts, Incorrect
val ThemeRedLight = Color(0xFFDC2626)       // Danger in Light Mode
val ThemePurple = Color(0xFF8B5CF6)         // Royal Stages, AI Genius
val ThemePurpleLight = Color(0xFF7C3AED)    // Royal Stages in Light Mode
val ThemeOrange = Color(0xFFFF9100)         // Streak Flame
val ThemeOrangeLight = Color(0xFFEA580C)    // Streak Flame in Light Mode
val ThemeBlue = Color(0xFF40C4FF)           // Synonyms & Info
val ThemeBlueLight = Color(0xFF2563EB)      // Synonyms in Light Mode

// --- Bento Semantic Tokens ---
val SynonymDark = Color(0xFF38BDF8)
val SynonymLight = Color(0xFF0284C7)
val AntonymDark = Color(0xFFF87171)
val AntonymLight = Color(0xFFDC2626)
val CollocationDark = Color(0xFFE040FB)
val CollocationLight = Color(0xFF7C3AED)
val MnemonicDark = Color(0xFFFFD54F)
val MnemonicLight = Color(0xFFD97706)
val SentenceDark = Color(0xFF10B981)
val SentenceLight = Color(0xFF059669)

// --- Quiz Feedback Tokens ---
val QuizCorrectBgDark = Color(0x1F00E676)
val QuizCorrectTextDark = Color(0xFF00E676)
val QuizCorrectBgLight = Color(0x1F16A34A)
val QuizCorrectTextLight = Color(0xFF15803D)

val QuizIncorrectBgDark = Color(0x1FFF5252)
val QuizIncorrectTextDark = Color(0xFFFF5252)
val QuizIncorrectBgLight = Color(0x1FEF4444)
val QuizIncorrectTextLight = Color(0xFFDC2626)
