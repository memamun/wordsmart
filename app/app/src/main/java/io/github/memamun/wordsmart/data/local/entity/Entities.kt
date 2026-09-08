package io.github.memamun.wordsmart.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "words")
data class WordEntity(
    @PrimaryKey val id: Int,
    @ColumnInfo(name = "word") val word: String,
    @ColumnInfo(name = "pronunciation") val pronunciation: String? = null,
    @ColumnInfo(name = "part_of_speech") val partOfSpeech: String? = null, // "v", "n", "adj", "adv"
    @ColumnInfo(name = "definition") val definition: String = "",
    @ColumnInfo(name = "bengali_meaning") val bengaliMeaning: String = "",
    @ColumnInfo(name = "mnemonic") val mnemonic: String? = null,
    @ColumnInfo(name = "level") val level: String? = null,                 // "beginner", "intermediate", "advanced"
    @ColumnInfo(name = "audio") val audio: String? = null,
    @ColumnInfo(name = "quick_quiz_id") val quickQuizId: Int? = null,
    @ColumnInfo(name = "stage") val stage: Int = 1,
    @ColumnInfo(name = "unit") val unit: Int = 1,
    @ColumnInfo(name = "category") val category: String = "general" // "general", "business", "legal", "medical", "literature", "philosophy", "hitparade"
)

@Entity(
    tableName = "word_examples",
    foreignKeys = [
        ForeignKey(
            entity = WordEntity::class,
            parentColumns = ["id"],
            childColumns = ["word_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
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
    foreignKeys = [
        ForeignKey(
            entity = WordEntity::class,
            parentColumns = ["id"],
            childColumns = ["word_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("word_id")]
)
data class WordSynonymEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "synonym") val synonym: String
)

@Entity(
    tableName = "word_antonyms",
    foreignKeys = [
        ForeignKey(
            entity = WordEntity::class,
            parentColumns = ["id"],
            childColumns = ["word_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("word_id")]
)
data class WordAntonymEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "antonym") val antonym: String
)

@Entity(
    tableName = "word_collocations",
    foreignKeys = [
        ForeignKey(
            entity = WordEntity::class,
            parentColumns = ["id"],
            childColumns = ["word_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("word_id")]
)
data class WordCollocationEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "collocation") val collocation: String
)

@Entity(tableName = "roots")
data class RootEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "root") val root: String,
    @ColumnInfo(name = "meaning") val meaning: String,
    @ColumnInfo(name = "origin") val origin: String = "Greek / Latin"
)

@Entity(
    tableName = "word_roots",
    primaryKeys = ["word_id", "root_id"],
    foreignKeys = [
        ForeignKey(
            entity = WordEntity::class,
            parentColumns = ["id"],
            childColumns = ["word_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = RootEntity::class,
            parentColumns = ["id"],
            childColumns = ["root_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("word_id"), Index("root_id")]
)
data class WordRootCrossRef(
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "root_id") val rootId: Int
)

@Entity(
    tableName = "progress",
    primaryKeys = ["user_id", "word_id"],
    foreignKeys = [
        ForeignKey(
            entity = WordEntity::class,
            parentColumns = ["id"],
            childColumns = ["word_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
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
    foreignKeys = [
        ForeignKey(
            entity = WordEntity::class,
            parentColumns = ["id"],
            childColumns = ["word_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("word_id")]
)
data class BookmarkEntity(
    @ColumnInfo(name = "user_id") val userId: String = "local_user",
    @ColumnInfo(name = "word_id") val wordId: Int,
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "mcq_quizzes")
data class McqQuizEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "unit") val unit: Int,
    @ColumnInfo(name = "word_id") val wordId: Int? = null,
    @ColumnInfo(name = "question") val question: String,
    @ColumnInfo(name = "option_a") val optionA: String,
    @ColumnInfo(name = "option_b") val optionB: String,
    @ColumnInfo(name = "option_c") val optionC: String,
    @ColumnInfo(name = "option_d") val optionD: String,
    @ColumnInfo(name = "correct_answer") val correctAnswer: String, // "A", "B", "C", "D"
    @ColumnInfo(name = "explanation") val explanation: String
)

@Entity(tableName = "contextual_stories")
data class ContextualStoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "quiz_id") val quizId: Int,
    @ColumnInfo(name = "title") val title: String,
    @ColumnInfo(name = "passage") val passage: String,
    @ColumnInfo(name = "bengali_summary") val bengaliSummary: String? = null,
    @ColumnInfo(name = "target_words") val targetWords: String = ""
)

