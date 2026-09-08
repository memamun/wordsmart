package io.github.memamun.wordsmart.ui.modals

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
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Quiz
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import io.github.memamun.wordsmart.data.remote.GeminiTutorRepository
import io.github.memamun.wordsmart.ui.theme.ThemeCyan
import io.github.memamun.wordsmart.ui.theme.ThemeGreen
import io.github.memamun.wordsmart.ui.theme.ThemeOrange
import io.github.memamun.wordsmart.ui.theme.ThemePurple
import io.github.memamun.wordsmart.ui.theme.ThemeRed
import io.github.memamun.wordsmart.ui.theme.ThemeYellow
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme
import io.github.memamun.wordsmart.util.SoundEffectHelper
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch
import java.util.UUID

data class QuizOptionItem(
    val letter: String,
    val text: String
)

data class ParsedQuizData(
    val options: List<QuizOptionItem>,
    val correctAnswer: String?
)

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val sender: String, // "user" or "ai"
    val text: String,
    val quizData: ParsedQuizData? = null,
    val suggestions: List<String> = emptyList()
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun WordSmartAiTutorDialog(
    initialWordContext: String? = null,
    onDismiss: () -> Unit,
    geminiRepository: GeminiTutorRepository = remember { GeminiTutorRepository() }
) {
    val colors = WordSmartTheme.colors
    val context = LocalContext.current
    val soundHelper = remember { SoundEffectHelper.getInstance(context) }
    val haptic = LocalHapticFeedback.current

    // Map of messageId -> selectedOptionLetter ("A", "B", etc.)
    val userQuizSelections = remember { mutableStateMapOf<String, String>() }

    val messages = remember {
        mutableStateListOf(
            ChatMessage(
                sender = "ai",
                text = if (initialWordContext != null) {
                    "Hello! I am **WordSmart Genius AI**, your bilingual vocabulary tutor. Let's master **$initialWordContext**! How can I help you unlock this word?"
                } else {
                    "Hello! I am **WordSmart Genius AI**, your bilingual English-Bengali tutor. Ask me about any word, pronunciation, Bengali meaning, etymology, or ask me to quiz you!"
                },
                suggestions = listOf(
                    "Explain Bengali nuance",
                    "Show Latin/Greek roots",
                    "Quiz me on this word"
                )
            )
        )
    }

    var inputText by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    fun parseAiText(aiResponse: String): Pair<String, Pair<ParsedQuizData?, List<String>>> {
        var cleaned = aiResponse

        // Extract suggestions
        val suggestions = mutableListOf<String>()
        val suggRegex = Regex("""\[Suggestions:\s*(.*?)]""", RegexOption.DOT_MATCHES_ALL)
        val suggMatch = suggRegex.find(cleaned)
        if (suggMatch != null) {
            cleaned = cleaned.replace(suggMatch.value, "").trim()
            val options = suggMatch.groupValues[1].split("|").map { it.trim() }.filter { it.isNotBlank() }
            suggestions.addAll(options)
        } else {
            suggestions.addAll(listOf("Give another example", "Explain Bengali nuance", "Quiz me on this word"))
        }

        // Extract [Answer: X]
        var answerLetter: String? = null
        val ansRegex = Regex("""\[Answer:\s*([A-Da-d])\s*]""")
        val ansMatch = ansRegex.find(cleaned)
        if (ansMatch != null) {
            answerLetter = ansMatch.groupValues[1].uppercase()
            cleaned = cleaned.replace(ansMatch.value, "").trim()
        }

        // Extract options: A) ... B) ... C) ... D) ...
        val optionRegex = Regex("""(?m)^([A-D])\)\s+(.*?)$""")
        val matches = optionRegex.findAll(cleaned).toList()
        val quizData = if (matches.size >= 2) {
            val opts = matches.map {
                QuizOptionItem(
                    letter = it.groupValues[1].uppercase(),
                    text = it.groupValues[2].trim()
                )
            }
            cleaned = optionRegex.replace(cleaned, "").trim()
            ParsedQuizData(options = opts, correctAnswer = answerLetter)
        } else {
            null
        }

        return Pair(cleaned, Pair(quizData, suggestions))
    }

    fun sendMessage(prompt: String) {
        if (prompt.isBlank() || isLoading) return
        val userText = prompt.trim()
        messages.add(ChatMessage(sender = "user", text = userText))
        inputText = ""
        isLoading = true

        scope.launch {
            listState.animateScrollToItem((messages.size - 1).coerceAtLeast(0))
            geminiRepository.streamTutorResponse(userText, initialWordContext)
                .catch { err ->
                    isLoading = false
                    messages.add(
                        ChatMessage(
                            sender = "ai",
                            text = "I ran into a temporary hiccup: ${err.localizedMessage}. Feel free to ask another vocabulary question!"
                        )
                    )
                }
                .collect { aiResponse ->
                    isLoading = false
                    val (cleanedText, parsedMeta) = parseAiText(aiResponse)
                    val (quizData, extractedSuggestions) = parsedMeta

                    messages.add(
                        ChatMessage(
                            sender = "ai",
                            text = cleanedText,
                            quizData = quizData,
                            suggestions = extractedSuggestions
                        )
                    )
                    listState.animateScrollToItem(messages.size - 1)
                }
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.88f)
                .clip(RoundedCornerShape(24.dp))
                .border(1.dp, ThemeCyan.copy(alpha = 0.4f), RoundedCornerShape(24.dp)),
            color = colors.canvas
        ) {
            Column(modifier = Modifier.fillMaxHeight()) {
                // Dialog Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(colors.surface)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(Brush.linearGradient(listOf(ThemeCyan, ThemePurple))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.SmartToy,
                                contentDescription = "AI",
                                tint = Color.Black,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "WordSmart Genius AI",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                            Text(
                                text = if (initialWordContext != null) "Tutor for: $initialWordContext" else "Bilingual Vocabulary Mentor",
                                fontSize = 12.sp,
                                color = ThemeCyan
                            )
                        }
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(colors.surfaceElevated)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = colors.textMuted,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                // Chat Messages List
                LazyColumn(
                    state = listState,
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(messages, key = { it.id }) { msg ->
                        if (msg.sender == "user") {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth(0.82f)
                                        .clip(RoundedCornerShape(16.dp, 16.dp, 4.dp, 16.dp))
                                        .background(ThemeCyan)
                                        .padding(12.dp)
                                ) {
                                    Text(
                                        text = msg.text,
                                        color = if (colors.isDark) colors.canvas else Color.White,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        } else {
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalAlignment = Alignment.Start
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth(0.95f)
                                        .clip(RoundedCornerShape(16.dp, 16.dp, 16.dp, 4.dp))
                                        .background(colors.surface)
                                        .border(1.dp, colors.borderMuted, RoundedCornerShape(16.dp, 16.dp, 16.dp, 4.dp))
                                        .padding(14.dp)
                                ) {
                                    Column {
                                        Text(
                                            text = msg.text,
                                            color = colors.textPrimary,
                                            fontSize = 14.sp,
                                            lineHeight = 21.sp
                                        )

                                        // Render Interactive Quiz Buttons if question has options
                                        if (msg.quizData != null) {
                                            val currentSelection = userQuizSelections[msg.id]
                                            val correctLetter = msg.quizData.correctAnswer

                                            Spacer(modifier = Modifier.height(14.dp))
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Icon(
                                                    imageVector = Icons.Default.Quiz,
                                                    contentDescription = null,
                                                    tint = ThemeCyan,
                                                    modifier = Modifier.size(16.dp)
                                                )
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text(
                                                    text = "INTERACTIVE QUICK QUIZ",
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = ThemeCyan,
                                                    letterSpacing = 1.sp
                                                )
                                            }
                                            Spacer(modifier = Modifier.height(8.dp))

                                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                                msg.quizData.options.forEach { option ->
                                                    val isSelected = currentSelection == option.letter
                                                    val isCorrectOption = correctLetter != null && option.letter == correctLetter
                                                    val isWrongSelection = isSelected && correctLetter != null && option.letter != correctLetter

                                                    val (bgColor, borderColor, contentColor) = when {
                                                        currentSelection == null -> Triple(colors.surfaceElevated, colors.borderMuted, colors.textPrimary)
                                                        isCorrectOption -> Triple(ThemeGreen.copy(alpha = 0.2f), ThemeGreen, ThemeGreen)
                                                        isWrongSelection -> Triple(ThemeRed.copy(alpha = 0.2f), ThemeRed, ThemeRed)
                                                        isSelected -> Triple(ThemeCyan.copy(alpha = 0.2f), ThemeCyan, ThemeCyan)
                                                        else -> Triple(colors.surfaceElevated.copy(alpha = 0.5f), colors.borderMuted, colors.textMuted)
                                                    }

                                                    Row(
                                                        modifier = Modifier
                                                            .fillMaxWidth()
                                                            .clip(RoundedCornerShape(12.dp))
                                                            .background(bgColor)
                                                            .border(1.dp, borderColor, RoundedCornerShape(12.dp))
                                                            .clickable(enabled = currentSelection == null) {
                                                                userQuizSelections[msg.id] = option.letter
                                                                if (correctLetter != null) {
                                                                    if (option.letter == correctLetter) {
                                                                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                                                        soundHelper.playCorrect()
                                                                    } else {
                                                                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                                                        soundHelper.playWrong()
                                                                    }
                                                                } else {
                                                                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                                                    soundHelper.playCorrect()
                                                                    sendMessage("My answer is ${option.letter}: ${option.text}")
                                                                }
                                                            }
                                                            .padding(horizontal = 12.dp, vertical = 10.dp),
                                                        verticalAlignment = Alignment.CenterVertically,
                                                        horizontalArrangement = Arrangement.SpaceBetween
                                                    ) {
                                                        Row(
                                                            verticalAlignment = Alignment.CenterVertically,
                                                            modifier = Modifier.weight(1f)
                                                        ) {
                                                            Box(
                                                                modifier = Modifier
                                                                    .size(26.dp)
                                                                    .clip(CircleShape)
                                                                    .background(if (isSelected || isCorrectOption) contentColor.copy(alpha = 0.25f) else colors.canvas),
                                                                contentAlignment = Alignment.Center
                                                            ) {
                                                                Text(
                                                                    text = option.letter,
                                                                    fontWeight = FontWeight.Bold,
                                                                    fontSize = 12.sp,
                                                                    color = contentColor
                                                                )
                                                            }
                                                            Spacer(modifier = Modifier.width(10.dp))
                                                            Text(
                                                                text = option.text,
                                                                fontSize = 13.sp,
                                                                fontWeight = if (isSelected || isCorrectOption) FontWeight.Bold else FontWeight.Normal,
                                                                color = contentColor
                                                            )
                                                        }

                                                        if (currentSelection != null) {
                                                            if (isCorrectOption) {
                                                                Icon(
                                                                    imageVector = Icons.Default.CheckCircle,
                                                                    contentDescription = "Correct",
                                                                    tint = ThemeGreen,
                                                                    modifier = Modifier.size(18.dp)
                                                                )
                                                            } else if (isWrongSelection) {
                                                                Icon(
                                                                    imageVector = Icons.Default.Cancel,
                                                                    contentDescription = "Incorrect",
                                                                    tint = ThemeRed,
                                                                    modifier = Modifier.size(18.dp)
                                                                )
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                            // Immediate result banner
                                            if (currentSelection != null && correctLetter != null) {
                                                Spacer(modifier = Modifier.height(8.dp))
                                                val isCorrect = currentSelection == correctLetter
                                                Row(
                                                    modifier = Modifier
                                                        .fillMaxWidth()
                                                        .clip(RoundedCornerShape(8.dp))
                                                        .background(if (isCorrect) ThemeGreen.copy(alpha = 0.15f) else ThemeRed.copy(alpha = 0.15f))
                                                        .padding(horizontal = 10.dp, vertical = 6.dp),
                                                    horizontalArrangement = Arrangement.SpaceBetween,
                                                    verticalAlignment = Alignment.CenterVertically
                                                ) {
                                                    Text(
                                                        text = if (isCorrect) "✓ Correct Answer! Well done." else "✕ Incorrect! Correct answer was $correctLetter.",
                                                        fontSize = 12.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        color = if (isCorrect) ThemeGreen else ThemeRed
                                                    )
                                                    Text(
                                                        text = "Explain why ➔",
                                                        fontSize = 11.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        color = ThemeCyan,
                                                        modifier = Modifier.clickable {
                                                            sendMessage("Explain in detail why option $correctLetter is the right answer!")
                                                        }
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }

                                if (msg.suggestions.isNotEmpty()) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    FlowRow(
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        verticalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        msg.suggestions.forEach { suggestion ->
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(20.dp))
                                                    .background(colors.surfaceElevated)
                                                    .border(1.dp, ThemeYellow.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                                                    .clickable { sendMessage(suggestion) }
                                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                                            ) {
                                                Text(
                                                    text = "✨ $suggestion",
                                                    fontSize = 12.sp,
                                                    color = ThemeYellow,
                                                    fontWeight = FontWeight.Medium
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (isLoading) {
                        item {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(8.dp)
                            ) {
                                CircularProgressIndicator(
                                    color = ThemeCyan,
                                    modifier = Modifier.size(18.dp),
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "WordSmart AI is formulating bilingual insights...",
                                    fontSize = 12.sp,
                                    color = colors.textMuted
                                )
                            }
                        }
                    }
                }

                // Input Box
                Surface(
                    color = colors.surface,
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, colors.borderMuted)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            placeholder = {
                                Text(
                                    text = "Ask question or request quiz...",
                                    color = colors.textMuted,
                                    fontSize = 14.sp
                                )
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(24.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ThemeCyan,
                                unfocusedBorderColor = colors.borderMuted,
                                focusedTextColor = colors.textPrimary,
                                unfocusedTextColor = colors.textPrimary,
                                focusedContainerColor = colors.surfaceElevated,
                                unfocusedContainerColor = colors.surfaceElevated
                            ),
                            maxLines = 3,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                            keyboardActions = KeyboardActions(onSend = { sendMessage(inputText) })
                        )

                        Spacer(modifier = Modifier.width(8.dp))

                        IconButton(
                            onClick = { sendMessage(inputText) },
                            enabled = inputText.isNotBlank() && !isLoading,
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(if (inputText.isNotBlank()) ThemeCyan else colors.surfaceElevated)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Send,
                                contentDescription = "Send",
                                tint = if (inputText.isNotBlank()) (if (colors.isDark) colors.canvas else Color.White) else colors.textMuted
                            )
                        }
                    }
                }
            }
        }
    }
}

