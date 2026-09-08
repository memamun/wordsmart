# WordSmart — Google AI Studio Master Generation Prompt (Kotlin / Jetpack Compose)

> **Instructions for Google AI Studio**: Copy and paste the prompt below into Google AI Studio (recommended model: **Gemini 1.5 Pro** or **Gemini 2.5 Flash / Pro** with System Instructions enabled and Temperature set to `0.2` – `0.3` for deterministic, production-grade Android Kotlin code generation).

---

```markdown
# SYSTEM INSTRUCTION: ROLE & ARCHITECTURAL DIRECTIVE
You are an Elite Principal Android Architect, Google Developer Expert (GDE) in Kotlin & Jetpack Compose, and Lead EdTech Product Designer. Your objective is to generate the complete, production-ready, native Android application for **WordSmart** in **Kotlin** using modern Android standards (2026).

### Benchmark Standards:
- **Duolingo / Duolingo Max**: Gamified unit roadmap, streak psychology, XP leagues, celebratory feedback loops.
- **Brilliant.org**: Intuition-first interactive widgets, focused cognitive flow, clean typography.
- **Elevate & Lumosity**: Rapid-fire drills, cognitive stat tracking, haptic and audio-visual feedback loops.
- **Anki & SuperMemo (SM-2)**: Mathematically rigorous Spaced Repetition System (SRS) for active recall.
- **Vocabulary.com**: Rich etymology, contextual usage in authentic literature, morphological root trees.

---

# SECTION 1: STRICT TERMINOLOGY & NAMING CONVENTION (WEB PARITY)
To ensure 100% seamless continuity between the web application and the Android app, you MUST strictly preserve the exact web naming conventions, screen identifiers, category groupings, and prep stage titles:

### 1. Navigation Categories & Screen Names:
- **Core Path**:
  - `PrepRoadmapScreen` (`route = "dashboard"`) — Unit-by-unit visual progression roadmap with milestone chests.
  - `FlashcardQuestScreen` (`route = "flashcards"`) — Interactive 3D flipcards with front/back cues, native TextToSpeech audio, and mnemonics.
  - `Sm2ReviewDeckScreen` (`route = "review"`) — Active recall spaced repetition engine powered by the SuperMemo-2 algorithm.
  - `ContextualStoriesScreen` (`route = "stories"`) — Immersive narratives with interactive clickable vocabulary chips.
- **Practice Arena**:
  - `QualificationMcqsScreen` (`route = "quizzes"`) — Unit-based 4-option qualifying quizzes with instant explanations.
  - `VocabDrillsScreen` (`route = "vocabdrills"`) — High-retention fill-in-the-blank (cloze) and word-fitting drills.
  - `QuickMatchScreen` (`route = "quickmatch"`) — Fast-paced definition and synonym pairing game.
  - `AdvancedQuizzesScreen` (`route = "advanced"`) — Rigorous passage-based sentence completions and dual-blank SAT/GRE challenges.
  - `TimeBlitzScreen` (`route = "timeblitz"`) — Adrenaline-fueled 60-second rapid-fire sprint with combo streaks, haptics, and score multipliers.
- **Resources & Stats**:
  - `DictionaryPortalScreen` (`route = "search"`) — Universal vocabulary search, CEFR filters, and Latin/Greek etymology roots.
  - `SpecializedVocabsScreen` (`route = "specialized"`) — Domain-specific decks (Business, Legal, Medical, Literature, Philosophy).
  - `HitParadesScreen` (`route = "hitparades"`) — High-yield frequency lists (Top 25 words per batch) for SAT & GRE.
  - `QuizLibraryScreen` (`route = "allquizzes"`) — Central catalog of all available quizzes and assessments.
  - `LeaderboardScreen` (`route = "leaderboard"`) — Global leaderboard and league rankings powered by Cloud Firestore.

### 2. The 10 Official Prep Stages (`PrepStage`):
1. **Stage 1**: *Beginner Foundations I* (0 XP required)
2. **Stage 2**: *Beginner Foundations II* (500 XP required)
3. **Stage 3**: *Beginner & Intermediate Bridge* (1,200 XP required)
4. **Stage 4**: *Intermediate Core I* (2,200 XP required)
5. **Stage 5**: *Intermediate Core II* (3,500 XP required)
6. **Stage 6**: *Intermediate & Advanced Bridge* (5,000 XP required)
7. **Stage 7**: *Advanced Mastery I* (7,000 XP required)
8. **Stage 8**: *Advanced Mastery II* (9,500 XP required)
9. **Stage 9**: *Advanced Mastery III* (12,500 XP required)
10. **Stage 10**: *Advanced Mastery IV* (16,000 XP required)

### 3. Modals & Overlays (Jetpack Compose):
- `WordDetailBentoSheet`: ModalBottomSheet for in-depth word inspection (Bento grid layout).
- `WordSmartAiTutorDialog`: Real-time streaming conversational AI tutor ("WordSmart Genius").
- `AuthGateModalSheet`: Google Sign-In prompt for guest users to unlock Units 2–10 and cloud sync.
- `QuizExitConfirmDialog`: Prevents accidental quiz exit.
- `StartFreshDialog`: Playful safety dialog for resetting user progress.

---

# SECTION 2: ANDROID KOTLIN TECHNICAL ARCHITECTURE

## 1. Modern Android Technology Stack (2026 Standards)
- **Language**: Kotlin 2.0+ with modern idioms (Sealed interfaces, Coroutines, Flow, Value classes).
- **UI Toolkit**: 100% Jetpack Compose with Material 3 (Expressive design, Dynamic Theme, Edge-to-edge display).
- **Navigation**: Type-Safe Navigation Compose (`androidx.navigation:navigation-compose:2.8+`) with `@Serializable` route classes or objects.
- **Adaptive UI**: `NavigationSuiteScaffold` (renders Bottom Navigation Bar on compact phones, Navigation Rail on foldables/tablets).
- **Dependency Injection**: Hilt (`@HiltAndroidApp`, `@AndroidEntryPoint`, `@HiltViewModel`) or Koin.
- **Local Persistence**:
  - **Room Database**: Pre-populated from `app/assets/wordsmart.db` (27 SQLite tables) via `.createFromAsset("wordsmart.db")`.
  - **DataStore Preferences**: For user preferences, sound toggles, theme mode, and cached gamestate.
- **Audio & Haptics**:
  - Android `TextToSpeech` engine (with Bengali & English locale handling).
  - Android `SoundPool` for immediate low-latency quiz chimes and timer ticks.
  - Compose `LocalHapticFeedback` for tactile button taps and answer confirmations.
- **Animation & Confetti**: Compose `AnimatedVisibility`, `animateFloatAsState`, and `nl.dionsegijn:konfetti-compose:2.0.4`.
- **AI Integration**: Google AI Client SDK for Android (`com.google.ai.client.generativeai:generativeai:0.9.0+`) using `gemini-2.5-flash` or `gemini-1.5-pro` with real-time Flow streaming.
- **Backend Sync**: Firebase Auth (Google Credential Manager) + Firebase Firestore Kotlin SDK.

## 2. Recommended Package Structure
```
com.wordsmart.app/
├── WordSmartApplication.kt           # Application class with Hilt/Koin init
├── MainActivity.kt                   # Edge-to-edge Activity with NavigationHost
├── di/                               # Dependency injection modules (DatabaseModule, NetworkModule, AiModule)
├── data/
│   ├── local/
│   │   ├── WordSmartDatabase.kt      # Room database class pre-populated from assets
│   │   ├── dao/                      # WordDao, QuizDao, ProgressDao, StoryDao, RootDao
│   │   └── entity/                   # Room entities matching SQLite schema exactly
│   ├── remote/
│   │   ├── GeminiAiDataSource.kt     # Streaming Gemini API wrapper with response parsing
│   │   └── FirestoreSyncService.kt   # Firestore user progress and leaderboard sync
│   └── repository/
│       ├── WordRepositoryImpl.kt
│       ├── QuizRepositoryImpl.kt
│       ├── SrsRepositoryImpl.kt
│       └── UserProgressRepositoryImpl.kt
├── domain/
│   ├── model/                        # Clean domain models: Word, Flashcard, QuizQuestion, Story, Root
│   ├── srs/                          # Pure Kotlin SuperMemo-2 (SM-2) algorithm
│   └── usecase/                      # GetDueCardsUseCase, SubmitQuizAnswerUseCase, CalculateStreakUseCase
└── ui/
    ├── theme/                        # Color.kt, Theme.kt, Type.kt (Outfit, Inter, Hind Siliguri fonts)
    ├── navigation/                   # Screen.kt (Type-safe routes), WordSmartNavHost.kt
    ├── components/                   # BentoCard, AudioButton, XpBadge, StreakFlame, ProgressBar
    ├── corepath/
    │   ├── roadmap/                  # PrepRoadmapScreen & RoadmapViewModel
    │   ├── flashcards/               # FlashcardQuestScreen (3D flip card)
    │   ├── review/                   # Sm2ReviewDeckScreen (SRS engine with 4 quality buttons)
    │   └── stories/                  # ContextualStoriesScreen (Interactive story reader)
    ├── practice/
    │   ├── quizzes/                  # QualificationMcqsScreen & QuizRunnerScreen
    │   ├── drills/                   # VocabDrillsScreen
    │   ├── match/                    # QuickMatchScreen
    │   ├── advanced/                 # AdvancedQuizzesScreen
    │   └── blitz/                    # TimeBlitzScreen (60-second speed game)
    ├── resources/
    │   ├── dictionary/               # DictionaryPortalScreen & RootTreeTab
    │   ├── specialized/              # SpecializedVocabsScreen
    │   ├── hitparades/               # HitParadesScreen
    │   ├── library/                  # QuizLibraryScreen
    │   └── leaderboard/              # LeaderboardScreen
    └── modals/
        ├── WordDetailBentoSheet.kt   # In-depth word inspection bottom sheet
        ├── WordSmartAiTutorDialog.kt # Streaming AI tutor dialog
        └── AuthGateModalSheet.kt     # Google Sign-In prompt
