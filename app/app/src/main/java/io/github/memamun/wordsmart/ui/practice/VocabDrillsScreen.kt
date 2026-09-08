package io.github.memamun.wordsmart.ui.practice

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import io.github.memamun.wordsmart.ui.theme.ThemePurple
import io.github.memamun.wordsmart.ui.theme.ThemeRed
import io.github.memamun.wordsmart.ui.theme.ThemeYellow
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme

data class ClozeDrill(
    val id: Int,
    val beforeBlank: String,
    val afterBlank: String,
    val targetWord: String,
    val bengaliMeaning: String,
    val options: List<String>
)

val SAMPLE_DRILLS = listOf(
    ClozeDrill(
        id = 1,
        beforeBlank = "The diplomat was commended for her ",
        afterBlank = " speech that united the divided factions.",
        targetWord = "eloquent",
        bengaliMeaning = "প্রাঞ্জল ও হৃদয়গ্রাহী",
        options = listOf("belligerent", "eloquent", "ephemeral", "esoteric")
    ),
    ClozeDrill(
        id = 2,
        beforeBlank = "A ",
        afterBlank = " donor contributed five million dollars to build the community hospital.",
        targetWord = "benevolent",
        bengaliMeaning = "দয়ালু ও পরোপকারী",
        options = listOf("benevolent", "pernicious", "candid", "equivocate")
    ),
    ClozeDrill(
        id = 3,
        beforeBlank = "Rather than giving an ",
        afterBlank = " response, the senator answered the question directly and candidly.",
        targetWord = "equivocate",
        bengaliMeaning = "দ্ব্যর্থক ও অস্পষ্ট",
        options = listOf("lucid", "resilient", "equivocate", "diligent")
    ),
    ClozeDrill(
        id = 4,
        beforeBlank = "The student's ",
        afterBlank = " efforts in the library produced a groundbreaking research paper.",
        targetWord = "diligent",
        bengaliMeaning = "অধ্যবসায়ী ও কঠোর পরিশ্রমী",
        options = listOf("diligent", "anachronism", "ephemeral", "belligerent")
    )
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun VocabDrillsScreen(
    onEarnXp: (Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = WordSmartTheme.colors
    var drillIndex by remember { mutableIntStateOf(0) }
    var selectedWord by remember { mutableStateOf<String?>(null) }
    var isSubmitted by remember { mutableStateOf(false) }
    var correctCount by remember { mutableIntStateOf(0) }
    var finished by remember { mutableStateOf(false) }

    val currentDrill = SAMPLE_DRILLS[drillIndex.coerceIn(0, SAMPLE_DRILLS.size - 1)]

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
                        .background(colors.surfaceElevated)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = colors.textPrimary
                    )
                }

                Text(
                    text = "VOCAB CLOZE DRILLS",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = ThemePurple,
                    letterSpacing = 1.sp
                )

                Text(
                    text = "${drillIndex + 1}/${SAMPLE_DRILLS.size}",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textMuted
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            LinearProgressIndicator(
                progress = { (drillIndex + 1).toFloat() / SAMPLE_DRILLS.size.toFloat() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(CircleShape),
                color = ThemePurple,
                trackColor = colors.surfaceElevated
            )
        }

        if (finished) {
            // Finished Card
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
                        text = "Cloze Drill Completed!",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "You accurately placed $correctCount out of ${SAMPLE_DRILLS.size} vocabulary items.",
                        fontSize = 14.sp,
                        color = colors.textSecondary,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onBack,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ThemePurple, contentColor = Color.White)
                    ) {
                        Text("Return to Arena", fontWeight = FontWeight.Bold)
                    }
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
        } else {
            // Cloze Drill Card
            Column(modifier = Modifier.fillMaxWidth()) {
                BentoCard(modifier = Modifier.fillMaxWidth(), borderColor = ThemePurple.copy(alpha = 0.4f)) {
                    Column {
                        Text(
                            text = "FILL IN THE BLANK (CLOZE DRILL)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = ThemePurple,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(14.dp))

                        // Sentence with highlighted interactive blank
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = currentDrill.beforeBlank,
                                fontSize = 16.sp,
                                color = colors.textPrimary,
                                lineHeight = 24.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // The Blank Box
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    when {
                                        !isSubmitted && selectedWord != null -> ThemePurple.copy(alpha = 0.2f)
                                        isSubmitted && selectedWord == currentDrill.targetWord -> ThemeGreen.copy(alpha = 0.25f)
                                        isSubmitted && selectedWord != currentDrill.targetWord -> ThemeRed.copy(alpha = 0.25f)
                                        else -> colors.surfaceElevated
                                    }
                                )
                                .border(
                                    2.dp,
                                    when {
                                        !isSubmitted && selectedWord != null -> ThemePurple
                                        isSubmitted && selectedWord == currentDrill.targetWord -> ThemeGreen
                                        isSubmitted && selectedWord != currentDrill.targetWord -> ThemeRed
                                        else -> colors.borderMuted
                                    },
                                    RoundedCornerShape(10.dp)
                                )
                                .padding(horizontal = 16.dp, vertical = 8.dp)
                                .clickable {
                                    if (!isSubmitted) selectedWord = null
                                }
                        ) {
                            Text(
                                text = selectedWord ?: "___ [Tap a word chip below] ___",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (selectedWord != null) colors.textPrimary else colors.textMuted
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = currentDrill.afterBlank,
                            fontSize = 16.sp,
                            color = colors.textPrimary,
                            lineHeight = 24.sp
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "বাংলা অর্থ প্রয়োজন: ${currentDrill.bengaliMeaning}",
                            fontSize = 13.sp,
                            color = ThemeYellow,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Word Bank Chips
                Text(
                    text = "SELECT REPLACEMENT WORD:",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textMuted,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(bottom = 10.dp)
                )

                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    currentDrill.options.forEach { opt ->
                        val isChosen = selectedWord == opt
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isChosen) ThemePurple else colors.surface)
                                .border(1.dp, if (isChosen) ThemePurple else colors.borderMuted, RoundedCornerShape(12.dp))
                                .clickable {
                                    if (!isSubmitted) selectedWord = opt
                                }
                                .padding(horizontal = 16.dp, vertical = 10.dp)
                        ) {
                            Text(
                                text = opt,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (isChosen) Color.White else colors.textPrimary
                            )
                        }
                    }
                }
            }

            // Bottom Action
            if (!isSubmitted) {
                Button(
                    onClick = {
                        if (selectedWord != null) {
                            isSubmitted = true
                            if (selectedWord == currentDrill.targetWord) {
                                correctCount++
                                onEarnXp(25)
                            }
                        }
                    },
                    enabled = selectedWord != null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ThemePurple, contentColor = Color.White)
                ) {
                    Text("Check Fit", fontWeight = FontWeight.Bold)
                }
            } else {
                Button(
                    onClick = {
                        if (drillIndex < SAMPLE_DRILLS.size - 1) {
                            drillIndex++
                            selectedWord = null
                            isSubmitted = false
                        } else {
                            finished = true
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedWord == currentDrill.targetWord) ThemeGreen else ThemePurple,
                        contentColor = if (selectedWord == currentDrill.targetWord) Color(0xFF0F172A) else Color.White
                    )
                ) {
                    Text(if (drillIndex < SAMPLE_DRILLS.size - 1) "Next Sentence" else "Complete Drill", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
