package io.github.memamun.wordsmart.ui.corepath.flashcards

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
import io.github.memamun.wordsmart.util.SoundEffectHelper
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.math.roundToInt

@Composable
fun FlashcardQuestScreen(
    words: List<WordEntity>,
    onRecordRating: (Int, SrsRating) -> Unit,
    onSpeakWord: (String) -> Unit,
    onInspectWord: (Int) -> Unit,
    isWordBookmarked: (Int) -> Boolean,
    onToggleBookmark: (Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = WordSmartTheme.colors
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current
    val soundHelper = remember { SoundEffectHelper.getInstance(context) }
    val scope = rememberCoroutineScope()

    if (words.isEmpty()) {
        Box(
            modifier = modifier
                .fillMaxSize()
                .background(colors.canvas),
            contentAlignment = Alignment.Center
        ) {
            Text("No flashcards found for this unit.", color = colors.textMuted)
        }
        return
    }

    var currentIndex by remember { mutableIntStateOf(0) }
    var isFlipped by remember { mutableStateOf(false) }
    val dragOffsetX = remember { Animatable(0f) }

    val currentWord = words[currentIndex.coerceIn(0, words.size - 1)]
    val isBookmarked = isWordBookmarked(currentWord.id)

    // Smooth 3D Flip animation
    val rotation by animateFloatAsState(
        targetValue = if (isFlipped) 180f else 0f,
        animationSpec = tween(durationMillis = 380, easing = FastOutSlowInEasing),
        label = "cardFlip"
    )

    fun advanceCard(rating: SrsRating) {
        onRecordRating(currentWord.id, rating)
        isFlipped = false
        scope.launch {
            dragOffsetX.snapTo(0f)
            if (currentIndex < words.size - 1) {
                currentIndex++
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.canvas)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Navigation & Card Counter
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

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "FLASHCARD QUEST",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = ThemeCyan,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "${currentIndex + 1} of ${words.size}",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = colors.textMuted
                )
            }

            IconButton(
                onClick = { onToggleBookmark(currentWord.id) },
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

        Spacer(modifier = Modifier.height(12.dp))

        // Progress Bar
        LinearProgressIndicator(
            progress = { (currentIndex + 1).toFloat() / words.size.toFloat() },
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(CircleShape),
            color = ThemeCyan,
            trackColor = colors.surfaceElevated
        )

        // Swipe Hints Pill
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "← Swipe Left: Again",
                fontSize = 11.sp,
                color = if (dragOffsetX.value < -40f) ThemeRed else colors.textMuted,
                fontWeight = if (dragOffsetX.value < -40f) FontWeight.Bold else FontWeight.Normal
            )
            Text(
                text = "Swipe Right: Easy →",
                fontSize = 11.sp,
                color = if (dragOffsetX.value > 40f) ThemeGreen else colors.textMuted,
                fontWeight = if (dragOffsetX.value > 40f) FontWeight.Bold else FontWeight.Normal
            )
        }

        // Swipeable & 3D Flippable Card Container
        val currentOffset = dragOffsetX.value
        val dragFraction = (abs(currentOffset) / 300f).coerceIn(0f, 1f)
        val glowColor = when {
            currentOffset > 40f -> ThemeGreen.copy(alpha = (dragFraction * 0.8f).coerceIn(0.2f, 0.9f))
            currentOffset < -40f -> ThemeRed.copy(alpha = (dragFraction * 0.8f).coerceIn(0.2f, 0.9f))
            else -> colors.borderMuted
        }

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .offset { IntOffset(currentOffset.roundToInt(), 0) }
                .graphicsLayer {
                    rotationZ = (currentOffset / 22f).coerceIn(-14f, 14f)
                    rotationY = rotation
                    cameraDistance = 16f * density
                }
                .pointerInput(currentIndex) {
                    detectHorizontalDragGestures(
                        onDragEnd = {
                            val dragDistance = dragOffsetX.value
                            if (dragDistance > 160f) {
                                // Swiped right: Easy / Mastered
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                soundHelper.playCorrect()
                                scope.launch {
                                    dragOffsetX.animateTo(600f, tween(180))
                                    advanceCard(SrsRating.EASY)
                                }
                            } else if (dragDistance < -160f) {
                                // Swiped left: Again / Repeat
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                soundHelper.playWrong()
                                scope.launch {
                                    dragOffsetX.animateTo(-600f, tween(180))
                                    advanceCard(SrsRating.AGAIN)
                                }
                            } else {
                                // Snap back to center
                                scope.launch {
                                    dragOffsetX.animateTo(0f, spring(stiffness = Spring.StiffnessMediumLow))
                                }
                            }
                        },
                        onHorizontalDrag = { _, dragAmount ->
                            scope.launch {
                                dragOffsetX.snapTo(dragOffsetX.value + dragAmount)
                            }
                        }
                    )
                }
                .clickable {
                    soundHelper.playFlip()
                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                    isFlipped = !isFlipped
                }
        ) {
            if (rotation <= 90f) {
                // Card Front
                Card(
                    modifier = Modifier
                        .fillMaxSize()
                        .border(
                            width = if (abs(currentOffset) > 40f) 2.5.dp else 1.dp,
                            color = glowColor,
                            shape = RoundedCornerShape(24.dp)
                        ),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = colors.surface)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(colors.surfaceElevated)
                                    .border(1.dp, ThemeCyan, RoundedCornerShape(8.dp))
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = currentWord.partOfSpeech?.uppercase() ?: "WORD",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ThemeCyan
                                )
                            }

                            IconButton(
                                onClick = {
                                    soundHelper.playFlip()
                                    onSpeakWord(currentWord.word)
                                },
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(colors.surfaceElevated)
                            ) {
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                                    contentDescription = "Pronounce",
                                    tint = ThemeCyan
                                )
                            }
                        }

                        // Dynamic Swipe Status Indicator
                        if (currentOffset > 60f) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(ThemeGreen.copy(alpha = 0.2f))
                                    .border(1.5.dp, ThemeGreen, RoundedCornerShape(12.dp))
                                    .padding(horizontal = 14.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = ThemeGreen)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("EASY / MASTERED", color = ThemeGreen, fontWeight = FontWeight.Bold)
                            }
                        } else if (currentOffset < -60f) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(ThemeRed.copy(alpha = 0.2f))
                                    .border(1.5.dp, ThemeRed, RoundedCornerShape(12.dp))
                                    .padding(horizontal = 14.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.Close, contentDescription = null, tint = ThemeRed)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("AGAIN / REPEAT", color = ThemeRed, fontWeight = FontWeight.Bold)
                            }
                        }

                        // Center: Display Word & Pronunciation
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = currentWord.word,
                                fontSize = 34.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = colors.textPrimary,
                                textAlign = TextAlign.Center
                            )

                            if (!currentWord.pronunciation.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = currentWord.pronunciation,
                                    fontSize = 18.sp,
                                    color = colors.textMuted
                                )
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(colors.surfaceElevated)
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = "CEFR: ${currentWord.level?.uppercase() ?: "INTERMEDIATE"}",
                                    fontSize = 12.sp,
                                    color = ThemeYellow,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }

                        // Bottom Flip Cue
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(bottom = 8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Repeat,
                                contentDescription = null,
                                tint = ThemeCyan,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Tap card to flip for meaning & mnemonics",
                                fontSize = 12.sp,
                                color = ThemeCyan
                            )
                        }
                    }
                }
            } else {
                // Card Back (mirrored horizontally to read correctly)
                Card(
                    modifier = Modifier
                        .fillMaxSize()
                        .graphicsLayer { rotationY = 180f }
                        .border(
                            width = if (abs(currentOffset) > 40f) 2.5.dp else 1.dp,
                            color = glowColor,
                            shape = RoundedCornerShape(24.dp)
                        ),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = colors.surfaceElevated)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(20.dp),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = currentWord.word,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ThemeCyan
                                )
                                Text(
                                    text = "REVERSE",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textMuted,
                                    letterSpacing = 1.sp
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = currentWord.definition,
                                fontSize = 15.sp,
                                color = colors.textPrimary,
                                lineHeight = 21.sp
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            // Bengali Box
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(colors.canvas)
                                    .padding(10.dp)
                            ) {
                                Column {
                                    Text(
                                        text = "বাংলা অর্থ:",
                                        fontSize = 11.sp,
                                        color = ThemeYellow,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = currentWord.bengaliMeaning,
                                        fontSize = 15.sp,
                                        color = colors.textPrimary,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }

                            if (!currentWord.mnemonic.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Lightbulb,
                                        contentDescription = null,
                                        tint = ThemeYellow,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = currentWord.mnemonic,
                                        fontSize = 13.sp,
                                        color = colors.textSecondary,
                                        lineHeight = 18.sp
                                    )
                                }
                            }
                        }

                        // Inspect Bento Button
                        OutlinedButton(
                            onClick = { onInspectWord(currentWord.id) },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = ThemeCyan)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Inspect Full Bento Sheet")
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // SRS Rating Action Bar (Duolingo/Anki style SM-2 buttons)
        Column(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = "HOW WELL DO YOU RECALL THIS WORD?",
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
                // Again
                Button(
                    onClick = {
                        soundHelper.playWrong()
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        advanceCard(SrsRating.AGAIN)
                    },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ThemeRed.copy(alpha = 0.2f), contentColor = ThemeRed)
                ) {
                    Text("Again", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                // Hard
                Button(
                    onClick = {
                        soundHelper.playFlip()
                        advanceCard(SrsRating.HARD)
                    },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ThemeOrange.copy(alpha = 0.2f), contentColor = ThemeOrange)
                ) {
                    Text("Hard", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                // Good
                Button(
                    onClick = {
                        soundHelper.playCorrect()
                        advanceCard(SrsRating.GOOD)
                    },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ThemeCyan.copy(alpha = 0.2f), contentColor = ThemeCyan)
                ) {
                    Text("Good", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                // Easy
                Button(
                    onClick = {
                        soundHelper.playCorrect()
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        advanceCard(SrsRating.EASY)
                    },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ThemeGreen.copy(alpha = 0.2f), contentColor = ThemeGreen)
                ) {
                    Text("Easy", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
    }
}