```

---

# SECTION 3: COMPLETE DATABASE SCHEMA & ROOM ENTITIES (SQLITE)

The application ships with a pre-populated SQLite database at `assets/wordsmart.db` containing 27 tables (~21,259 rows). Room maps directly to these tables:

### 1. `words` Entity (Central Lexicon Table)
```kotlin
@Entity(tableName = "words")
data class WordEntity(
    @PrimaryKey val id: Int,
    @ColumnInfo(name = "word") val word: String,
    @ColumnInfo(name = "pronunciation") val pronunciation: String?,
    @ColumnInfo(name = "part_of_speech") val partOfSpeech: String?, // "v", "n", "adj", "adv"
    @ColumnInfo(name = "definition") val definition: String,
    @ColumnInfo(name = "bengali_meaning") val bengaliMeaning: String,
    @ColumnInfo(name = "mnemonic") val mnemonic: String?,
    @ColumnInfo(name = "level") val level: String?,                 // "beginner", "intermediate", "advanced"
    @ColumnInfo(name = "audio") val audio: String?,
    @ColumnInfo(name = "quick_quiz_id") val quickQuizId: Int?
)
```

### 2. Linguistic Child Entities
```kotlin
@Entity(
    tableName = "word_examples",
    foreignKeys = [ForeignKey(entity = WordEntity::class, parentColumns = ["id"], childColumns = ["word_id"], onDelete = ForeignKey.CASCADE)],
    indices = [Index("word_id")]
)
data class WordExampleEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "example_text") val exampleText: String,
    @ColumnInfo(name = "translation") val translation: String?
)

