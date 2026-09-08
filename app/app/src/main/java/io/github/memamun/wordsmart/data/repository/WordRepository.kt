package io.github.memamun.wordsmart.data.repository

import io.github.memamun.wordsmart.data.local.dao.ContextualStoryDao
import io.github.memamun.wordsmart.data.local.dao.McqQuizDao
import io.github.memamun.wordsmart.data.local.dao.ProgressDao
import io.github.memamun.wordsmart.data.local.dao.RootDao
import io.github.memamun.wordsmart.data.local.dao.WordDao
import io.github.memamun.wordsmart.data.local.entity.BookmarkEntity
import io.github.memamun.wordsmart.data.local.entity.ContextualStoryEntity
import io.github.memamun.wordsmart.data.local.entity.McqQuizEntity
import io.github.memamun.wordsmart.data.local.entity.RootEntity
import io.github.memamun.wordsmart.data.local.entity.UserProgressEntity
import io.github.memamun.wordsmart.data.local.entity.WordEntity
import io.github.memamun.wordsmart.data.local.entity.WordWithDetails
import io.github.memamun.wordsmart.domain.srs.SrsRating
import io.github.memamun.wordsmart.domain.srs.SuperMemo2Engine
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

class WordRepository(
    private val wordDao: WordDao,
    private val progressDao: ProgressDao,
    private val mcqQuizDao: McqQuizDao? = null,
    private val contextualStoryDao: ContextualStoryDao? = null,
    private val rootDao: RootDao? = null
) {
    fun getAllWords(): Flow<List<WordEntity>> = wordDao.getAllWords()

    suspend fun getWordById(id: Int): WordEntity? = wordDao.getWordById(id)

    suspend fun getWordByName(word: String): WordEntity? = wordDao.getWordByName(word)

    fun getWordWithDetails(id: Int): Flow<WordWithDetails?> = wordDao.getWordWithDetails(id)

    fun getWordsByStage(stage: Int): Flow<List<WordEntity>> = wordDao.getWordsByStage(stage)

    fun getWordsByUnit(unitId: Int): Flow<List<WordEntity>> = wordDao.getWordsByUnit(unitId)

    fun getWordsByLevel(level: String): Flow<List<WordEntity>> = wordDao.getWordsByLevel(level)

    fun getTotalWordCount(): Flow<Int> = wordDao.getTotalWordCount()

    fun getWordsByStageAndUnit(stage: Int, unit: Int): Flow<List<WordEntity>> =
        wordDao.getWordsByStageAndUnit(stage, unit)

    fun getWordsByCategory(category: String): Flow<List<WordEntity>> =
        wordDao.getWordsByCategory(category)

    fun searchWords(query: String): Flow<List<WordEntity>> = wordDao.searchWords(query)

    fun searchWordsFiltered(query: String, unitId: Int? = null, level: String? = null): Flow<List<WordEntity>> =
        wordDao.searchWordsFiltered(query, unitId, level)

    fun getAllRoots(): Flow<List<RootEntity>> = rootDao?.getAllRoots() ?: wordDao.getAllRoots()

    fun getWordsForRoot(rootId: Int): Flow<List<WordEntity>> =
        rootDao?.getWordsForRoot(rootId) ?: wordDao.getWordsForRoot(rootId)

    // MCQ Quizzes & Stories
    fun getQuestionsByUnit(unitId: Int): Flow<List<McqQuizEntity>> =
        mcqQuizDao?.getQuestionsByUnit(unitId) ?: emptyFlow()

    fun getAllQuizzes(): Flow<List<McqQuizEntity>> =
        mcqQuizDao?.getAllQuizzes() ?: emptyFlow()

    fun getStoriesByQuizId(quizId: Int): Flow<List<ContextualStoryEntity>> =
        contextualStoryDao?.getStoriesByQuizId(quizId) ?: emptyFlow()

    fun getAllStories(): Flow<List<ContextualStoryEntity>> =
        contextualStoryDao?.getAllStories() ?: emptyFlow()

    suspend fun getStoryById(id: Int): ContextualStoryEntity? =
        contextualStoryDao?.getStoryById(id)


    // Spaced repetition
    fun getDueCards(now: Long = System.currentTimeMillis()): Flow<List<UserProgressEntity>> =
        progressDao.getDueCards(now)

    fun getAllProgress(): Flow<List<UserProgressEntity>> = progressDao.getAllProgress()

    fun observeProgressForWord(wordId: Int): Flow<UserProgressEntity?> =
        progressDao.observeProgressForWord(wordId)

    suspend fun recordSrsReview(wordId: Int, rating: SrsRating) {
        val currentProgress = progressDao.getProgressForWord(wordId)
        val repetitions = currentProgress?.repetitionCount ?: 0
        val interval = currentProgress?.intervalDays ?: 1
        val ef = currentProgress?.easinessFactor ?: 2.5f

        val result = SuperMemo2Engine.calculate(
            previousRepetitions = repetitions,
            previousIntervalDays = interval,
            previousEasinessFactor = ef,
            rating = rating
        )

        val updatedEntity = UserProgressEntity(
            userId = "local_user",
            wordId = wordId,
            status = result.status,
            easinessFactor = result.easinessFactor,
            repetitionCount = result.repetitionCount,
            intervalDays = result.intervalDays,
            lastReviewedAt = System.currentTimeMillis(),
            nextReviewAt = result.nextReviewAt,
            masteryScore = result.masteryScore
        )

        progressDao.insertOrUpdate(updatedEntity)
    }

    // Bookmarks
    fun getBookmarkedWordIds(): Flow<List<Int>> = progressDao.getBookmarkedWordIds()

    fun isBookmarked(wordId: Int): Flow<Boolean> = progressDao.isBookmarked(wordId)

    suspend fun toggleBookmark(wordId: Int, currentlyBookmarked: Boolean) {
        if (currentlyBookmarked) {
            progressDao.removeBookmark(wordId)
        } else {
            progressDao.addBookmark(BookmarkEntity(wordId = wordId))
        }
    }

    suspend fun clearAllUserProgress() {
        progressDao.clearAllProgress()
    }
}
