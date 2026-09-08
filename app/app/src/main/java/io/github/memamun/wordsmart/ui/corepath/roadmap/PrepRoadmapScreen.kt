package io.github.memamun.wordsmart.ui.corepath.roadmap

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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.CardMembership
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Quiz
import androidx.compose.material.icons.filled.Redeem
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Style
import androidx.compose.material.icons.filled.TrackChanges
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.memamun.wordsmart.data.local.entity.WordEntity
import io.github.memamun.wordsmart.data.repository.UserStats
import io.github.memamun.wordsmart.domain.model.PrepStage
import io.github.memamun.wordsmart.ui.components.BentoCard
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme
import io.github.memamun.wordsmart.util.SoundEffectHelper

data class RoadmapNode(
    val id: String,
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val route: String,
    val isCompleted: Boolean = false,
    val isLocked: Boolean = false,
    val color: Color = Color.Unspecified
)

@Composable
fun PrepRoadmapScreen(
    userStats: UserStats,
    words: List<WordEntity>,
    onNavigate: (String) -> Unit,
    onOpenWordDetails: (Int) -> Unit,
    onClaimChest: (Int, Int) -> Unit,
    onOpenAuthGate: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = WordSmartTheme.colors
    val currentStage = PrepStage.getStageForXp(userStats.xp)
    val nextStage = PrepStage.getNextStage(currentStage.stageNumber)
    var selectedUnit by remember { mutableStateOf(1) }
    var chestClaimed by remember { mutableStateOf(false) }
    var showStreakTooltip by remember { mutableStateOf(false) }
    var showMilestoneCelebrationDialog by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val soundHelper = remember { SoundEffectHelper.getInstance(context) }
    val haptic = LocalHapticFeedback.current

    val nextUnmasteredWord = words.firstOrNull { it.stage == currentStage.stageNumber } ?: words.firstOrNull()

    // Roadmap nodes for the active unit
    val nodes = listOf(
        RoadmapNode(
            id = "flashcards",
            title = "Flashcard Quest",
            subtitle = "3D active flipcards & mnemonics",
            icon = Icons.Default.Style,
            route = "flashcards",
            isCompleted = true,
            color = colors.themeCyan
        ),
        RoadmapNode(
            id = "vocabdrills",
            title = "Vocab Drills",
            subtitle = "Sentence completion & cloze test",
            icon = Icons.Default.TrackChanges,
            route = "vocabdrills",
            isCompleted = false,
            color = colors.themePurple
        ),
        RoadmapNode(
            id = "stories",
            title = "Contextual Stories",
            subtitle = "Authentic reading lab & chip analysis",
            icon = Icons.Default.AutoStories,
            route = "stories",
            isCompleted = false,
            color = colors.themeGreen
        ),
        RoadmapNode(
            id = "quizzes",
            title = "Qualification MCQs",
            subtitle = "Unit benchmark assessment",
            icon = Icons.Default.Quiz,
            route = "quizzes",
            isCompleted = false,
            color = colors.themeOrange
        )
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(colors.canvas)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero: Prep Stage Card
        item {
            Spacer(modifier = Modifier.height(8.dp))
            BentoCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = colors.surface,
                borderColor = colors.themeCyan.copy(alpha = 0.4f)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "STAGE ${currentStage.stageNumber} OF 10",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.themeCyan,
                                letterSpacing = 1.2.sp
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = currentStage.title,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = colors.textPrimary
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(colors.surfaceElevated)
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "${userStats.xp} XP",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 14.sp,
                                color = colors.themeYellow
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = currentStage.description,
                        fontSize = 13.sp,
                        color = colors.textSecondary,
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Progress to next stage
                    val xpFloor = currentStage.requiredXp
                    val xpCeil = nextStage?.requiredXp ?: (xpFloor + 2000)
                    val progressFloat = ((userStats.xp - xpFloor).toFloat() / (xpCeil - xpFloor).toFloat()).coerceIn(0f, 1f)

                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Next: ${nextStage?.title ?: "Max Mastery"}",
                                fontSize = 11.sp,
                                color = colors.textMuted
                            )
                            Text(
                                text = "${(progressFloat * 100).toInt()}%",
                                fontSize = 11.sp,
                                color = colors.themeCyan,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        LinearProgressIndicator(
                            progress = { progressFloat },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(CircleShape),
                            color = colors.themeCyan,
                            trackColor = colors.surfaceElevated
                        )
                    }
                }
            }
        }

        // Daily Goal Ring Card
        item {
            BentoCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = colors.surface,
                borderColor = colors.themeOrange.copy(alpha = 0.4f)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(contentAlignment = Alignment.Center) {
                            val goalProgress = (userStats.wordsLearnedToday.toFloat() / userStats.dailyGoalTarget.toFloat()).coerceIn(0f, 1f)
                            CircularProgressIndicator(
                                progress = { goalProgress },
                                modifier = Modifier.size(54.dp),
                                color = colors.themeOrange,
                                trackColor = colors.surfaceElevated,
                                strokeWidth = 5.dp
                            )
                            Icon(
                                imageVector = Icons.Default.LocalFireDepartment,
                                contentDescription = "Daily Goal",
                                tint = colors.themeOrange,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "DAILY GOAL PROGRESS",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.themeOrange,
                                    letterSpacing = 1.sp
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .clickable { showStreakTooltip = true }
                                        .padding(2.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Info,
                                        contentDescription = "Streak Info",
                                        tint = colors.textMuted,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "${userStats.wordsLearnedToday} / ${userStats.dailyGoalTarget} Words Learned Today",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                            Text(
                                text = "🔥 ${userStats.streakDays}-Day Streak • Active Momentum",
                                fontSize = 12.sp,
                                color = colors.themeYellow
                            )
                        }
                    }

                    // Streak Percentage Pill
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(colors.themeOrange.copy(alpha = 0.15f))
                            .border(1.dp, colors.themeOrange, RoundedCornerShape(12.dp))
                            .clickable { showStreakTooltip = true }
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "${((userStats.wordsLearnedToday.toFloat() / userStats.dailyGoalTarget) * 100).toInt()}%",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 14.sp,
                            color = colors.themeOrange
                        )
                    }
                }
            }
        }

        // National Leaderboard Podium Shortcut Bento Card (Web Parity)
        item {
            BentoCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigate("leaderboard") },
                backgroundColor = colors.surface,
                borderColor = colors.themeYellow.copy(alpha = 0.45f)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(colors.themeYellow.copy(alpha = 0.2f))
                                .border(1.dp, colors.themeYellow.copy(alpha = 0.6f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.EmojiEvents,
                                contentDescription = "Leaderboard",
                                tint = colors.themeYellow,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "GLOBAL LEADERBOARD",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = colors.themeYellow,
                                    letterSpacing = 0.8.sp
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(colors.themeGreen)
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "LIVE",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.Black
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Compete with test takers nationwide • Standings",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.textSecondary
                            )
                        }
                    }
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Open Leaderboard",
                        tint = colors.themeYellow,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        // Resume Learning Hero Card
        if (nextUnmasteredWord != null) {
            item {
                BentoCard(
                    modifier = Modifier.fillMaxWidth(),
                    backgroundColor = colors.surfaceElevated,
                    borderColor = colors.themeYellow.copy(alpha = 0.4f)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "RESUME LEARNING",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.themeYellow,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = nextUnmasteredWord.word,
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                            Text(
                                text = nextUnmasteredWord.bengaliMeaning,
                                fontSize = 14.sp,
                                color = colors.textSecondary,
                                maxLines = 1
                            )
                        }

                        Button(
                            onClick = { onOpenWordDetails(nextUnmasteredWord.id) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = colors.themeYellow,
                                contentColor = Color.Black
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Study", fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }

        // Unit Selector Tabs (Units 1 to 5 for the stage)
        item {
            Column {
                Text(
                    text = "UNIT PATHWAY",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textMuted,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items((1..5).toList()) { unitNum ->
                        val isSelected = selectedUnit == unitNum
                        val isLocked = unitNum > 2 // Lock units 3-5 behind Google login / stage unlock

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isSelected) colors.themeCyan else colors.surface)
                                .border(
                                    1.dp,
                                    if (isSelected) colors.themeCyan else colors.borderMuted,
                                    RoundedCornerShape(12.dp)
                                )
                                .clickable {
                                    if (isLocked) {
                                        onOpenAuthGate()
                                    } else {
                                        selectedUnit = unitNum
                                    }
                                }
                                .padding(horizontal = 14.dp, vertical = 10.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                if (isLocked) {
                                    Icon(
                                        imageVector = Icons.Default.Lock,
                                        contentDescription = "Locked",
                                        tint = if (isSelected) Color.Black else colors.textMuted,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                }
                                Text(
                                    text = "Unit $unitNum",
                                    color = if (isSelected) Color.Black else colors.textPrimary,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }
                }
            }
        }

        // Visual Roadmap Node Graph
        item {
            Text(
                text = "UNIT $selectedUnit LEARNING LOOP",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = colors.textMuted,
                letterSpacing = 1.sp
            )
        }

        items(nodes) { node ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surface)
                    .border(1.dp, colors.borderMuted, RoundedCornerShape(16.dp))
                    .clickable { onNavigate(node.route) }
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Node Icon / Status Circle
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(node.color.copy(alpha = 0.15f))
                        .border(2.dp, node.color, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    if (node.isCompleted) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Done",
                            tint = node.color,
                            modifier = Modifier.size(24.dp)
                        )
                    } else {
                        Icon(
                            imageVector = node.icon,
                            contentDescription = null,
                            tint = node.color,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = node.title,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = node.subtitle,
                        fontSize = 13.sp,
                        color = colors.textMuted
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(colors.surfaceElevated)
                        .padding(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Start",
                        tint = colors.themeCyan,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }

        // Milestone Chest Card
        item {
            BentoCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = if (chestClaimed) colors.surface else colors.surfaceElevated,
                borderColor = if (chestClaimed) colors.borderMuted else colors.themeYellow
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(CircleShape)
                                .background(colors.themeYellow.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (chestClaimed) Icons.Default.CheckCircle else Icons.Default.Redeem,
                                contentDescription = "Milestone Chest",
                                tint = colors.themeYellow,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column {
                            Text(
                                text = "Unit Milestone Chest",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = colors.textPrimary
                            )
                            Text(
                                text = if (chestClaimed) "Claimed (+100 XP, +50 Coins)" else "+100 XP • +50 Coins • Level Up",
                                fontSize = 13.sp,
                                color = if (chestClaimed) colors.themeGreen else colors.themeYellow
                            )
                        }
                    }

                    Button(
                        onClick = {
                            if (!chestClaimed) {
                                chestClaimed = true
                                soundHelper.playCorrect()
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                showMilestoneCelebrationDialog = true
                                onClaimChest(100, 50)
                            }
                        },
                        enabled = !chestClaimed,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = colors.themeYellow,
                            contentColor = Color.Black,
                            disabledContainerColor = colors.surface,
                            disabledContentColor = colors.textMuted
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(if (chestClaimed) "Claimed" else "Claim")
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    // Milestone Chest Celebration Dialog
    if (showMilestoneCelebrationDialog) {
        AlertDialog(
            onDismissRequest = { showMilestoneCelebrationDialog = false },
            containerColor = colors.surface,
            title = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(colors.themeYellow.copy(alpha = 0.2f))
                            .border(2.dp, colors.themeYellow, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Redeem,
                            contentDescription = null,
                            tint = colors.themeYellow,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "UNIT 1 CHEST UNLOCKED!",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = colors.themeYellow,
                        textAlign = TextAlign.Center
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Outstanding effort! You conquered all 4 learning loops in Unit 1.",
                        fontSize = 14.sp,
                        color = colors.textSecondary,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(colors.surfaceElevated)
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text("⭐ +100 XP", fontWeight = FontWeight.Bold, color = colors.themeYellow)
                        }
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(colors.surfaceElevated)
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text("🪙 +50 Coins", fontWeight = FontWeight.Bold, color = colors.themeYellow)
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { showMilestoneCelebrationDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = colors.themeYellow, contentColor = Color.Black),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Collect Rewards", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }
        )
    }

    // Streak Tooltip Dialog
    if (showStreakTooltip) {
        AlertDialog(
            onDismissRequest = { showStreakTooltip = false },
            containerColor = colors.surface,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.LocalFireDepartment,
                        contentDescription = null,
                        tint = colors.themeOrange,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "${userStats.streakDays}-Day Momentum Streak",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                }
            },
            text = {
                Column {
                    Text(
                        text = "Daily habit consistency compounds your long-term memory retention by over 3.4x according to spaced repetition research.",
                        fontSize = 14.sp,
                        color = colors.textSecondary,
                        lineHeight = 20.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "Complete your daily target of ${userStats.dailyGoalTarget} words before midnight to keep your streak burning hot!",
                        fontSize = 13.sp,
                        color = colors.themeOrange,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { showStreakTooltip = false },
                    colors = ButtonDefaults.buttonColors(containerColor = colors.themeOrange, contentColor = Color.Black),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Keep Going!", fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}
