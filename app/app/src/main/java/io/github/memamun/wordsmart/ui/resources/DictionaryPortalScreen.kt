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
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.memamun.wordsmart.data.local.entity.RootEntity
import io.github.memamun.wordsmart.data.local.entity.WordEntity
import io.github.memamun.wordsmart.ui.components.BentoCard
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme

@Composable
fun DictionaryPortalScreen(
    words: List<WordEntity>,
    roots: List<RootEntity>,
    onSelectWord: (Int) -> Unit,
    onSpeakWord: (String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = WordSmartTheme.colors
    var searchQuery by remember { mutableStateOf("") }
    var selectedLevelFilter by remember { mutableStateOf<String?>(null) } // null = All
    var selectedTab by remember { mutableStateOf(0) } // 0 = Dictionary, 1 = Roots Catalog

    val filteredWords = remember(words, searchQuery, selectedLevelFilter) {
        words.filter { word ->
            val matchesQuery = searchQuery.isBlank() ||
                    word.word.contains(searchQuery, ignoreCase = true) ||
                    word.definition.contains(searchQuery, ignoreCase = true) ||
                    word.bengaliMeaning.contains(searchQuery, ignoreCase = true)

            val matchesLevel = selectedLevelFilter == null || word.level?.equals(selectedLevelFilter, ignoreCase = true) == true

            matchesQuery && matchesLevel
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.canvas)
            .padding(16.dp)
    ) {
        // Top Header
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
                text = "DICTIONARY & ROOTS PORTAL",
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
                    text = "${filteredWords.size} words",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.themeCyan
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search word, meaning, or বাংলা অর্থ...", color = colors.textMuted, fontSize = 14.sp) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = colors.themeCyan) },
            trailingIcon = {
                if (searchQuery.isNotBlank()) {
                    IconButton(onClick = { searchQuery = "" }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear", tint = colors.textMuted)
                    }
                }
            },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = colors.themeCyan,
                unfocusedBorderColor = colors.borderMuted,
                focusedContainerColor = colors.surface,
                unfocusedContainerColor = colors.surface,
                focusedTextColor = colors.textPrimary,
                unfocusedTextColor = colors.textPrimary
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Tabs: Dictionary vs Roots
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(colors.surface)
                .border(1.dp, colors.borderMuted, RoundedCornerShape(12.dp))
                .padding(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(if (selectedTab == 0) colors.themeCyan else Color.Transparent)
                    .clickable { selectedTab = 0 }
                    .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Vocabulary Lexicon",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = if (selectedTab == 0) {
                        if (colors.isDark) colors.canvas else Color.White
                    } else colors.textSecondary
                )
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(if (selectedTab == 1) colors.themePurple else Color.Transparent)
                    .clickable { selectedTab = 1 }
                    .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Latin & Greek Roots",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = if (selectedTab == 1) Color.White else colors.textSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        if (selectedTab == 0) {
            // CEFR Filter Chips
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    val isAll = selectedLevelFilter == null
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isAll) colors.themeCyan else colors.surface)
                            .border(1.dp, if (isAll) colors.themeCyan else colors.borderMuted, RoundedCornerShape(10.dp))
                            .clickable { selectedLevelFilter = null }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "All Levels",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (isAll) {
                                if (colors.isDark) colors.canvas else Color.White
                            } else colors.textPrimary
                        )
                    }
                }

                items(listOf("beginner", "intermediate", "advanced")) { level ->
                    val isSelected = selectedLevelFilter == level
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) colors.themeCyan else colors.surface)
                            .border(1.dp, if (isSelected) colors.themeCyan else colors.borderMuted, RoundedCornerShape(10.dp))
                            .clickable { selectedLevelFilter = level }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = level.replaceFirstChar { it.uppercase() },
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (isSelected) {
                                if (colors.isDark) colors.canvas else Color.White
                            } else colors.textPrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Word List
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredWords) { word ->
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
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = word.word,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 17.sp,
                                    color = colors.textPrimary
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(colors.surfaceElevated)
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = word.partOfSpeech ?: "w",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = colors.themeCyan
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(2.dp))
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
                                maxLines = 1
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
        } else {
            // Roots Catalog
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(roots) { root ->
                    BentoCard(
                        modifier = Modifier.fillMaxWidth(),
                        backgroundColor = colors.surface,
                        borderColor = colors.themePurple.copy(alpha = 0.3f)
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = root.root,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.themePurple
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(colors.surfaceElevated)
                                        .padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = root.origin,
                                        fontSize = 11.sp,
                                        color = colors.textMuted
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Meaning: ${root.meaning}",
                                fontSize = 14.sp,
                                color = colors.textPrimary
                            )
                        }
                    }
                }
            }
        }
    }
}
