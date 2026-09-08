package io.github.memamun.wordsmart.ui.resources

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.memamun.wordsmart.data.repository.LeaderboardEntry
import io.github.memamun.wordsmart.data.repository.LeaderboardRepository
import io.github.memamun.wordsmart.data.repository.UserStats
import io.github.memamun.wordsmart.domain.model.PrepStage
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme
import kotlinx.coroutines.launch

@Composable
fun LeaderboardScreen(
    userStats: UserStats,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = WordSmartTheme.colors
    val coroutineScope = rememberCoroutineScope()
    val leaderboardRepository = remember { LeaderboardRepository() }

    var leaderboardUsers by remember { mutableStateOf<List<LeaderboardEntry>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var isCloudActive by remember { mutableStateOf(true) }

    val loadLeaderboard = {
        isLoading = true
        coroutineScope.launch {
            val stage = PrepStage.getStageForXp(userStats.xp).stageNumber
            val result = leaderboardRepository.fetchGlobalLeaderboard(
                currentUserXp = userStats.xp,
                currentStreak = userStats.streakDays,
                currentLevel = stage
            )
            leaderboardUsers = result.entries
            isCloudActive = result.isFromCloud
            isLoading = false
        }
    }

    LaunchedEffect(userStats.xp, userStats.streakDays) {
        loadLeaderboard()
    }

    // Determine current user rank and competitor above
    val userRankIndex = leaderboardUsers.indexOfFirst { it.isCurrentUser }.let { if (it >= 0) it + 1 else 0 }
    val competitorAbove = if (userRankIndex > 1) leaderboardUsers.getOrNull(userRankIndex - 2) else null

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.canvas)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // Top Header Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onBack,
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(colors.surfaceElevated)
                    .border(1.dp, colors.borderMuted, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = colors.textPrimary,
                    modifier = Modifier.size(18.dp)
                )
            }

            // Live Cloud Indicator Pill
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(CircleShape)
                    .background(if (isCloudActive) colors.themeGreen else colors.surfaceElevated)
                    .border(1.dp, colors.borderMuted, CircleShape)
                    .padding(horizontal = 10.dp, vertical = 5.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Cloud,
                    contentDescription = "Live Cloud",
                    tint = if (isCloudActive) Color.Black else colors.textMuted,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = if (isCloudActive) "LIVE CLOUD" else "OFFLINE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = if (isCloudActive) Color.Black else colors.textMuted
                )
            }

            // Refresh Button
            IconButton(
                onClick = { loadLeaderboard() },
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(colors.surfaceElevated)
                    .border(1.dp, colors.borderMuted, CircleShape)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp,
                        color = colors.themeCyan
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Refresh",
                        tint = colors.textPrimary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Title and Global Rank Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.EmojiEvents,
                        contentDescription = null,
                        tint = colors.themeYellow,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Global Leaderboard",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = colors.textPrimary
                    )
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Compete with test takers nationwide. Earn XP to climb the podium!",
                    fontSize = 12.sp,
                    color = colors.textSecondary,
                    lineHeight = 16.sp
                )
            }

            // User Rank Box
            Column(
                horizontalAlignment = Alignment.End,
                modifier = Modifier.padding(start = 8.dp)
            ) {
                Text(
                    text = "YOUR RANK",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = colors.textMuted,
                    letterSpacing = 0.5.sp
                )
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = if (userRankIndex > 0) "#$userRankIndex" else "-",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        color = colors.themeCyan
                    )
                    Text(
                        text = " of ${leaderboardUsers.size}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textMuted,
                        modifier = Modifier.padding(bottom = 2.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Performance Highlight Banner (Web Parity)
        if (leaderboardUsers.isNotEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(
                                colors.themeCyan.copy(alpha = 0.12f),
                                colors.surface
                            )
                        )
                    )
                    .border(width = 1.5.dp, color = colors.themeCyan.copy(alpha = 0.4f), shape = RoundedCornerShape(14.dp))
                    .padding(14.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(colors.themeYellow),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = Color.Black,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "PERFORMANCE HIGHLIGHT",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = colors.textMuted,
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        val highlightText = when {
                            userRankIndex == 1 -> "🏆 Outstanding! You are currently #1 on the leaderboard! Keep building your streak to hold the title."
                            userRankIndex in 2..3 -> "🥇 Excellent work! You are on the podium in the Top 3!"
                            competitorAbove != null -> "You need ${String.format("%,d", competitorAbove.xp - userStats.xp)} XP to pass ${competitorAbove.name}!"
                            else -> "Earn XP through quizzes and flashcards to climb the leaderboard!"
                        }
                        Text(
                            text = highlightText,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary,
                            lineHeight = 17.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "STANDINGS • TOP LEARNERS",
            fontSize = 11.sp,
            fontWeight = FontWeight.ExtraBold,
            color = colors.textMuted,
            letterSpacing = 0.8.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Leaderboard Competitor List
        if (leaderboardUsers.isEmpty()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = colors.themeCyan)
                } else {
                    Text(
                        text = "No competitors found yet. Start practicing to set the benchmark!",
                        color = colors.textMuted,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                itemsIndexed(leaderboardUsers, key = { _, user -> user.id }) { index, user ->
                    val rank = index + 1
                    val isUser = user.isCurrentUser
                    val userStage = PrepStage.getStageForXp(user.xp)

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                if (isUser) {
                                    if (colors.isDark) colors.surfaceElevated else colors.themeCyan.copy(alpha = 0.15f)
                                } else {
                                    colors.surface
                                }
                            )
                            .border(
                                width = if (isUser) 1.5.dp else 1.dp,
                                color = if (isUser) colors.themeCyan else colors.borderMuted,
                                shape = RoundedCornerShape(12.dp)
                            )
                            .padding(horizontal = 12.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Rank Indicator / Medal (Web Parity)
                        Box(
                            modifier = Modifier.width(36.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            when (rank) {
                                1 -> Text(text = "🥇", fontSize = 20.sp)
                                2 -> Text(text = "🥈", fontSize = 20.sp)
                                3 -> Text(text = "🥉", fontSize = 20.sp)
                                else -> Text(
                                    text = "#$rank",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isUser) colors.themeCyan else colors.textMuted
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        // User Avatar Circle
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(
                                    when (rank) {
                                        1 -> colors.themeYellow.copy(alpha = 0.2f)
                                        2 -> colors.themeCyan.copy(alpha = 0.2f)
                                        3 -> colors.themeOrange.copy(alpha = 0.2f)
                                        else -> colors.surfaceElevated
                                    }
                                )
                                .border(
                                    width = 1.dp,
                                    color = when (rank) {
                                        1 -> colors.themeYellow.copy(alpha = 0.6f)
                                        2 -> colors.themeCyan.copy(alpha = 0.6f)
                                        3 -> colors.themeOrange.copy(alpha = 0.6f)
                                        else -> colors.borderMuted
                                    },
                                    shape = CircleShape
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            val initial = user.name.trim().firstOrNull()?.uppercaseChar()?.toString() ?: "U"
                            Text(
                                text = initial,
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp,
                                color = colors.textPrimary
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        // Name and Stage Info
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = user.name,
                                    fontWeight = if (isUser) FontWeight.ExtraBold else FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = if (isUser) colors.themeCyan else colors.textPrimary,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                if (isUser) {
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(colors.themeCyan)
                                            .padding(horizontal = 5.dp, vertical = 1.dp)
                                    ) {
                                        Text(
                                            text = "YOU",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Color.Black
                                        )
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Stage ${userStage.stageNumber}: ${userStage.title}",
                                fontSize = 11.sp,
                                color = colors.textMuted,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    // Right side: Streak and XP
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.End
                    ) {
                        if (user.streak > 0) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(colors.surfaceElevated)
                                    .padding(horizontal = 6.dp, vertical = 3.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LocalFireDepartment,
                                    contentDescription = "Streak",
                                    tint = colors.themeOrange,
                                    modifier = Modifier.size(13.dp)
                                )
                                Spacer(modifier = Modifier.width(2.dp))
                                Text(
                                    text = "${user.streak}d",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.themeOrange
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = String.format("%,d", user.xp),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black,
                                color = colors.textPrimary
                            )
                            Text(
                                text = "XP",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = colors.themeYellow
                            )
                        }
                    }
                }
            }
        }
    }
}
