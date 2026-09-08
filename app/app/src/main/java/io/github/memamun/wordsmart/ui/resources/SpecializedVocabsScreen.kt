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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.BusinessCenter
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.memamun.wordsmart.data.local.entity.WordEntity
import io.github.memamun.wordsmart.ui.components.BentoCard
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme

data class DomainCategory(
    val key: String,
    val title: String,
    val icon: ImageVector,
    val description: String
)

val DOMAIN_CATEGORIES = listOf(
    DomainCategory("business", "Business & Finance", Icons.Default.BusinessCenter, "Amortization, fiscal policy, liquidity, hedonic."),
    DomainCategory("legal", "Legal & Jurisprudence", Icons.Default.Gavel, "Affidavit, tort, jurisprudence, injunction."),
    DomainCategory("medical", "Medical & Clinical", Icons.Default.LocalHospital, "Prognosis, etiology, idiopathic, triage."),
    DomainCategory("literature", "Literary & Rhetoric", Icons.AutoMirrored.Filled.MenuBook, "Catharsis, oxymoron, hubris, pastoral."),
    DomainCategory("philosophy", "Philosophy & Epistemic", Icons.Default.Psychology, "Esoteric, solipsism, ontological, dialectic.")
)

@Composable
fun SpecializedVocabsScreen(
    words: List<WordEntity>,
    onSelectWord: (Int) -> Unit,
    onSpeakWord: (String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = WordSmartTheme.colors
    var selectedCategoryKey by remember { mutableStateOf("business") }
    val currentCategory = DOMAIN_CATEGORIES.first { it.key == selectedCategoryKey }

    val categoryWords = remember(words, selectedCategoryKey) {
        val filtered = words.filter { it.category.equals(selectedCategoryKey, ignoreCase = true) }
        if (filtered.isNotEmpty()) filtered else words.take(4)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.canvas)
            .padding(16.dp)
    ) {
        // Top Bar
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
                text = "SPECIALIZED DOMAIN DECKS",
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
                    text = "${categoryWords.size} words",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.themeCyan
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Domain Selector Pills
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(DOMAIN_CATEGORIES) { cat ->
                val isSelected = cat.key == selectedCategoryKey
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isSelected) colors.themeCyan else colors.surface)
                        .border(1.dp, if (isSelected) colors.themeCyan else colors.borderMuted, RoundedCornerShape(12.dp))
                        .clickable { selectedCategoryKey = cat.key }
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = cat.icon,
                            contentDescription = null,
                            tint = if (isSelected) {
                                if (colors.isDark) colors.canvas else Color.White
                            } else colors.themeCyan,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = cat.title,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) {
                                if (colors.isDark) colors.canvas else Color.White
                            } else colors.textPrimary
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Header Bento Card
        BentoCard(modifier = Modifier.fillMaxWidth(), backgroundColor = colors.surface, borderColor = colors.themeCyan.copy(alpha = 0.3f)) {
            Column {
                Text(
                    text = currentCategory.title.uppercase(),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.themeCyan,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = currentCategory.description,
                    fontSize = 13.sp,
                    color = colors.textSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Category Words List
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(categoryWords) { word ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(colors.surface)
                        .border(1.dp, colors.borderMuted, RoundedCornerShape(14.dp))
                        .clickable { onSelectWord(word.id) }
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = word.word,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                        Text(
                            text = word.bengaliMeaning,
                            fontSize = 13.sp,
                            color = colors.themeYellow
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = word.definition,
                            fontSize = 13.sp,
                            color = colors.textMuted,
                            maxLines = 2
                        )
                    }

                    IconButton(
                        onClick = { onSpeakWord(word.word) },
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(colors.surfaceElevated)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                            contentDescription = "Pronounce",
                            tint = colors.themeCyan,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}
