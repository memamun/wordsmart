package io.github.memamun.wordsmart.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Quiz
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.Style
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import io.github.memamun.wordsmart.data.local.entity.WordWithDetails
import io.github.memamun.wordsmart.data.repository.UserStats
import io.github.memamun.wordsmart.data.repository.UserStatsRepository
import io.github.memamun.wordsmart.data.repository.WordRepository
import io.github.memamun.wordsmart.domain.srs.SrsRating
import io.github.memamun.wordsmart.ui.components.TtsHelper
import io.github.memamun.wordsmart.ui.components.WordSmartTopBar
import io.github.memamun.wordsmart.ui.corepath.flashcards.FlashcardQuestScreen
import io.github.memamun.wordsmart.ui.corepath.review.Sm2ReviewDeckScreen
import io.github.memamun.wordsmart.ui.corepath.roadmap.PrepRoadmapScreen
import io.github.memamun.wordsmart.ui.corepath.stories.ContextualStoriesScreen
import io.github.memamun.wordsmart.ui.modals.AuthGateModalSheet
import io.github.memamun.wordsmart.ui.modals.StartFreshDialog
import io.github.memamun.wordsmart.ui.modals.WordDetailBentoSheet
import io.github.memamun.wordsmart.ui.modals.WordSmartAiTutorDialog
import io.github.memamun.wordsmart.ui.practice.AdvancedQuizzesScreen
import io.github.memamun.wordsmart.ui.practice.QualificationMcqsScreen
import io.github.memamun.wordsmart.ui.practice.QuickMatchScreen
import io.github.memamun.wordsmart.ui.practice.TimeBlitzScreen
import io.github.memamun.wordsmart.ui.practice.VocabDrillsScreen
import io.github.memamun.wordsmart.ui.resources.DictionaryPortalScreen
import io.github.memamun.wordsmart.ui.resources.HitParadesScreen
import io.github.memamun.wordsmart.ui.resources.LeaderboardScreen
import io.github.memamun.wordsmart.ui.resources.QuizLibraryScreen
import io.github.memamun.wordsmart.ui.resources.SpecializedVocabsScreen
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

data class BottomNavItem(
    val route: String,
    val label: String,
    val icon: ImageVector
)

