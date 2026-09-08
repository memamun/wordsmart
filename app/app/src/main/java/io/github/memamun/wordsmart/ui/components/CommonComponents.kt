package io.github.memamun.wordsmart.ui.components

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
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsTopHeight
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme

@Composable
fun WordSmartTopBar(
    xp: Int,
    streak: Int,
    coins: Int,
    hearts: Int,
    isDarkTheme: Boolean = true,
    onToggleTheme: () -> Unit = {},
    onLeaderboardClick: () -> Unit = {},
    onAiTutorClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = WordSmartTheme.colors

    Surface(
        color = colors.surface,
        modifier = modifier
            .fillMaxWidth()
            .border(width = 1.dp, color = colors.borderMuted)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Spacer(modifier = Modifier.windowInsetsTopHeight(WindowInsets.statusBars))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Streak Flame (tappable -> Leaderboard)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(colors.surfaceElevated)
                        .clickable { onLeaderboardClick() }
                        .padding(horizontal = 7.dp, vertical = 4.dp)
                ) {
                    StreakFlame(streak = streak)
                }

                // XP (tappable -> Leaderboard)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(colors.surfaceElevated)
                        .clickable { onLeaderboardClick() }
                        .padding(horizontal = 7.dp, vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = "XP",
                        tint = colors.themeYellow,
                        modifier = Modifier.size(15.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "$xp",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = colors.themeYellow
                    )
                }

                // Coins
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(colors.surfaceElevated)
                        .padding(horizontal = 7.dp, vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.MonetizationOn,
                        contentDescription = "Coins",
                        tint = colors.themeYellow,
                        modifier = Modifier.size(15.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "$coins",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = colors.textPrimary
                    )
                }

                // Hearts
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(colors.surfaceElevated)
                        .padding(horizontal = 7.dp, vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Favorite,
                        contentDescription = "Hearts",
                        tint = colors.themeRed,
                        modifier = Modifier.size(15.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "$hearts",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = colors.themeRed
                    )
                }

                // AI Tutor Action Button
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(Brush.horizontalGradient(listOf(colors.themeCyan, colors.themePurple)))
                        .clickable { onAiTutorClick() }
                        .padding(horizontal = 8.dp, vertical = 5.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = "AI Tutor",
                            tint = Color.Black,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = "AI Genius",
                            color = Color.Black,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 11.sp
                        )
                    }
                }

                // Theme Toggle Switcher (Web Parity: Always at the Far Right)
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .clip(CircleShape)
                        .background(colors.surfaceElevated)
                        .border(1.dp, colors.borderMuted, CircleShape)
                        .clickable { onToggleTheme() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isDarkTheme) Icons.Default.LightMode else Icons.Default.DarkMode,
                        contentDescription = if (isDarkTheme) "Switch to Light Mode" else "Switch to Dark Mode",
                        tint = colors.themeYellow,
                        modifier = Modifier.size(17.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun StreakFlame(streak: Int, modifier: Modifier = Modifier) {
    val colors = WordSmartTheme.colors
    val infiniteTransition = rememberInfiniteTransition(label = "flame")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.92f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
    ) {
        Icon(
            imageVector = Icons.Default.LocalFireDepartment,
            contentDescription = "Streak Flame",
            tint = colors.themeOrange,
            modifier = Modifier
                .size(17.dp)
                .scale(scale)
        )
        Spacer(modifier = Modifier.width(3.dp))
        Text(
            text = "$streak",
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            color = colors.themeOrange
        )
    }
}

@Composable
fun BentoCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = WordSmartTheme.colors.surface,
    borderColor: Color = WordSmartTheme.colors.borderMuted,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(backgroundColor)
            .border(width = 1.dp, color = borderColor, shape = RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        content()
    }
}

@Composable
fun AudioSpeakerButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    tint: Color = WordSmartTheme.colors.themeCyan
) {
    val colors = WordSmartTheme.colors
    IconButton(
        onClick = onClick,
        modifier = modifier
            .size(36.dp)
            .clip(CircleShape)
            .background(colors.surfaceElevated)
    ) {
        Icon(
            imageVector = Icons.AutoMirrored.Filled.VolumeUp,
            contentDescription = "Speak Word",
            tint = tint,
            modifier = Modifier.size(20.dp)
        )
    }
}
