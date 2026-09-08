package io.github.memamun.wordsmart.ui.resources

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
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Extension
import androidx.compose.material.icons.filled.Leaderboard
import androidx.compose.material.icons.filled.Quiz
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme
import io.github.memamun.wordsmart.ui.theme.ThemeCyan
import io.github.memamun.wordsmart.ui.theme.ThemeGreen
import io.github.memamun.wordsmart.ui.theme.ThemeOrange
import io.github.memamun.wordsmart.ui.theme.ThemePurple
import io.github.memamun.wordsmart.ui.theme.ThemeYellow

data class QuizCatalogItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val questionsCount: Int,
    val xpReward: Int,
    val route: String,
    val icon: ImageVector,
    val color: Color
)

val QUIZ_CATALOG = listOf(
    QuizCatalogItem(
        id = "quizzes",
        title = "Qualification MCQs",
        subtitle = "Unit benchmark assessment with instant explanations",
        questionsCount = 5,
        xpReward = 150,
        route = "quizzes",
        icon = Icons.Default.Quiz,
        color = ThemeCyan
    ),
    QuizCatalogItem(
        id = "vocabdrills",
        title = "Sentence Cloze Drills",
        subtitle = "Interactive fill-in-the-blank contextual testing",
        questionsCount = 4,
        xpReward = 100,
        route = "vocabdrills",
        icon = Icons.AutoMirrored.Filled.Assignment,
        color = ThemePurple
    ),
    QuizCatalogItem(
        id = "quickmatch",
        title = "Quick Match Arena",
        subtitle = "High-speed definition and synonym pairing",
        questionsCount = 4,
        xpReward = 100,
        route = "quickmatch",
        icon = Icons.Default.Extension,
        color = ThemeGreen
    ),
    QuizCatalogItem(
        id = "advanced",
        title = "SAT/GRE Dual-Blank Mastery",
        subtitle = "Passage text completions and nuanced logic",
        questionsCount = 2,
        xpReward = 100,
        route = "advanced",
        icon = Icons.Default.School,
        color = ThemeOrange
    ),
    QuizCatalogItem(
        id = "timeblitz",
        title = "60-Second Time Blitz",
        subtitle = "Adrenaline rapid-fire sprint against the clock",
        questionsCount = 8,
        xpReward = 150,
        route = "timeblitz",
        icon = Icons.Default.Bolt,
        color = ThemeYellow
    )
)

@Composable
fun QuizLibraryScreen(
    onLaunchQuiz: (String) -> Unit,
    onBack: () -> Unit,
    onOpenLeaderboard: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val colors = WordSmartTheme.colors

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.canvas)
            .padding(16.dp)
    ) {
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
                    .border(1.dp, colors.borderMuted, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = colors.textPrimary
                )
            }

            Text(
                text = "QUIZ & ASSESSMENT LIBRARY",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = colors.themeCyan,
                letterSpacing = 1.sp
            )

            Box(
                modifier = Modifier
                    .clip(CircleShape)
                    .background(colors.surface)
                    .border(1.dp, colors.borderMuted, CircleShape)
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "5 Modes",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.themeCyan
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Leaderboard Banner Shortcut
        if (onOpenLeaderboard != null) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surface)
                    .border(1.dp, colors.themeYellow.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
                    .clickable { onOpenLeaderboard() }
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(colors.themeYellow.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Leaderboard,
                        contentDescription = "Leaderboard",
                        tint = colors.themeYellow,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Global Arena Standings",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(colors.themeGreen.copy(alpha = 0.2f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "LIVE",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = colors.themeGreen
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Climb ranks and earn weekly champion badges",
                        fontSize = 12.sp,
                        color = colors.textMuted
                    )
                }

                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = colors.themeYellow,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
        }

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(QUIZ_CATALOG) { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(colors.surface)
                        .border(1.dp, colors.borderMuted, RoundedCornerShape(16.dp))
                        .clickable { onLaunchQuiz(item.route) }
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(item.color.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = item.icon,
                            contentDescription = null,
                            tint = item.color,
                            modifier = Modifier.size(26.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = item.title,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = item.subtitle,
                            fontSize = 12.sp,
                            color = colors.textMuted,
                            lineHeight = 16.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "${item.questionsCount} items",
                                fontSize = 11.sp,
                                color = colors.textSecondary
                            )
                            Text(
                                text = " • +${item.xpReward} XP",
                                fontSize = 11.sp,
                                color = colors.themeYellow,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = null,
                        tint = item.color,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}
