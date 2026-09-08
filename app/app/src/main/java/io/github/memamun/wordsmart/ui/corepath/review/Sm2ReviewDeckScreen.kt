package io.github.memamun.wordsmart.ui.corepath.review

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Timeline
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
import io.github.memamun.wordsmart.data.local.entity.UserProgressEntity
import io.github.memamun.wordsmart.data.local.entity.WordEntity
import io.github.memamun.wordsmart.domain.srs.SrsRating
import io.github.memamun.wordsmart.ui.components.BentoCard
import io.github.memamun.wordsmart.ui.theme.ThemeCyan
import io.github.memamun.wordsmart.ui.theme.ThemeGreen
import io.github.memamun.wordsmart.ui.theme.ThemeOrange
import io.github.memamun.wordsmart.ui.theme.ThemePurple
import io.github.memamun.wordsmart.ui.theme.ThemeRed
import io.github.memamun.wordsmart.ui.theme.ThemeYellow
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme

@Composable
fun Sm2ReviewDeckScreen(
    words: List<WordEntity>,
    allProgress: List<UserProgressEntity>,
    onRecordRating: (Int, SrsRating) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val progressMap = remember(allProgress) { allProgress.associateBy { it.wordId } }

    // Cards due for review (or all learning cards if due list is small)
    val now = System.currentTimeMillis()
    val reviewCandidates = remember(words, progressMap) {
        val dueWords = words.filter { word ->
            val p = progressMap[word.id]
            p == null || p.nextReviewAt <= now
        }
        if (dueWords.isNotEmpty()) dueWords else words.take(5)
    }

    var activeSession by remember { mutableStateOf(false) }
    var reviewIndex by remember { mutableIntStateOf(0) }
    var isRevealed by remember { mutableStateOf(false) }

    val masteredCount = allProgress.count { it.status == "mastered" }
    val learningCount = allProgress.count { it.status == "learning" }
    val dueCount = reviewCandidates.size
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

            Text(
                text = "SM-2 ACTIVE RECALL DECK",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = ThemeCyan,
                letterSpacing = 1.sp
            )

            Box(
                modifier = Modifier
                    .clip(CircleShape)
                    .background(colors.surface)
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "$dueCount Due",
                    color = ThemeOrange,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (!activeSession) {
            // Deck Overview & Metrics Dashboard
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.weight(1f)
            ) {
                item {
                    // Algorithm Overview Card
                    BentoCard(modifier = Modifier.fillMaxWidth(), borderColor = ThemePurple.copy(alpha = 0.4f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                                    .background(ThemePurple.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Psychology,
                                    contentDescription = null,
                                    tint = ThemePurple,
                                    modifier = Modifier.size(28.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column {
                                Text(
                                    text = "SuperMemo-2 Spaced Repetition",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = colors.textPrimary
                                )
                                Text(
                                    text = "Calculates optimal intervals & easiness factors to halt the Ebbinghaus forgetting curve.",
                                    fontSize = 12.sp,
                                    color = colors.textSecondary,
                                    lineHeight = 16.sp
                                )
                            }
                        }
                    }
                }

                item {
                    // 3 Metric Pills
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        BentoCard(modifier = Modifier.weight(1f)) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("DUE TODAY", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = ThemeOrange)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("$dueCount", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = ThemeOrange)
                            }
                        }

                        BentoCard(modifier = Modifier.weight(1f)) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("LEARNING", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = ThemeCyan)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("$learningCount", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = ThemeCyan)
                            }
                        }

                        BentoCard(modifier = Modifier.weight(1f)) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("MASTERED", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = ThemeGreen)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("$masteredCount", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = ThemeGreen)
                            }
                        }
                    }
                }

                item {
                    Text(
                        text = "SRS SCHEDULED QUEUE",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textMuted,
                        letterSpacing = 1.sp
                    )
                }

                items(reviewCandidates) { word ->
                    val progress = progressMap[word.id]
                    val ef = progress?.easinessFactor ?: 2.5f
                    val interval = progress?.intervalDays ?: 1
                    val reps = progress?.repetitionCount ?: 0

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(colors.surface)
                            .border(1.dp, colors.borderMuted, RoundedCornerShape(14.dp))
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = word.word,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = colors.textPrimary
                            )
                            Text(
                                text = word.bengaliMeaning,
                                fontSize = 13.sp,
                                color = colors.textMuted
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "Interval: ${interval}d • Reps: $reps",
                                fontSize = 12.sp,
                                color = ThemeCyan,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "EF: ${"%.2f".format(ef)}",
                                fontSize = 11.sp,
                                color = colors.textMuted
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = {
                    reviewIndex = 0
                    isRevealed = false
                    activeSession = true
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ThemeCyan, contentColor = Color(0xFF0F172A))
            ) {
                Icon(imageVector = Icons.Default.Timeline, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Start SuperMemo-2 Recall Session",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }
        } else {
            // Active Recall Session Mode
            if (reviewIndex >= reviewCandidates.size) {
                // Completed Session
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
                        text = "SRS Review Batch Complete!",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        color = colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "You've successfully recalculated spaced repetition intervals for ${reviewCandidates.size} words.",
                        fontSize = 14.sp,
                        color = colors.textMuted,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = { activeSession = false },
                        colors = ButtonDefaults.buttonColors(containerColor = ThemeCyan, contentColor = Color(0xFF0F172A)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Back to Deck Summary", fontWeight = FontWeight.Bold)
                    }
                }
            } else {
                val currentWord = reviewCandidates[reviewIndex]
                val currentProgress = progressMap[currentWord.id]
                val currentEf = currentProgress?.easinessFactor ?: 2.5f

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        // Progress bar
                        LinearProgressIndicator(
                            progress = { (reviewIndex + 1).toFloat() / reviewCandidates.size.toFloat() },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(CircleShape),
                            color = ThemeCyan,
                            trackColor = colors.surfaceElevated
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        // Active Prompt Card
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(containerColor = colors.surface),
                            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(colors.borderMuted))
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "RECALL PROMPT",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = ThemeCyan,
                                        letterSpacing = 1.sp
                                    )
                                    Text(
                                        text = "Current EF: ${"%.2f".format(currentEf)}",
                                        fontSize = 11.sp,
                                        color = colors.textMuted
                                    )
                                }

                                Spacer(modifier = Modifier.height(24.dp))

                                Text(
                                    text = currentWord.word,
                                    fontSize = 32.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = colors.textPrimary
                                )

                                if (!currentWord.pronunciation.isNullOrBlank()) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = currentWord.pronunciation,
                                        fontSize = 16.sp,
                                        color = colors.textMuted
                                    )
                                }

                                Spacer(modifier = Modifier.height(24.dp))

                                if (!isRevealed) {
                                    Button(
                                        onClick = { isRevealed = true },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = colors.surfaceElevated, contentColor = ThemeCyan)
                                    ) {
                                        Text("Reveal Definition & Meaning", fontWeight = FontWeight.Bold)
                                    }
                                } else {
                                    // Revealed Details
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(colors.surfaceElevated)
                                            .padding(14.dp)
                                    ) {
                                        Text(
                                            text = currentWord.definition,
                                            fontSize = 15.sp,
                                            color = colors.textPrimary,
                                            lineHeight = 21.sp
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = "বাংলা অর্থ: ${currentWord.bengaliMeaning}",
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = ThemeYellow
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Rating Buttons (Visible once revealed)
                    if (isRevealed) {
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = "RATE YOUR RETRIEVAL EFFORT (SM-2):",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.textMuted,
                                letterSpacing = 1.sp,
                                modifier = Modifier.padding(bottom = 8.dp)
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Button(
                                    onClick = {
                                        onRecordRating(currentWord.id, SrsRating.AGAIN)
                                        isRevealed = false
                                        reviewIndex++
                                    },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = ThemeRed, contentColor = Color.White)
                                ) {
                                    Text("Again\n1d", textAlign = TextAlign.Center, fontSize = 12.sp)
                                }

                                Button(
                                    onClick = {
                                        onRecordRating(currentWord.id, SrsRating.HARD)
                                        isRevealed = false
                                        reviewIndex++
                                    },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = ThemeOrange, contentColor = Color.White)
                                ) {
                                    Text("Hard\n3d", textAlign = TextAlign.Center, fontSize = 12.sp)
                                }

                                Button(
                                    onClick = {
                                        onRecordRating(currentWord.id, SrsRating.GOOD)
                                        isRevealed = false
                                        reviewIndex++
                                    },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = ThemeCyan, contentColor = Color(0xFF0F172A))
                                ) {
                                    Text("Good\n6d", textAlign = TextAlign.Center, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = {
                                        onRecordRating(currentWord.id, SrsRating.EASY)
                                        isRevealed = false
                                        reviewIndex++
                                    },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = ThemeGreen, contentColor = Color(0xFF0F172A))
                                ) {
                                    Text("Easy\n14d", textAlign = TextAlign.Center, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