val BOTTOM_NAV_ITEMS = listOf(
    BottomNavItem("dashboard", "Roadmap", Icons.Default.Explore),
    BottomNavItem("flashcards", "Flashcards", Icons.Default.Style),
    BottomNavItem("review", "SM-2 Deck", Icons.Default.Psychology),
    BottomNavItem("allquizzes", "Arena", Icons.Default.SportsEsports),
    BottomNavItem("search", "Dictionary", Icons.Default.Search)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WordSmartNavHost(
    wordRepository: WordRepository,
    userStatsRepository: UserStatsRepository,
    ttsHelper: TtsHelper,
    isDarkTheme: Boolean = true,
    onToggleTheme: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: "dashboard"

    val coroutineScope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }
    val colors = WordSmartTheme.colors

    // Collect data flows
    val userStats by userStatsRepository.userStatsFlow.collectAsState(initial = UserStats())
    val words by wordRepository.getAllWords().collectAsState(initial = emptyList())
    val allProgress by wordRepository.getAllProgress().collectAsState(initial = emptyList())
    val bookmarkedIds by wordRepository.getBookmarkedWordIds().collectAsState(initial = emptyList())
    val roots by wordRepository.getAllRoots().collectAsState(initial = emptyList())

    // Modal state
    val inspectionStack = remember { androidx.compose.runtime.mutableStateListOf<WordWithDetails>() }
    val bentoSheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var showAiTutorDialog by remember { mutableStateOf(false) }
    var aiTutorContextWord by remember { mutableStateOf<String?>(null) }

    var showAuthGateSheet by remember { mutableStateOf(false) }
    val authGateSheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var showStartFreshDialog by remember { mutableStateOf(false) }

    // Fetch WordWithDetails when inspectingWordId is triggered
    fun openWordDetails(wordId: Int) {
        coroutineScope.launch {
            wordRepository.getWordWithDetails(wordId).collect { details ->
                if (details != null) {
                    inspectionStack.clear()
                    inspectionStack.add(details)
                }
            }
        }
    }

    // Launch AI Tutor with context
    fun openAiTutor(wordContext: String? = null) {
        aiTutorContextWord = wordContext
        showAiTutorDialog = true
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = colors.canvas,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            WordSmartTopBar(
                xp = userStats.xp,
                streak = userStats.streakDays,
                coins = userStats.coins,
                hearts = userStats.hearts,
                isDarkTheme = isDarkTheme,
                onToggleTheme = onToggleTheme,
                onLeaderboardClick = { navController.navigate("leaderboard") },
                onAiTutorClick = { openAiTutor(null) }
            )
        },
        bottomBar = {
            // Show Bottom Navigation only on primary navigation tabs
            val showBottomNav = BOTTOM_NAV_ITEMS.any { it.route == currentRoute } || currentRoute == "leaderboard" || currentRoute == "specialized" || currentRoute == "hitparades"
            if (showBottomNav) {
                NavigationBar(
                    containerColor = colors.surface,
                    modifier = Modifier.border(width = 1.dp, color = colors.borderMuted)
                ) {
                    BOTTOM_NAV_ITEMS.forEach { item ->
                        val selected = currentRoute == item.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                if (currentRoute != item.route) {
                                    navController.navigate(item.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = item.icon,
                                    contentDescription = item.label,
                                    modifier = Modifier.size(22.dp)
                                )
                            },
                            label = {
                                Text(
                                    text = item.label,
                                    fontSize = 11.sp,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = colors.themeCyan,
                                selectedTextColor = colors.themeCyan,
                                unselectedIconColor = colors.textMuted,
                                unselectedTextColor = colors.textMuted,
                                indicatorColor = colors.surfaceElevated
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "dashboard",
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // 1. PrepRoadmapScreen
            composable("dashboard") {
                PrepRoadmapScreen(
                    userStats = userStats,
                    words = words,
                    onNavigate = { route -> navController.navigate(route) },
                    onOpenWordDetails = { wordId -> openWordDetails(wordId) },
                    onClaimChest = { xp, coins ->
                        coroutineScope.launch {
                            userStatsRepository.addXp(xp)
                            userStatsRepository.addCoins(coins)
                            snackbarHostState.showSnackbar("Milestone Chest Opened! +$xp XP, +$coins Coins")
                        }
                    },
                    onOpenAuthGate = { showAuthGateSheet = true }
                )
            }

            // 2. FlashcardQuestScreen
            composable("flashcards") {
                FlashcardQuestScreen(
                    words = words,
                    onRecordRating = { wordId, rating ->
                        coroutineScope.launch {
                            wordRepository.recordSrsReview(wordId, rating)
                            userStatsRepository.addXp(15)
                        }
                    },
                    onSpeakWord = { word -> ttsHelper.speak(word) },
                    onInspectWord = { wordId -> openWordDetails(wordId) },
                    isWordBookmarked = { wordId -> bookmarkedIds.contains(wordId) },
                    onToggleBookmark = { wordId ->
                        coroutineScope.launch {
                            val currentlyBookmarked = bookmarkedIds.contains(wordId)
                            wordRepository.toggleBookmark(wordId, currentlyBookmarked)
                        }
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            // 3. Sm2ReviewDeckScreen
            composable("review") {
                Sm2ReviewDeckScreen(
                    words = words,
                    allProgress = allProgress,
                    onRecordRating = { wordId, rating ->
                        coroutineScope.launch {
                            wordRepository.recordSrsReview(wordId, rating)
                            userStatsRepository.addXp(20)
                        }
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            // 4. ContextualStoriesScreen
            composable("stories") {
                ContextualStoriesScreen(
                    onWordClick = { wordString ->
                        val matchedWord = words.firstOrNull { it.word.equals(wordString, ignoreCase = true) }
                        if (matchedWord != null) {
                            openWordDetails(matchedWord.id)
                        } else {
                            openAiTutor(wordString)
                        }
                    },
                    onSpeakStory = { text -> ttsHelper.speak(text) },
                    onEarnXp = { xp ->
                        coroutineScope.launch {
                            userStatsRepository.addXp(xp)
                            snackbarHostState.showSnackbar("+$xp XP Earned!")
                        }
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            // 5. QualificationMcqsScreen
            composable("quizzes") {
                QualificationMcqsScreen(
                    onCompleteQuiz = { earnedXp, score ->
                        coroutineScope.launch {
                            userStatsRepository.addXp(earnedXp)
                            userStatsRepository.incrementStreak()
                            snackbarHostState.showSnackbar("Assessment Completed! +$earnedXp XP")
                        }
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            // 6. VocabDrillsScreen
            composable("vocabdrills") {
                VocabDrillsScreen(
                    onEarnXp = { xp ->
                        coroutineScope.launch {
                            userStatsRepository.addXp(xp)
                        }
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            // 7. QuickMatchScreen
            composable("quickmatch") {
                QuickMatchScreen(
                    onEarnXp = { xp ->
                        coroutineScope.launch {
                            userStatsRepository.addXp(xp)
                        }
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            // 8. AdvancedQuizzesScreen
            composable("advanced") {
                AdvancedQuizzesScreen(
                    onEarnXp = { xp ->
                        coroutineScope.launch {
                            userStatsRepository.addXp(xp)
                        }
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            // 9. TimeBlitzScreen
            composable("timeblitz") {
                TimeBlitzScreen(
                    onEarnXp = { xp ->
                        coroutineScope.launch {
                            userStatsRepository.addXp(xp)
                        }
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            // 10. DictionaryPortalScreen
            composable("search") {
                DictionaryPortalScreen(
                    words = words,
                    roots = roots,
                    onSelectWord = { wordId -> openWordDetails(wordId) },
                    onSpeakWord = { word -> ttsHelper.speak(word) },
                    onBack = { navController.popBackStack() }
                )
            }

            // 11. SpecializedVocabsScreen
            composable("specialized") {
                SpecializedVocabsScreen(
                    words = words,
                    onSelectWord = { wordId -> openWordDetails(wordId) },
                    onSpeakWord = { word -> ttsHelper.speak(word) },
                    onBack = { navController.popBackStack() }
                )
            }

            // 12. HitParadesScreen
            composable("hitparades") {
                HitParadesScreen(
                    words = words,
                    onSelectWord = { wordId -> openWordDetails(wordId) },
                    onSpeakWord = { word -> ttsHelper.speak(word) },
                    onBack = { navController.popBackStack() }
                )
            }

            // 13. QuizLibraryScreen
            composable("allquizzes") {
                QuizLibraryScreen(
                    onLaunchQuiz = { route -> navController.navigate(route) },
                    onBack = { navController.popBackStack() },
                    onOpenLeaderboard = { navController.navigate("leaderboard") }
                )
            }

            // 14. LeaderboardScreen
            composable("leaderboard") {
                LeaderboardScreen(
                    userStats = userStats,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }

    // Modal 1: WordDetailBentoSheet with Recursive Stack Navigation
    val activeDetails = inspectionStack.lastOrNull()
    if (activeDetails != null) {
        WordDetailBentoSheet(
            wordDetails = activeDetails,
            sheetState = bentoSheetState,
            isBookmarked = bookmarkedIds.contains(activeDetails.word.id),
            canGoBack = inspectionStack.size > 1,
            backStackCount = inspectionStack.size,
            onBackInStack = {
                if (inspectionStack.size > 1) {
                    inspectionStack.removeAt(inspectionStack.lastIndex)
                }
            },
            onInspectWordByName = { queryWord ->
                coroutineScope.launch {
                    val cleanQuery = queryWord.replace("↗", "").trim()
                    val foundWord = wordRepository.getWordByName(cleanQuery)
                    if (foundWord != null) {
                        val newDetails = wordRepository.getWordWithDetails(foundWord.id).firstOrNull()
                        if (newDetails != null) {
                            inspectionStack.add(newDetails)
                        }
                    } else {
                        snackbarHostState.showSnackbar("No detailed record for '$cleanQuery'")
                    }
                }
            },
            onBookmarkToggle = {
                val currentWordId = activeDetails.word.id
                coroutineScope.launch {
                    val isBm = bookmarkedIds.contains(currentWordId)
                    wordRepository.toggleBookmark(currentWordId, isBm)
                }
            },
            onSpeakWord = { text -> ttsHelper.speak(text) },
            onAskAiTutor = { word ->
                inspectionStack.clear()
                openAiTutor(word)
            },
            onDismiss = { inspectionStack.clear() }
        )
    }

    // Modal 2: WordSmartAiTutorDialog
    if (showAiTutorDialog) {
        WordSmartAiTutorDialog(
            initialWordContext = aiTutorContextWord,
            onDismiss = { showAiTutorDialog = false }
        )
    }

    // Modal 3: AuthGateModalSheet
    if (showAuthGateSheet) {
        AuthGateModalSheet(
            sheetState = authGateSheetState,
            onSignInWithGoogle = {
                coroutineScope.launch {
                    snackbarHostState.showSnackbar("Google Sign-In authenticated! Cloud Sync & All Units Unlocked.")
                }
            },
            onContinueAsGuest = {
                coroutineScope.launch {
                    snackbarHostState.showSnackbar("Continuing in offline guest mode.")
                }
            },
            onDismiss = { showAuthGateSheet = false }
        )
    }

    // Modal 4: StartFreshDialog
    if (showStartFreshDialog) {
        StartFreshDialog(
            onConfirmReset = {
                coroutineScope.launch {
                    userStatsRepository.resetAllProgress()
                    wordRepository.clearAllUserProgress()
                    snackbarHostState.showSnackbar("Progress reset. Welcome back to Stage 1!")
                }
            },
            onDismiss = { showStartFreshDialog = false }
        )
    }
}
