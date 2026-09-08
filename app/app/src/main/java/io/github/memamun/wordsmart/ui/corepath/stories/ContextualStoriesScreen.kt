package io.github.memamun.wordsmart.ui.corepath.stories

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
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

data class StoryItem(
    val id: Int,
    val title: String,
    val genre: String,
    val passageParagraphs: List<String>,
    val targetWords: List<String>,
    val question: String,
    val choices: List<String>,
    val answerIndex: Int,
    val explanation: String
)

val SAMPLE_STORIES = listOf(
    StoryItem(
        id = 1,
        title = "The Diplomat's Concord",
        genre = "International Affairs",
        passageParagraphs = listOf(
            "Ambassador Evelyn was renowned for her eloquent rhetoric. Facing a room filled with belligerent delegates from conflicting factions, she remained circumspect and poised.",
            "Rather than offering an equivocate answer regarding borders, she delivered a candid and lucid proposal. Her benevolent vision was pragmatic yet visionary, providing a resilient blueprint that averted crisis."
        ),
        targetWords = listOf("eloquent", "belligerent", "circumspect", "equivocate", "candid", "lucid", "benevolent", "pragmatic", "resilient"),
        question = "What strategy did the ambassador employ to de-escalate tension?",
        choices = listOf(
            "She delivered vague, equivocate promises to please everyone.",
            "She offered a candid, lucid, and pragmatic proposal.",
            "She attacked the delegates with belligerent rhetoric.",
            "She remained silent and avoided taking any stance."
        ),
        answerIndex = 1,
        explanation = "The passage highlights that she offered a candid (honest) and lucid (clear) proposal that was pragmatic (practical)."
    ),
    StoryItem(
        id = 2,
        title = "Echoes in the Archive",
        genre = "Historical Mystery",
        passageParagraphs = listOf(
            "Dr. Aris discovered an anachronism within the 14th-century monastery manuscript. The author demonstrated an esoteric knowledge of celestial mechanics centuries ahead of his time.",
            "While most scholars found such claims ephemeral, Aris's diligent investigation revealed that the writer harbored no pernicious intent, but rather a profound philosophical catharsis."
        ),
        targetWords = listOf("anachronism", "esoteric", "ephemeral", "diligent", "pernicious", "catharsis"),
        question = "Why was the manuscript notable to Dr. Aris?",
        choices = listOf(
            "It contained a historical anachronism and esoteric astronomical knowledge.",
            "It was written in modern English.",
            "It was completely fabricated to deceive scholars.",
            "It described ordinary farming tools."
        ),
        answerIndex = 0,
        explanation = "The manuscript contained an anachronism and esoteric (specialized) knowledge of celestial mechanics ahead of its period."
    )
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ContextualStoriesScreen(
    onWordClick: (String) -> Unit,
    onSpeakStory: (String) -> Unit,
    onEarnXp: (Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedStoryIndex by remember { mutableIntStateOf(0) }
    val currentStory = SAMPLE_STORIES[selectedStoryIndex]

    var selectedChoice by remember { mutableStateOf<Int?>(null) }
    var quizSubmitted by remember { mutableStateOf(false) }
    val colors = WordSmartTheme.colors

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(colors.canvas)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Header
        item {
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
                    text = "CONTEXTUAL STORIES LAB",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = ThemeGreen,
                    letterSpacing = 1.sp
                )

                IconButton(
                    onClick = {
                        val fullStoryText = currentStory.passageParagraphs.joinToString(" ")
                        onSpeakStory(fullStoryText)
                    },
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(colors.surface)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                        contentDescription = "Listen Story",
                        tint = ThemeCyan
                    )
                }
            }
        }

        // Story Selector Tabs
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(SAMPLE_STORIES.indices.toList()) { index ->
                    val story = SAMPLE_STORIES[index]
                    val isSelected = selectedStoryIndex == index

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) ThemeGreen else colors.surface)
                            .border(1.dp, if (isSelected) ThemeGreen else colors.borderMuted, RoundedCornerShape(12.dp))
                            .clickable {
                                selectedStoryIndex = index
                                selectedChoice = null
                                quizSubmitted = false
                            }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = story.title,
                            color = if (isSelected) Color(0xFF0F172A) else colors.textPrimary,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }

        // Story Card
        item {
            BentoCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = colors.surface,
                borderColor = ThemeGreen.copy(alpha = 0.4f)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = currentStory.genre.uppercase(),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = ThemeGreen,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = currentStory.title,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(colors.surfaceElevated)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "${currentStory.targetWords.size} Keywords",
                                fontSize = 11.sp,
                                color = ThemeCyan,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Story Paragraphs with Clickable Vocabulary Chips
                    currentStory.passageParagraphs.forEach { paragraph ->
                        val tokens = paragraph.split(" ")
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp),
                            modifier = Modifier.padding(bottom = 12.dp)
                        ) {
                            tokens.forEach { token ->
                                val cleanToken = token.replace(Regex("[^a-zA-Z]"), "").lowercase()
                                val isTarget = currentStory.targetWords.any { it.lowercase() == cleanToken }

                                if (isTarget) {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(ThemeCyan.copy(alpha = 0.18f))
                                            .border(1.dp, ThemeCyan, RoundedCornerShape(6.dp))
                                            .clickable { onWordClick(cleanToken) }
                                            .padding(horizontal = 4.dp, vertical = 1.dp)
                                    ) {
                                        Text(
                                            text = token,
                                            color = ThemeCyan,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 15.sp
                                        )
                                    }
                                } else {
                                    Text(
                                        text = token,
                                        color = colors.textPrimary,
                                        fontSize = 15.sp,
                                        lineHeight = 22.sp
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "💡 Tap highlighted cyan words to inspect definition, roots & Bengali nuance.",
                        fontSize = 12.sp,
                        color = colors.textMuted
                    )
                }
            }
        }

        // Reading Comprehension Check
        item {
            BentoCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = colors.surfaceElevated,
                borderColor = ThemeYellow.copy(alpha = 0.4f)
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AutoStories,
                            contentDescription = null,
                            tint = ThemeYellow,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "COMPREHENSION CHECK (+50 XP)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = ThemeYellow,
                            letterSpacing = 1.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = currentStory.question,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.textPrimary
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // 4 choices
                    currentStory.choices.forEachIndexed { idx, choiceText ->
                        val isSelected = selectedChoice == idx
                        val isCorrect = idx == currentStory.answerIndex
                        val choiceBg = when {
                            !quizSubmitted && isSelected -> ThemeCyan.copy(alpha = 0.2f)
                            quizSubmitted && isCorrect -> ThemeGreen.copy(alpha = 0.25f)
                            quizSubmitted && isSelected && !isCorrect -> ThemeRed.copy(alpha = 0.25f)
                            else -> colors.surface
                        }
                        val choiceBorder = when {
                            !quizSubmitted && isSelected -> ThemeCyan
                            quizSubmitted && isCorrect -> ThemeGreen
                            quizSubmitted && isSelected && !isCorrect -> ThemeRed
                            else -> colors.borderMuted
                        }

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(choiceBg)
                                .border(1.dp, choiceBorder, RoundedCornerShape(10.dp))
                                .clickable {
                                    if (!quizSubmitted) selectedChoice = idx
                                }
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "${('A' + idx)})",
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) ThemeCyan else colors.textMuted,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = choiceText,
                                color = colors.textPrimary,
                                fontSize = 14.sp,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    if (!quizSubmitted) {
                        Button(
                            onClick = {
                                if (selectedChoice != null) {
                                    quizSubmitted = true
                                    if (selectedChoice == currentStory.answerIndex) {
                                        onEarnXp(50)
                                    }
                                }
                            },
                            enabled = selectedChoice != null,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ThemeGreen, contentColor = Color(0xFF0F172A))
                        ) {
                            Text("Submit Comprehension Answer", fontWeight = FontWeight.Bold)
                        }
                    } else {
                        // Explanation
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(colors.surface)
                                .padding(12.dp)
                        ) {
                            Text(
                                text = if (selectedChoice == currentStory.answerIndex) "🎉 Correct! +50 XP Earned" else "Incorrect",
                                fontWeight = FontWeight.Bold,
                                color = if (selectedChoice == currentStory.answerIndex) ThemeGreen else ThemeRed,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = currentStory.explanation,
                                fontSize = 13.sp,
                                color = colors.textSecondary
                            )
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
