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
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
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
import io.github.memamun.wordsmart.ui.theme.ThemeRed
import io.github.memamun.wordsmart.ui.theme.ThemeYellow
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme

data class MatchPair(
    val wordId: Int,
    val word: String,
    val definitionOrSynonym: String
)

val MATCH_PAIRS = listOf(
    MatchPair(1, "Eloquent", "Fluent & persuasive speech"),
    MatchPair(2, "Benevolent", "Kindhearted & philanthropic"),
    MatchPair(3, "Lucid", "Easily understood & clear"),
    MatchPair(4, "Resilient", "Quick to recover & tough")
)

@Composable
fun QuickMatchScreen(
    onEarnXp: (Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val matchedWordIds = remember { mutableStateListOf<Int>() }
    var selectedWordId by remember { mutableStateOf<Int?>(null) }
    var selectedDefId by remember { mutableStateOf<Int?>(null) }
    var score by remember { mutableIntStateOf(0) }
    var combo by remember { mutableIntStateOf(1) }

    val shuffledDefinitions = remember { MATCH_PAIRS.shuffled() }

    fun checkMatch(wordId: Int, defId: Int) {
        if (wordId == defId) {
            matchedWordIds.add(wordId)
            score += 25 * combo
            combo++
            onEarnXp(25)
        } else {
            combo = 1
        }
        selectedWordId = null
        selectedDefId = null
    }

    val isAllMatched = matchedWordIds.size == MATCH_PAIRS.size

    val colors = WordSmartTheme.colors

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.canvas)
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Bar
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

                Text(
                    text = "QUICK MATCH ARENA",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = ThemeCyan,
                    letterSpacing = 1.sp
                )

                // Combo pill
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(colors.surface)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.LocalFireDepartment,
                        contentDescription = null,
                        tint = ThemeOrange,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${combo}x",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = ThemeOrange
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Matched: ${matchedWordIds.size}/${MATCH_PAIRS.size}",
                    fontSize = 13.sp,
                    color = colors.textMuted
                )
                Text(
                    text = "Score: $score",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = ThemeYellow
                )
            }
        }

        if (isAllMatched) {
            // Victory Box
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
                        modifier = Modifier.size(60.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Perfect Match!",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Final Match Score: $score XP",
                        fontSize = 16.sp,
                        color = ThemeYellow,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(18.dp))
                    Button(
                        onClick = {
                            matchedWordIds.clear()
                            score = 0
                            combo = 1
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
            // Match Columns
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(vertical = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Words Column
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "WORDS",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = ThemeCyan,
                        letterSpacing = 1.sp
                    )

                    MATCH_PAIRS.forEach { pair ->
                        val isMatched = matchedWordIds.contains(pair.wordId)
                        val isSelected = selectedWordId == pair.wordId

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(72.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    when {
                                        isMatched -> ThemeGreen.copy(alpha = 0.2f)
                                        isSelected -> ThemeCyan.copy(alpha = 0.25f)
                                        else -> colors.surface
                                    }
                                )
                                .border(
                                    1.dp,
                                    when {
                                        isMatched -> ThemeGreen
                                        isSelected -> ThemeCyan
                                        else -> colors.borderMuted
                                    },
                                    RoundedCornerShape(12.dp)
                                )
                                .clickable(enabled = !isMatched) {
                                    selectedWordId = pair.wordId
                                    if (selectedDefId != null) {
                                        checkMatch(pair.wordId, selectedDefId!!)
                                    }
                                }
                                .padding(12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = pair.word,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isMatched) ThemeGreen else colors.textPrimary,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }

                // Definitions Column
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "DEFINITIONS",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = ThemeYellow,
                        letterSpacing = 1.sp
                    )

                    shuffledDefinitions.forEach { pair ->
                        val isMatched = matchedWordIds.contains(pair.wordId)
                        val isSelected = selectedDefId == pair.wordId

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(72.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    when {
                                        isMatched -> ThemeGreen.copy(alpha = 0.2f)
                                        isSelected -> ThemeYellow.copy(alpha = 0.25f)
                                        else -> colors.surface
                                    }
                                )
                                .border(
                                    1.dp,
                                    when {
                                        isMatched -> ThemeGreen
                                        isSelected -> ThemeYellow
                                        else -> colors.borderMuted
                                    },
                                    RoundedCornerShape(12.dp)
                                )
                                .clickable(enabled = !isMatched) {
                                    selectedDefId = pair.wordId
                                    if (selectedWordId != null) {
                                        checkMatch(selectedWordId!!, pair.wordId)
                                    }
                                }
                                .padding(10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = pair.definitionOrSynonym,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium,
                                color = if (isMatched) ThemeGreen else colors.textSecondary,
                                textAlign = TextAlign.Center,
                                lineHeight = 17.sp
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
    }
}
