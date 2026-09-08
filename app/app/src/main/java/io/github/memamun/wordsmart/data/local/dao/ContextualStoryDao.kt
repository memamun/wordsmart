package io.github.memamun.wordsmart.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import io.github.memamun.wordsmart.data.local.entity.ContextualStoryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ContextualStoryDao {
    @Query("SELECT * FROM contextual_stories WHERE quiz_id = :quizId ORDER BY id ASC")
    fun getStoriesByQuizId(quizId: Int): Flow<List<ContextualStoryEntity>>

    @Query("SELECT * FROM contextual_stories ORDER BY id ASC")
    fun getAllStories(): Flow<List<ContextualStoryEntity>>

    @Query("SELECT * FROM contextual_stories WHERE id = :id LIMIT 1")
    suspend fun getStoryById(id: Int): ContextualStoryEntity?

    @Query("SELECT COUNT(*) FROM contextual_stories")
    fun getStoryCount(): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStories(stories: List<ContextualStoryEntity>)
}
