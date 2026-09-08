package io.github.memamun.wordsmart.ui.practice

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
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

data class DualBlankChallenge(
    val id: Int,
    val passagePrompt: String,
    val blank1Options: List<String>,
    val blank2Options: List<String>,
    val correctBlank1Index: Int,
    val correctBlank2Index: Int,
    val explanation: String
)

val ADVANCED_DUAL_BLANKS = listOf(
    DualBlankChallenge(
        id = 1,
        passagePrompt = "Although the keynote speaker was anticipated to be ________ (i) and aggressive, her delivery was surprisingly ________ (ii) and conciliatory.",
        blank1Options = listOf("Belligerent", "Lucid", "Ephemeral"),
        blank2Options = listOf("Circumspect", "Pernicious", "Loquacious"),
        correctBlank1Index = 0,
        correctBlank2Index = 0,
        explanation = "The contrast word 'Although' sets up an opposition between an expected combative demeanor (Belligerent) and an actual cautious/prudent approach (Circumspect)."
    ),
    DualBlankChallenge(
        id = 2,
        passagePrompt = "The author’s prose was so ________ (i) that only specialized scholars could decipher its nuances, rendering its widespread cultural impact ________ (ii).",
        blank1Options = listOf("Esoteric", "Pragmatic", "Eloquent"),
        blank2Options = listOf("Ephemeral", "Ubiquitous", "Resilient"),
        correctBlank1Index = 0,
        correctBlank2Index = 0,
        explanation = "If only specialized scholars can decipher it, the text is esoteric; hence its widespread general impact would be fleeting or minimal (ephemeral)."
    )
)

@Composable
fun AdvancedQuizzesScreen(
    onEarnXp: (Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = WordSmartTheme.colors
    var challengeIndex by remember { mutableIntStateOf(0) }
    var selectedBlank1 by remember { mutableStateOf<Int?>(null) }
    var selectedBlank2 by remember { mutableStateOf<Int?>(null) }
    var isSubmitted by remember { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }
    var isFinished by remember { mutableStateOf(false) }

    val currentChallenge = ADVANCED_DUAL_BLANKS[challengeIndex.coerceIn(0, ADVANCED_DUAL_BLANKS.size - 1)]

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.canvas)
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
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
                        .background(colors.surfaceElevated)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = colors.textPrimary
                    )
                }

                Text(
                    text = "SAT/GRE DUAL-BLANK MASTERY",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = ThemeOrange,
                    letterSpacing = 1.sp
                )

                Text(
                    text = "${challengeIndex + 1}/${ADVANCED_DUAL_BLANKS.size}",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textMuted
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            LinearProgressIndicator(
                progress = { (challengeIndex + 1).toFloat() / ADVANCED_DUAL_BLANKS.size.toFloat() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(CircleShape),
                color = ThemeOrange,
                trackColor = colors.surfaceElevated
            )
        }

        if (isFinished) {
            BentoCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = colors.surface,
                borderColor = ThemeGreen
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = ThemeGreen,
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Advanced Challenge Complete!",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "You mastered $score dual-blank challenges (+${score * 50} XP)",
                        fontSize = 14.sp,
                        color = ThemeYellow,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(18.dp))
                    Button(
                        onClick = onBack,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ThemeOrange, contentColor = Color(0xFF0F172A))
                    ) {
                        Text("Return to Arena", fontWeight = FontWeight.Bold)
                    }
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
        } else {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .padding(vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                item {
                    BentoCard(modifier = Modifier.fillMaxWidth(), borderColor = ThemeOrange.copy(alpha = 0.4f)) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.School,
                                    contentDescription = null,
                                    tint = ThemeOrange,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "GRE TEXT COMPLETION",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ThemeOrange,
                                    letterSpacing = 1.sp
                                )
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = currentChallenge.passagePrompt,
                                fontSize = 16.sp,
                                color = colors.textPrimary,
                                lineHeight = 24.sp
                            )
                        }
                    }
                }

                // Blank (i) Column
                item {
                    Text(
                        text = "BLANK (i) SELECTION:",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = ThemeCyan,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        currentChallenge.blank1Options.forEachIndexed { idx, opt ->
                            val isSelected = selectedBlank1 == idx
                            val isCorrect = idx == currentChallenge.correctBlank1Index
                            val bg = when {
                                !isSubmitted && isSelected -> ThemeCyan.copy(alpha = 0.25f)
                                isSubmitted && isCorrect -> ThemeGreen.copy(alpha = 0.3f)
                                isSubmitted && isSelected && !isCorrect -> ThemeRed.copy(alpha = 0.3f)
                                else -> colors.surface
                            }
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(bg)
                                    .border(1.dp, if (isSelected) ThemeCyan else colors.borderMuted, RoundedCornerShape(12.dp))
                                    .clickable { if (!isSubmitted) selectedBlank1 = idx }
                                    .padding(vertical = 12.dp, horizontal = 6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = opt,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) ThemeCyan else colors.textPrimary,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }

                // Blank (ii) Column
                item {
                    Text(
                        text = "BLANK (ii) SELECTION:",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = ThemeYellow,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        currentChallenge.blank2Options.forEachIndexed { idx, opt ->
                            val isSelected = selectedBlank2 == idx
                            val isCorrect = idx == currentChallenge.correctBlank2Index
                            val bg = when {
                                !isSubmitted && isSelected -> ThemeYellow.copy(alpha = 0.25f)
                                isSubmitted && isCorrect -> ThemeGreen.copy(alpha = 0.3f)
                                isSubmitted && isSelected && !isCorrect -> ThemeRed.copy(alpha = 0.3f)
                                else -> colors.surface
                            }
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(bg)
                                    .border(1.dp, if (isSelected) ThemeYellow else colors.borderMuted, RoundedCornerShape(12.dp))
                                    .clickable { if (!isSubmitted) selectedBlank2 = idx }
                                    .padding(vertical = 12.dp, horizontal = 6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = opt,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) ThemeYellow else colors.textPrimary,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }

                if (isSubmitted) {
                    item {
                        BentoCard(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = "Rational Explanation: ${currentChallenge.explanation}",
                                fontSize = 13.sp,
                                color = colors.textSecondary,
                                lineHeight = 19.sp
                            )
                        }
                    }
                }
            }

            // Bottom CTA
            if (!isSubmitted) {
                Button(
                    onClick = {
                        if (selectedBlank1 != null && selectedBlank2 != null) {
                            isSubmitted = true
                            if (selectedBlank1 == currentChallenge.correctBlank1Index && selectedBlank2 == currentChallenge.correctBlank2Index) {
                                score++
                                onEarnXp(50)
                            }
                        }
                    },
                    enabled = selectedBlank1 != null && selectedBlank2 != null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ThemeOrange, contentColor = Color(0xFF0F172A))
                ) {
                    Text("Evaluate Dual Blanks", fontWeight = FontWeight.Bold)
                }
            } else {
                Button(
                    onClick = {
                        if (challengeIndex < ADVANCED_DUAL_BLANKS.size - 1) {
                            challengeIndex++
                            selectedBlank1 = null
                            selectedBlank2 = null
                            isSubmitted = false
                        } else {
                            isFinished = true
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ThemeGreen, contentColor = Color(0xFF0F172A))
                ) {
                    Text(if (challengeIndex < ADVANCED_DUAL_BLANKS.size - 1) "Next Dual-Blank" else "Finish Assessment", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
