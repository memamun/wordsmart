package io.github.memamun.wordsmart.ui.practice

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.memamun.wordsmart.ui.components.BentoCard
import io.github.memamun.wordsmart.ui.theme.ThemeCyan
import io.github.memamun.wordsmart.ui.theme.ThemeGreen
import io.github.memamun.wordsmart.ui.theme.ThemeOrange
import io.github.memamun.wordsmart.ui.theme.ThemePurple
import io.github.memamun.wordsmart.ui.theme.ThemeRed
import io.github.memamun.wordsmart.ui.theme.ThemeYellow
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme
import io.github.memamun.wordsmart.util.SoundEffectHelper
import kotlinx.coroutines.delay

data class BlitzItem(
    val word: String,
    val definition: String,
    val isCorrectMatch: Boolean
)

val BLITZ_ITEMS = listOf(
    BlitzItem("Eloquent", "Fluent or persuasive in speaking", true),
    BlitzItem("Benevolent", "Harsh and cruel to others", false),
    BlitzItem("Lucid", "Expressed clearly and easy to understand", true),
    BlitzItem("Ephemeral", "Lasting for all of eternity", false),
    BlitzItem("Resilient", "Able to recover quickly from hardship", true),
    BlitzItem("Belligerent", "Hostile and warlike in disposition", true),
    BlitzItem("Candid", "Deceitful and secretive in manner", false),
    BlitzItem("Diligent", "Careful, hardworking and conscientious", true),
    BlitzItem("Pragmatic", "Guided by idealistic illusions rather than practicality", false),
    BlitzItem("Ubiquitous", "Present, appearing, or found everywhere", true),
    BlitzItem("Meticulous", "Showing great attention to detail; very careful", true),
    BlitzItem("Fastidious", "Very relaxed and indifferent to cleanliness", false)
)

