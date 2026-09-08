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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocalFireDepartment
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
import io.github.memamun.wordsmart.data.local.entity.WordEntity
import io.github.memamun.wordsmart.ui.components.BentoCard
import io.github.memamun.wordsmart.ui.modals.QuizExitConfirmDialog
import io.github.memamun.wordsmart.ui.theme.ThemeCyan
import io.github.memamun.wordsmart.ui.theme.ThemeGreen
import io.github.memamun.wordsmart.ui.theme.ThemeOrange
import io.github.memamun.wordsmart.ui.theme.ThemeRed
import io.github.memamun.wordsmart.ui.theme.ThemeYellow
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme

data class McqQuestion(
    val id: Int,
    val prompt: String,
    val bengaliHint: String,
    val choices: List<String>,
    val correctIndex: Int,
    val explanation: String
)

val DEFAULT_MCQS = listOf(
    McqQuestion(
        id = 1,
        prompt = "Select the word that best describes someone who is fluent, persuasive, and vividly expressive in speech:",
        bengaliHint = "ইঙ্গিত: প্রাঞ্জল ও হৃদয়গ্রাহী বক্তা",
        choices = listOf("Eloquent", "Ephemeral", "Belligerent", "Anachronism"),
        correctIndex = 0,
        explanation = "Eloquent means fluent or persuasive in speaking or writing (বাগ্মী ও প্রাঞ্জল)."
    ),
    McqQuestion(
        id = 2,
        prompt = "Which term describes being well-meaning, kindly, and inclined toward philanthropy?",
        bengaliHint = "ইঙ্গিত: দয়ালু ও পরোপকারী",
        choices = listOf("Circumspect", "Benevolent", "Pernicious", "Loquacious"),
        correctIndex = 1,
        explanation = "Benevolent originates from 'bene' (well/good) and 'vol' (wish) -> charitable and kind (পরোপকারী)."
    ),
    McqQuestion(
        id = 3,
        prompt = "Something that is extraordinarily clear and easy to understand without ambiguity is:",
        bengaliHint = "ইঙ্গিত: সহজবোধ্য ও পরিষ্কার",
        choices = listOf("Esoteric", "Diligent", "Lucid", "Equivocate"),
        correctIndex = 2,
        explanation = "Lucid refers to something clearly intelligible and luminous in thought (সহজবোধ্য)."
    ),
    McqQuestion(
        id = 4,
        prompt = "What is the opposite (antonym) of 'Belligerent'?",
        bengaliHint = "ইঙ্গিত: আক্রমণাত্মক বা যুদ্ধংদেহী মনোভাবের বিপরীত",
        choices = listOf("Pugnacious", "Combative", "Peaceable", "Aggressive"),
        correctIndex = 2,
        explanation = "Belligerent means warlike and combative; its direct opposite is peaceable or pacifist."
    ),
    McqQuestion(
        id = 5,
        prompt = "The presence of a smartphone in a medieval renaissance portrait is a glaring example of a(n):",
        bengaliHint = "ইঙ্গিত: কালবৈষম্য বা বেমানান কালপ্রক্ষেপণ",
        choices = listOf("Anachronism", "Amortization", "Catharsis", "Prognosis"),
        correctIndex = 0,
        explanation = "Anachronism is a chronological inconsistency or thing belonging to another era (কালবৈষম্য)."
    )
)