@Entity(
    tableName = "word_synonyms",
    foreignKeys = [ForeignKey(entity = WordEntity::class, parentColumns = ["id"], childColumns = ["word_id"], onDelete = ForeignKey.CASCADE)],
    indices = [Index("word_id")]
)
data class WordSynonymEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "synonym") val synonym: String
)

@Entity(
    tableName = "word_antonyms",
    foreignKeys = [ForeignKey(entity = WordEntity::class, parentColumns = ["id"], childColumns = ["word_id"], onDelete = ForeignKey.CASCADE)],
    indices = [Index("word_id")]
)
data class WordAntonymEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "antonym") val antonym: String
)

@Entity(
    tableName = "word_collocations",
    foreignKeys = [ForeignKey(entity = WordEntity::class, parentColumns = ["id"], childColumns = ["word_id"], onDelete = ForeignKey.CASCADE)],
    indices = [Index("word_id")]
)
data class WordCollocationEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "collocation") val collocation: String
)
```

### 3. Etymological Root Entities
```kotlin
@Entity(tableName = "roots")
data class RootEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "root") val root: String,
    @ColumnInfo(name = "meaning") val meaning: String
)

@Entity(
    tableName = "word_roots",
    primaryKeys = ["word_id", "root_id"],
    foreignKeys = [
        ForeignKey(entity = WordEntity::class, parentColumns = ["id"], childColumns = ["word_id"], onDelete = ForeignKey.CASCADE),
        ForeignKey(entity = RootEntity::class, parentColumns = ["id"], childColumns = ["root_id"], onDelete = ForeignKey.CASCADE)
    ],
    indices = [Index("word_id"), Index("root_id")]
)
data class WordRootCrossRef(
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "root_id") val rootId: Int
)
```

### 4. User Progress Entity (SuperMemo-2 SRS Tracking)
```kotlin
@Entity(
    tableName = "progress",
    primaryKeys = ["user_id", "word_id"],
    foreignKeys = [ForeignKey(entity = WordEntity::class, parentColumns = ["id"], childColumns = ["word_id"], onDelete = ForeignKey.CASCADE)],
    indices = [Index("word_id")]
)
data class UserProgressEntity(
    @ColumnInfo(name = "user_id") val userId: String = "local_user",
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "status") val status: String = "learning",       // "learning", "mastered"
    @ColumnInfo(name = "easiness_factor") val easinessFactor: Float = 2.5f,
    @ColumnInfo(name = "repetition_count") val repetitionCount: Int = 0,
    @ColumnInfo(name = "interval_days") val intervalDays: Int = 1,
    @ColumnInfo(name = "last_reviewed_at") val lastReviewedAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "next_review_at") val nextReviewAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "mastery_score") val masteryScore: Int = 0       // 0 - 100
)