@Composable
fun TimeBlitzScreen(
    onEarnXp: (Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val soundHelper = remember { SoundEffectHelper.getInstance(context) }
    val haptic = LocalHapticFeedback.current

    var timeLeftSeconds by remember { mutableIntStateOf(60) }
    var isRunning by remember { mutableStateOf(true) }
    var currentItemIndex by remember { mutableIntStateOf(0) }
    var score by remember { mutableIntStateOf(0) }
    var streakCount by remember { mutableIntStateOf(0) }
    var correctAnswers by remember { mutableIntStateOf(0) }
    var suddenDeathMode by remember { mutableStateOf(false) }

    // Multiplier calculation: 1x, 2x (3+ in a row), 3x (5+ in a row), 4x (8+ in a row)
    val multiplier = when {
        streakCount >= 8 -> 4
        streakCount >= 5 -> 3
        streakCount >= 3 -> 2
        else -> 1
    }

    // Pulsing animation for when timer is <= 10 seconds
    val pulseTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by pulseTransition.animateFloat(
        initialValue = 1.0f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(450, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_scale"
    )

    // 1-second interval countdown timer
    LaunchedEffect(isRunning, timeLeftSeconds) {
        if (isRunning && timeLeftSeconds > 0) {
            delay(1000L)
            timeLeftSeconds--
            if (timeLeftSeconds in 1..10) {
                soundHelper.playTick()
            }
            if (timeLeftSeconds == 0) {
                isRunning = false
            }
        }
    }

    val currentBlitz = BLITZ_ITEMS[currentItemIndex % BLITZ_ITEMS.size]

    fun handleAnswer(userSaysTrue: Boolean) {
        if (!isRunning) return
        val isCorrect = (userSaysTrue == currentBlitz.isCorrectMatch)

        if (isCorrect) {
            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
            soundHelper.playCorrect()
            val pointsEarned = 10 * multiplier * (if (suddenDeathMode) 2 else 1)
            score += pointsEarned
            streakCount++
            correctAnswers++
            onEarnXp(pointsEarned)
        } else {
            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
            soundHelper.playWrong()
            streakCount = 0
            if (suddenDeathMode) {
                // Sudden death ends run on first error!
                isRunning = false
            }
        }
        currentItemIndex++
    }

    val colors = WordSmartTheme.colors

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.canvas)
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Bar & Mode Toggles
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(colors.surface)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = colors.textPrimary
                    )
                }

                // Timer Pill with pulsing animation in final 10s
                val isUrgent = timeLeftSeconds <= 10 && isRunning
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .scale(if (isUrgent) pulseScale else 1.0f)
                        .clip(RoundedCornerShape(14.dp))
                        .background(if (isUrgent) ThemeRed.copy(alpha = 0.25f) else colors.surface)
                        .border(1.5.dp, if (isUrgent) ThemeRed else colors.borderMuted, RoundedCornerShape(14.dp))
                        .padding(horizontal = 14.dp, vertical = 7.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Timer,
                        contentDescription = null,
                        tint = if (isUrgent) ThemeRed else ThemeCyan,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "${timeLeftSeconds}s",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (isUrgent) ThemeRed else ThemeCyan
                    )
                }

                // Dynamic Combo Multiplier Pill
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(if (multiplier > 1) ThemeOrange.copy(alpha = 0.2f) else colors.surface)
                        .border(1.dp, if (multiplier > 1) ThemeOrange else colors.borderMuted, RoundedCornerShape(14.dp))
                        .padding(horizontal = 12.dp, vertical = 7.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.LocalFireDepartment,
                        contentDescription = null,
                        tint = if (multiplier > 1) ThemeOrange else colors.textMuted,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${multiplier}x",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (multiplier > 1) ThemeOrange else colors.textMuted
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Sudden Death Mode Toggle Card
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(colors.surface)
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.ElectricBolt,
                        contentDescription = null,
                        tint = if (suddenDeathMode) ThemeRed else colors.textMuted,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Sudden Death (2x XP • 1 Strike Out)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (suddenDeathMode) ThemeRed else colors.textSecondary
                    )
                }
                Switch(
                    checked = suddenDeathMode,
                    onCheckedChange = { suddenDeathMode = it },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = ThemeRed,
                        uncheckedThumbColor = colors.textMuted,
                        uncheckedTrackColor = colors.surfaceElevated
                    ),
                    modifier = Modifier.scale(0.8f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Progress bar
            LinearProgressIndicator(
                progress = { (timeLeftSeconds / 60f).coerceIn(0f, 1f) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(CircleShape),
                color = if (timeLeftSeconds <= 10) ThemeRed else ThemeCyan,
                trackColor = colors.surfaceElevated
            )
        }

        if (!isRunning || timeLeftSeconds == 0) {
            // Blitz Complete Screen
            BentoCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = colors.surface,
                borderColor = ThemeYellow
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.FlashOn,
                        contentDescription = null,
                        tint = ThemeYellow,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = if (suddenDeathMode && timeLeftSeconds > 0) "Strike Out! Blitz Over" else "Time's Up! Blitz Finished!",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = colors.textPrimary,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Score: $score Points • $correctAnswers Correct Hits",
                        fontSize = 15.sp,
                        color = ThemeYellow,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = if (streakCount > 0) "Best Streak: $streakCount in a row!" else "Keep practicing to build combos!",
                        fontSize = 13.sp,
                        color = colors.textSecondary
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Button(
                        onClick = {
                            timeLeftSeconds = 60
                            isRunning = true
                            score = 0
                            streakCount = 0
                            correctAnswers = 0
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ThemeCyan, contentColor = Color(0xFF0F172A))
                    ) {
                        Icon(imageVector = Icons.Default.Refresh, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Play Again", fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else {
            // Active Rapid Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = colors.surface),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = androidx.compose.ui.graphics.SolidColor(
                        if (multiplier > 1) ThemeOrange.copy(alpha = 0.6f) else ThemeCyan.copy(alpha = 0.4f)
                    )
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    if (streakCount >= 3) {
                        Text(
                            text = "🔥 ${streakCount} COMBO STREAK (${multiplier}x XP)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = ThemeOrange,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    Text(
                        text = currentBlitz.word,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "“${currentBlitz.definition}”",
                        fontSize = 16.sp,
                        color = colors.textSecondary,
                        textAlign = TextAlign.Center,
                        lineHeight = 22.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Does this definition match?",
                        fontSize = 12.sp,
                        color = colors.textMuted
                    )
                }
            }

            // Rapid-Fire True / False Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // False Button
                Button(
                    onClick = { handleAnswer(false) },
                    modifier = Modifier
                        .weight(1f)
                        .height(60.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ThemeRed, contentColor = Color.White)
                ) {
                    Text("FALSE ✕", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
                }

                // True Button
                Button(
                    onClick = { handleAnswer(true) },
                    modifier = Modifier
                        .weight(1f)
                        .height(60.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ThemeGreen, contentColor = Color(0xFF0F172A))
                ) {
                    Text("TRUE ✓", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
    }
}