@Composable
fun QualificationMcqsScreen(
    onCompleteQuiz: (Int, Int) -> Unit, // xpEarned, score
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showExitDialog by remember { mutableStateOf(false) }
    var currentQuestionIndex by remember { mutableIntStateOf(0) }
    var selectedChoice by remember { mutableStateOf<Int?>(null) }
    var isSubmitted by remember { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }
    var streakMultiplier by remember { mutableIntStateOf(1) }
    var quizFinished by remember { mutableStateOf(false) }

    val currentQ = DEFAULT_MCQS[currentQuestionIndex.coerceIn(0, DEFAULT_MCQS.size - 1)]

    if (showExitDialog) {
        QuizExitConfirmDialog(
            onConfirmExit = {
                showExitDialog = false
                onBack()
            },
            onDismiss = { showExitDialog = false }
        )
    }

    val colors = WordSmartTheme.colors

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.canvas)
            .padding(16.dp)
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = {
                    if (quizFinished) onBack() else showExitDialog = true
                },
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(colors.surface)
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Exit Quiz",
                    tint = colors.textPrimary
                )
            }

            // Streak Multiplier Pill
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(colors.surface)
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.LocalFireDepartment,
                    contentDescription = null,
                    tint = ThemeOrange,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "${streakMultiplier}x Combo",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = ThemeOrange
                )
            }

            Text(
                text = "${currentQuestionIndex + 1}/${DEFAULT_MCQS.size}",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = colors.textPrimary
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Progress
        LinearProgressIndicator(
            progress = { (currentQuestionIndex + 1).toFloat() / DEFAULT_MCQS.size.toFloat() },
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(CircleShape),
            color = ThemeCyan,
            trackColor = colors.surfaceElevated
        )

        Spacer(modifier = Modifier.height(20.dp))

        if (quizFinished) {
            // Summary Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = colors.surface),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(ThemeCyan))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = ThemeGreen,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Qualification Test Passed!",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "You scored $score out of ${DEFAULT_MCQS.size} questions correctly.",
                        fontSize = 14.sp,
                        color = colors.textSecondary
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(colors.surfaceElevated)
                            .padding(horizontal = 16.dp, vertical = 10.dp)
                    ) {
                        Text(
                            text = "+${score * 30} XP Earned",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = ThemeYellow
                        )
                    }

                    Spacer(modifier = Modifier.height(28.dp))

                    Button(
                        onClick = onBack,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ThemeCyan, contentColor = Color(0xFF0F172A))
                    ) {
                        Text("Return to Roadmap", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }
        } else {
            // Active Question
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    BentoCard(modifier = Modifier.fillMaxWidth(), borderColor = ThemeCyan.copy(alpha = 0.3f)) {
                        Column {
                            Text(
                                text = "QUALIFICATION QUESTION",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = ThemeCyan,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = currentQ.prompt,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.textPrimary,
                                lineHeight = 22.sp
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = currentQ.bengaliHint,
                                fontSize = 13.sp,
                                color = ThemeYellow
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // 4 Options
                    currentQ.choices.forEachIndexed { idx, choice ->
                        val isSelected = selectedChoice == idx
                        val isCorrect = idx == currentQ.correctIndex

                        val bg = when {
                            !isSubmitted && isSelected -> ThemeCyan.copy(alpha = 0.2f)
                            isSubmitted && isCorrect -> ThemeGreen.copy(alpha = 0.25f)
                            isSubmitted && isSelected && !isCorrect -> ThemeRed.copy(alpha = 0.25f)
                            else -> colors.surface
                        }
                        val border = when {
                            !isSubmitted && isSelected -> ThemeCyan
                            isSubmitted && isCorrect -> ThemeGreen
                            isSubmitted && isSelected && !isCorrect -> ThemeRed
                            else -> colors.borderMuted
                        }

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 5.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(bg)
                                .border(1.dp, border, RoundedCornerShape(12.dp))
                                .clickable {
                                    if (!isSubmitted) selectedChoice = idx
                                }
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "${('A' + idx)})",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = if (isSelected) ThemeCyan else colors.textMuted
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = choice,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium,
                                color = colors.textPrimary
                            )
                        }
                    }

                    if (isSubmitted) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(colors.surface)
                                .padding(12.dp)
                        ) {
                            Text(
                                text = "Explanation: ${currentQ.explanation}",
                                fontSize = 13.sp,
                                color = colors.textSecondary,
                                lineHeight = 18.sp
                            )
                        }
                    }
                }

                // Submit / Next button
                if (!isSubmitted) {
                    Button(
                        onClick = {
                            if (selectedChoice != null) {
                                isSubmitted = true
                                val correct = selectedChoice == currentQ.correctIndex
                                if (correct) {
                                    score++
                                    streakMultiplier++
                                } else {
                                    streakMultiplier = 1
                                }
                            }
                        },
                        enabled = selectedChoice != null,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ThemeCyan, contentColor = Color(0xFF0F172A))
                    ) {
                        Text("Check Answer", fontWeight = FontWeight.Bold)
                    }
                } else {
                    Button(
                        onClick = {
                            if (currentQuestionIndex < DEFAULT_MCQS.size - 1) {
                                currentQuestionIndex++
                                selectedChoice = null
                                isSubmitted = false
                            } else {
                                quizFinished = true
                                onCompleteQuiz(score * 30, score)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selectedChoice == currentQ.correctIndex) ThemeGreen else ThemeCyan,
                            contentColor = Color(0xFF0F172A)
                        )
                    ) {
                        Text(
                            text = if (currentQuestionIndex < DEFAULT_MCQS.size - 1) "Continue" else "Finish Assessment",
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
