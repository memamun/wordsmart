package io.github.memamun.wordsmart.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

// ============================================================================
// CUSTOM WORDSMART COLOR SYSTEM (PARITY WITH WEB / web/src/index.css)
// ============================================================================

data class WordSmartColors(
    val isDark: Boolean,
    val canvas: Color,
    val surface: Color,
    val surfaceElevated: Color,
    val borderMuted: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textMuted: Color,
    val themeYellow: Color,
    val themeGreen: Color,
    val themeCyan: Color,
    val themeRed: Color,
    val themePurple: Color,
    val themeOrange: Color,
    val themeBlue: Color,
    val synonym: Color,
    val antonym: Color,
    val collocation: Color,
    val mnemonic: Color,
    val sentence: Color,
    val quizCorrectBg: Color,
    val quizCorrectText: Color,
    val quizIncorrectBg: Color,
    val quizIncorrectText: Color
)

val DarkWordSmartColors = WordSmartColors(
    isDark = true,
    canvas = CanvasDark,
    surface = SurfaceDark,
    surfaceElevated = SurfaceElevatedDark,
    borderMuted = BorderMutedDark,
    textPrimary = TextPrimaryDark,
    textSecondary = TextSecondaryDark,
    textMuted = TextMutedDark,
    themeYellow = ThemeYellow,
    themeGreen = ThemeGreen,
    themeCyan = ThemeCyan,
    themeRed = ThemeRed,
    themePurple = ThemePurple,
    themeOrange = ThemeOrange,
    themeBlue = ThemeBlue,
    synonym = SynonymDark,
    antonym = AntonymDark,
    collocation = CollocationDark,
    mnemonic = MnemonicDark,
    sentence = SentenceDark,
    quizCorrectBg = QuizCorrectBgDark,
    quizCorrectText = QuizCorrectTextDark,
    quizIncorrectBg = QuizIncorrectBgDark,
    quizIncorrectText = QuizIncorrectTextDark
)

val LightWordSmartColors = WordSmartColors(
    isDark = false,
    canvas = CanvasLight,
    surface = SurfaceLight,
    surfaceElevated = SurfaceElevatedLight,
    borderMuted = BorderMutedLight,
    textPrimary = TextPrimaryLight,
    textSecondary = TextSecondaryLight,
    textMuted = TextMutedLight,
    themeYellow = ThemeYellowLight,
    themeGreen = ThemeGreenLight,
    themeCyan = ThemeCyanLight,
    themeRed = ThemeRedLight,
    themePurple = ThemePurpleLight,
    themeOrange = ThemeOrangeLight,
    themeBlue = ThemeBlueLight,
    synonym = SynonymLight,
    antonym = AntonymLight,
    collocation = CollocationLight,
    mnemonic = MnemonicLight,
    sentence = SentenceLight,
    quizCorrectBg = QuizCorrectBgLight,
    quizCorrectText = QuizCorrectTextLight,
    quizIncorrectBg = QuizIncorrectBgLight,
    quizIncorrectText = QuizIncorrectTextLight
)

val LocalWordSmartColors = staticCompositionLocalOf { DarkWordSmartColors }

val WordSmartDarkColorScheme: ColorScheme = darkColorScheme(
    primary = ThemeCyan,
    onPrimary = CanvasDark,
    primaryContainer = SurfaceElevatedDark,
    onPrimaryContainer = ThemeCyan,
    secondary = ThemeYellow,
    onSecondary = CanvasDark,
    secondaryContainer = SurfaceDark,
    onSecondaryContainer = ThemeYellow,
    tertiary = ThemePurple,
    onTertiary = Color.White,
    background = CanvasDark,
    onBackground = TextPrimaryDark,
    surface = SurfaceDark,
    onSurface = TextPrimaryDark,
    surfaceVariant = SurfaceElevatedDark,
    onSurfaceVariant = TextSecondaryDark,
    outline = BorderMutedDark,
    error = ThemeRed,
    onError = Color.White
)

val WordSmartLightColorScheme: ColorScheme = lightColorScheme(
    primary = ThemeCyanLight,
    onPrimary = Color.White,
    primaryContainer = SurfaceElevatedLight,
    onPrimaryContainer = ThemeCyanLight,
    secondary = ThemeYellowLight,
    onSecondary = Color.White,
    secondaryContainer = SurfaceLight,
    onSecondaryContainer = ThemeYellowLight,
    tertiary = ThemePurpleLight,
    onTertiary = Color.White,
    background = CanvasLight,
    onBackground = TextPrimaryLight,
    surface = SurfaceLight,
    onSurface = TextPrimaryLight,
    surfaceVariant = SurfaceElevatedLight,
    onSurfaceVariant = TextSecondaryLight,
    outline = BorderMutedLight,
    error = ThemeRedLight,
    onError = Color.White
)

object WordSmartTheme {
    val colors: WordSmartColors
        @Composable
        @ReadOnlyComposable
        get() = LocalWordSmartColors.current
}

@Composable
fun WordSmartTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val customColors = if (darkTheme) DarkWordSmartColors else LightWordSmartColors
    val materialScheme = if (darkTheme) WordSmartDarkColorScheme else WordSmartLightColorScheme

    CompositionLocalProvider(LocalWordSmartColors provides customColors) {
        MaterialTheme(
            colorScheme = materialScheme,
            typography = Typography,
            content = content
        )
    }
}

// Retain alias for backward compatibility
@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    WordSmartTheme(darkTheme = darkTheme, content = content)
}
