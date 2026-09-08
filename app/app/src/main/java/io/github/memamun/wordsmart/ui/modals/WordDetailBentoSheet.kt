package io.github.memamun.wordsmart.ui.modals

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
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.SheetState
import androidx.compose.material3.Surface
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.memamun.wordsmart.data.local.entity.WordWithDetails
import io.github.memamun.wordsmart.ui.components.BentoCard
import io.github.memamun.wordsmart.ui.theme.ThemeCyan
import io.github.memamun.wordsmart.ui.theme.ThemeGreen
import io.github.memamun.wordsmart.ui.theme.ThemeOrange
import io.github.memamun.wordsmart.ui.theme.ThemePurple
import io.github.memamun.wordsmart.ui.theme.ThemeRed
import io.github.memamun.wordsmart.ui.theme.ThemeYellow
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun WordDetailBentoSheet(
    wordDetails: WordWithDetails?,
    sheetState: SheetState,
    isBookmarked: Boolean,
    canGoBack: Boolean = false,
    backStackCount: Int = 1,
    onBackInStack: () -> Unit = {},
    onInspectWordByName: (String) -> Unit = {},
    onBookmarkToggle: () -> Unit,
    onSpeakWord: (String) -> Unit,
    onAskAiTutor: (String) -> Unit,
    onDismiss: () -> Unit
) {
    if (wordDetails == null) return

    val colors = WordSmartTheme.colors
    val word = wordDetails.word
    var isSpeaking by remember { mutableStateOf(false) }

    LaunchedEffect(isSpeaking) {
        if (isSpeaking) {
            delay(1300)
            isSpeaking = false
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = colors.canvas,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 12.dp)
                    .size(width = 36.dp, height = 4.dp)
                    .clip(CircleShape)
                    .background(colors.borderMuted)
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 8.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Back-Stack Navigation Bar inside Sheet if history > 1
            if (canGoBack) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = onBackInStack,
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(colors.surfaceElevated)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Previous Word",
                            tint = ThemeCyan,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Word History ($backStackCount in trail) — Tap to go back",
                        fontSize = 12.sp,
                        color = ThemeCyan,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // Header Bento Card
            BentoCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = word.word,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = colors.textPrimary
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            // POS Pill
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(colors.surfaceElevated)
                                    .border(1.dp, ThemeCyan, RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = word.partOfSpeech?.uppercase() ?: "WORD",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ThemeCyan
                                )
                            }
                        }

                        if (!word.pronunciation.isNullOrBlank()) {
                            Text(
                                text = word.pronunciation,
                                fontSize = 15.sp,
                                color = colors.textMuted,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        // Speaker Wave Animation Container
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .clip(RoundedCornerShape(24.dp))
                                .background(colors.surfaceElevated)
                                .clickable {
                                    isSpeaking = true
                                    onSpeakWord(word.word)
                                }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                                contentDescription = "Pronounce",
                                tint = if (isSpeaking) ThemeGreen else ThemeCyan,
                                modifier = Modifier.size(22.dp)
                            )

                            if (isSpeaking) {
                                Spacer(modifier = Modifier.width(6.dp))
                                AnimatedEqualizerBars()
                            }
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        IconButton(
                            onClick = onBookmarkToggle,
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(colors.surfaceElevated)
                        ) {
                            Icon(
                                imageVector = if (isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                contentDescription = "Bookmark",
                                tint = if (isBookmarked) ThemeYellow else colors.textMuted
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Meaning Bento Card (English & Bengali)
            BentoCard(modifier = Modifier.fillMaxWidth(), borderColor = ThemeCyan.copy(alpha = 0.3f)) {
                Column {
                    Text(
                        text = "DEFINITION & BENGALI MEANING",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = ThemeCyan,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = word.definition,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = colors.textPrimary,
                        lineHeight = 22.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(colors.surfaceElevated)
                            .padding(12.dp)
                    ) {
                        Column {
                            Text(
                                text = "বাংলা অর্থ:",
                                fontSize = 12.sp,
                                color = ThemeYellow,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = word.bengaliMeaning,
                                fontSize = 16.sp,
                                color = colors.textPrimary,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }

            // Mnemonic Bento Card
            if (!word.mnemonic.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(12.dp))
                BentoCard(modifier = Modifier.fillMaxWidth(), borderColor = ThemeYellow.copy(alpha = 0.3f)) {
                    Row(verticalAlignment = Alignment.Top) {
                        Icon(
                            imageVector = Icons.Default.Lightbulb,
                            contentDescription = "Mnemonic",
                            tint = ThemeYellow,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "MNEMONIC MEMORY HOOK",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = ThemeYellow,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = word.mnemonic,
                                fontSize = 14.sp,
                                color = colors.textSecondary,
                                lineHeight = 20.sp
                            )
                        }
                    }
                }
            }

            // Collocations & Examples Bento
            if (wordDetails.examples.isNotEmpty() || wordDetails.collocations.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                BentoCard(modifier = Modifier.fillMaxWidth()) {
                    Column {
                        if (wordDetails.collocations.isNotEmpty()) {
                            Text(
                                text = "COMMON COLLOCATIONS",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.textMuted,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            FlowRow(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                wordDetails.collocations.forEach { col ->
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(colors.surfaceElevated)
                                            .padding(horizontal = 10.dp, vertical = 5.dp)
                                    ) {
                                        Text(
                                            text = col.collocation,
                                            fontSize = 13.sp,
                                            color = colors.textSecondary
                                        )
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                        }

                        if (wordDetails.examples.isNotEmpty()) {
                            Text(
                                text = "IN CONTEXT",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.textMuted,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            wordDetails.examples.forEach { ex ->
                                Text(
                                    text = "“${ex.exampleText}”",
                                    fontSize = 14.sp,
                                    color = colors.textPrimary,
                                    lineHeight = 20.sp,
                                    modifier = Modifier.padding(vertical = 4.dp)
                                )
                                if (!ex.translation.isNullOrBlank()) {
                                    Text(
                                        text = "অনুবাদ: ${ex.translation}",
                                        fontSize = 13.sp,
                                        color = colors.textMuted,
                                        modifier = Modifier.padding(bottom = 6.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Synonyms & Antonyms Bento with Recursive Click Inspection
            if (wordDetails.synonyms.isNotEmpty() || wordDetails.antonyms.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                BentoCard(modifier = Modifier.fillMaxWidth()) {
                    Column {
                        if (wordDetails.synonyms.isNotEmpty()) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "SYNONYMS",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ThemeGreen,
                                    letterSpacing = 1.sp
                                )
                                Text(
                                    text = "Tap to inspect word",
                                    fontSize = 10.sp,
                                    color = colors.textMuted
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            FlowRow(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                wordDetails.synonyms.forEach { syn ->
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(colors.surfaceElevated)
                                            .border(1.dp, ThemeGreen.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                                            .clickable { onInspectWordByName(syn.synonym) }
                                            .padding(horizontal = 10.dp, vertical = 6.dp)
                                    ) {
                                        Text(
                                            text = "${syn.synonym} ↗",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = ThemeGreen
                                        )
                                    }
                                }
                            }
                        }

                        if (wordDetails.antonyms.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "ANTONYMS",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ThemeRed,
                                    letterSpacing = 1.sp
                                )
                                Text(
                                    text = "Tap to inspect word",
                                    fontSize = 10.sp,
                                    color = colors.textMuted
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            FlowRow(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                wordDetails.antonyms.forEach { ant ->
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(colors.surfaceElevated)
                                            .border(1.dp, ThemeRed.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                                            .clickable { onInspectWordByName(ant.antonym) }
                                            .padding(horizontal = 10.dp, vertical = 6.dp)
                                    ) {
                                        Text(
                                            text = "${ant.antonym} ↗",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = ThemeRed
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Roots & Etymology Bento with Origin Flag/Badge
            if (wordDetails.roots.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                BentoCard(modifier = Modifier.fillMaxWidth(), borderColor = ThemePurple.copy(alpha = 0.4f)) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(bottom = 8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Language,
                                contentDescription = null,
                                tint = ThemePurple,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "ETYMOLOGY & ROOT ANCESTRY",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = ThemePurple,
                                letterSpacing = 1.sp
                            )
                        }

                        wordDetails.roots.forEach { root ->
                            val originBadgeColor = when (root.origin.lowercase()) {
                                "latin" -> ThemePurple
                                "greek" -> ThemeCyan
                                "french" -> ThemeOrange
                                "sanskrit" -> ThemeYellow
                                else -> ThemeGreen
                            }

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(colors.surfaceElevated)
                                    .padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(originBadgeColor.copy(alpha = 0.2f))
                                        .border(1.dp, originBadgeColor, RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = root.origin.uppercase(),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = originBadgeColor
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "Root: ${root.root}",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = colors.textPrimary
                                    )
                                    Text(
                                        text = "Meaning: “${root.meaning}”",
                                        fontSize = 12.sp,
                                        color = colors.textSecondary
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // CTA: Ask WordSmart AI
            Button(
                onClick = { onAskAiTutor(word.word) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = ThemeCyan,
                    contentColor = if (colors.isDark) colors.canvas else Color.White
                )
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Ask WordSmart Genius AI",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }

            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}

@Composable
private fun AnimatedEqualizerBars() {
    val infiniteTransition = rememberInfiniteTransition(label = "equalizer")

    val bar1Height by infiniteTransition.animateFloat(
        initialValue = 4f,
        targetValue = 16f,
        animationSpec = infiniteRepeatable(
            animation = tween(280),
            repeatMode = RepeatMode.Reverse
        ),
        label = "bar1"
    )

    val bar2Height by infiniteTransition.animateFloat(
        initialValue = 14f,
        targetValue = 5f,
        animationSpec = infiniteRepeatable(
            animation = tween(220),
            repeatMode = RepeatMode.Reverse
        ),
        label = "bar2"
    )

    val bar3Height by infiniteTransition.animateFloat(
        initialValue = 6f,
        targetValue = 18f,
        animationSpec = infiniteRepeatable(
            animation = tween(320),
            repeatMode = RepeatMode.Reverse
        ),
        label = "bar3"
    )

    Row(
        verticalAlignment = Alignment.Bottom,
        horizontalArrangement = Arrangement.spacedBy(3.dp),
        modifier = Modifier.height(18.dp)
    ) {
        Box(
            modifier = Modifier
                .width(3.dp)
                .height(bar1Height.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(ThemeGreen)
        )
        Box(
            modifier = Modifier
                .width(3.dp)
                .height(bar2Height.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(ThemeGreen)
        )
        Box(
            modifier = Modifier
                .width(3.dp)
                .height(bar3Height.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(ThemeGreen)
        )
    }
}