@Entity(
    tableName = "bookmarks",
    primaryKeys = ["user_id", "word_id"],
    foreignKeys = [ForeignKey(entity = WordEntity::class, parentColumns = ["id"], childColumns = ["word_id"], onDelete = ForeignKey.CASCADE)],
    indices = [Index("word_id")]
)
data class BookmarkEntity(
    @ColumnInfo(name = "user_id") val userId: String = "local_user",
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis()
)
```

### 5. Room Database Builder
```kotlin
@Database(
    entities = [
        WordEntity::class, WordExampleEntity::class, WordSynonymEntity::class,
        WordAntonymEntity::class, WordCollocationEntity::class, RootEntity::class,
        WordRootCrossRef::class, UserProgressEntity::class, BookmarkEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class WordSmartDatabase : RoomDatabase() {
    abstract fun wordDao(): WordDao
    abstract fun progressDao(): ProgressDao

    companion object {
        fun buildDatabase(context: Context): WordSmartDatabase {
            return Room.databaseBuilder(context, WordSmartDatabase::class.java, "wordsmart.db")
                .createFromAsset("wordsmart.db")
                .fallbackToDestructiveMigration()
                .build()
        }
    }
}
```

---

# SECTION 4: JETPACK COMPOSE DESIGN SYSTEM (MATERIAL 3)

### Color Palette (`ui/theme/Color.kt`):
```kotlin
val CanvasDark = Color(0xFF090B11)
val SurfaceDark = Color(0xFF121824)
val SurfaceElevatedDark = Color(0xFF1E293B)
val BorderMutedDark = Color(0xFF2D3B55)

val ThemeYellow = Color(0xFFFFD54F)   // XP & Highlights
val ThemeGreen = Color(0xFF69F0AE)    // Success & Mastered
val ThemeCyan = Color(0xFF18FFFF)     // Cyan Accent & Links
val ThemeRed = Color(0xFFFF5252)      // Danger & Incorrect
val ThemePurple = Color(0xFF8B5CF6)   // Royal Accent
val ThemeOrange = Color(0xFFFF9100)   // Streak Flame

val TextPrimaryDark = Color(0xFFF8FAFC)
val TextSecondaryDark = Color(0xFFE2E8F0)
val TextMutedDark = Color(0xFF94A3B8)
```

### Typography (`ui/theme/Type.kt`):
- Titles & Headings: `FontFamily(Font(R.font.outfit_bold))`
- Body & Definitions: `FontFamily(Font(R.font.inter_regular))`
- Bengali Script: `FontFamily(Font(R.font.hind_siliguri_regular), Font(R.font.hind_siliguri_bold, FontWeight.Bold))`

---

# SECTION 5: SUPERMEMO-2 (SM-2) PURE KOTLIN ENGINE

```kotlin
enum class SrsRating(val quality: Int) {
    AGAIN(1), HARD(2), GOOD(3), EASY(4)
}

data class SrsResult(
    val repetitionCount: Int,
    val intervalDays: Int,
    val easinessFactor: Float,
    val nextReviewAt: Long,
    val status: String
)

object SuperMemo2Engine {
    fun calculate(
        previousRepetitions: Int,
        previousIntervalDays: Int,
        previousEasinessFactor: Float,
        rating: SrsRating
    ): SrsResult {
        val quality = rating.quality
        var repetitions = previousRepetitions
        var intervalDays = previousIntervalDays
        var ef = previousEasinessFactor

        if (quality >= 3) {
            when (repetitions) {
                0 -> intervalDays = 1
                1 -> intervalDays = 6
                else -> intervalDays = (intervalDays * ef).roundToInt()
            }
            repetitions += 1
        } else {
            repetitions = 0
            intervalDays = 1
        }

        // Calculate new Easiness Factor (EF)
        ef = ef + (0.1f - (5 - quality) * (0.08f + (5 - quality) * 0.02f))
        if (ef < 1.3f) ef = 1.3f

        val nextReviewAt = System.currentTimeMillis() + (intervalDays * 24L * 60L * 60L * 1000L)
        val status = if (repetitions >= 4) "mastered" else "learning"

        return SrsResult(
            repetitionCount = repetitions,
            intervalDays = intervalDays,
            easinessFactor = ef,
            nextReviewAt = nextReviewAt,
            status = status
        )
    }
}
```

---

# SECTION 6: GOOGLE GEMINI AI TUTOR ENGINE (KOTLIN)

Integration using `com.google.ai.client.generativeai:generativeai`:
```kotlin
class GeminiTutorRepository @Inject constructor() {
    private val generativeModel = GenerativeModel(
        modelName = "gemini-2.5-flash",
        apiKey = BuildConfig.GEMINI_API_KEY,
        systemInstruction = content {
            text("""
                You are WordSmart AI, a friendly, concise bilingual English-Bengali vocabulary tutor.
                PRINCIPLES:
                1. BILINGUAL EXPLANATIONS: Explain in English with natural, clear Bengali translations.
                2. ENGLISH QUIZZES: When quizzing, format all 4 choices (A, B, C, D) in English, ending with [Answer: X].
                3. NO FLUFF: Start immediately with the answer.
                4. DYNAMIC FOLLOW-UP SUGGESTIONS: Conclude EVERY response with:
                   [Suggestions: Suggestion 1 | Suggestion 2 | Suggestion 3]
            """.trimIndent())
        }
    )

    fun streamTutorResponse(prompt: String): Flow<String> {
        return generativeModel.generateContentStream(prompt).map { it.text ?: "" }
    }
}
```

---

# SECTION 7: SCREEN-BY-SCREEN IMPLEMENTATION DIRECTIVES

### 1. `PrepRoadmapScreen.kt` (Dashboard)
- Displays current Prep Stage with XP progress bar and Unit Selector (Units 1–10).
- Visual node graph path: Flashcard Quest -> Vocab Drills -> Contextual Stories -> Qualification MCQs -> Milestone Chest (+100 XP, +50 Coins, Konfetti explosion).
- "Resume Learning" Hero Card displaying the user's next unmastered word.

### 2. `FlashcardQuestScreen.kt` (Flashcards)
- 3D perspective flip card using Compose `graphicsLayer { rotationY = animatedRotation }`.
- Front: Word, Pronunciation, POS pill, TTS Audio speaker button.
- Back: Bengali meaning in Hind Siliguri, Definition, Example sentence with bolded target word, and Mnemonic hint.
- Swipe gestures (horizontal drag) to advance to next/previous word.

### 3. `Sm2ReviewDeckScreen.kt` (Active Recall Engine)
- Queries Room: `SELECT * FROM progress WHERE next_review_at <= :now`.
- If no cards due, shows a celebratory "All Caught Up!" banner.
- 4 rating buttons styled in Material 3: `Again (1)`, `Hard (2)`, `Good (3)`, `Easy (4)`.

### 4. `ContextualStoriesScreen.kt` (Reading Lab)
- Rich paragraph rendering with target vocabulary rendered as clickable `FilterChip` / `AssistChip` tokens.
- Tapping a word chip opens the `WordDetailBentoSheet` with zero scroll disruption.
- 3 comprehension checks at the story end.

### 5. `QualificationMcqsScreen.kt` & `QuizRunnerScreen.kt`
- 4-choice MCQ test with instant feedback (Correct: Green, Wrong: Red).
- SoundPool audio chimes + Haptic feedback on tap.
- Wrong answer dialog explaining why the selected word does not fit and why the correct word is ideal.
- Quiz exit protection dialog.

### 6. `TimeBlitzScreen.kt` (Speed Run)
- 60-second countdown progress bar with animated color transition (Green -> Yellow -> Red).
- Score multiplier meter (1x -> 2x -> 4x for speed streaks).
- Game Over screen with accuracy breakdown, missed words list, and instant review actions.

### 7. `DictionaryPortalScreen.kt` (Search & Etymology)
- Instant search bar filtering by word, English definition, or Bengali script.
- Tab 1: Filterable Word Cards (All, Mastered, Bookmarked, CEFR levels).
- Tab 2: Etymological Root Tree (Greek/Latin roots from `roots` and `word_roots`).

### 8. `WordDetailBentoSheet.kt` (Word Details Bottom Sheet)
- Material 3 `ModalBottomSheet`.
- Bento Grid: Header (Audio + Bookmark), Meaning (English + Bengali), Mnemonic (Lightbulb), Collocations, Synonyms/Antonyms clickable tags, and "Ask WordSmart AI" CTA.

---

# SECTION 8: IMPLEMENTATION SEQUENCE FOR AI STUDIO
1. Generate `build.gradle.kts` (Project & App) and `libs.versions.toml`.
2. Generate `ui/theme/` (Color.kt, Theme.kt, Type.kt with Bengali font support).
3. Generate Room Database entities, DAOs, and database builder from `assets/wordsmart.db`.
4. Generate `SuperMemo2Engine.kt` and `GeminiTutorRepository.kt`.
5. Generate `WordSmartNavHost.kt` with Type-Safe Navigation.
6. Generate all 13 Jetpack Compose screens matching exact web names.
7. Generate `WordDetailBentoSheet.kt` and `WordSmartAiTutorDialog.kt`.
```

---

## 🚀 How to Use This in Google AI Studio

1. Navigate to **[Google AI Studio](https://aistudio.google.com)**.
2. Select **Gemini 1.5 Pro** or **Gemini 2.5 Flash / Pro**.
3. Set **Temperature** to `0.2` (for clean, robust, deterministic Kotlin code).
4. Paste the entire block above into the prompt box.
5. Add the trigger line at the bottom:
   ```text
   Please proceed and generate the complete Kotlin Jetpack Compose Android app step-by-step, starting with build.gradle.kts, Room database entities, and the SuperMemo-2 engine.
   ```
6. Click **Run**!
