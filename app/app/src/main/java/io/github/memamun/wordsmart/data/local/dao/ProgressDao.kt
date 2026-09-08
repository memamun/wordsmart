package io.github.memamun.wordsmart.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import io.github.memamun.wordsmart.data.local.entity.BookmarkEntity
import io.github.memamun.wordsmart.data.local.entity.UserProgressEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ProgressDao {
    @Query("SELECT * FROM progress WHERE user_id = :userId AND next_review_at <= :now ORDER BY next_review_at ASC")
    fun getDueCards(now: Long, userId: String = "local_user"): Flow<List<UserProgressEntity>>

    @Query("SELECT * FROM progress WHERE user_id = :userId")
    fun getAllProgress(userId: String = "local_user"): Flow<List<UserProgressEntity>>

    @Query("SELECT * FROM progress WHERE word_id = :wordId AND user_id = :userId LIMIT 1")
    suspend fun getProgressForWord(wordId: Int, userId: String = "local_user"): UserProgressEntity?

    @Query("SELECT * FROM progress WHERE word_id = :wordId AND user_id = :userId LIMIT 1")
    fun observeProgressForWord(wordId: Int, userId: String = "local_user"): Flow<UserProgressEntity?>

    @Query("SELECT COUNT(*) FROM progress WHERE user_id = :userId AND status = 'mastered'")
    fun getMasteredCount(userId: String = "local_user"): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(progress: UserProgressEntity)

    @Query("DELETE FROM progress WHERE user_id = :userId")
    suspend fun clearAllProgress(userId: String = "local_user")

    // Bookmarks
    @Query("SELECT word_id FROM bookmarks WHERE user_id = :userId")
    fun getBookmarkedWordIds(userId: String = "local_user"): Flow<List<Int>>

    @Query("SELECT EXISTS(SELECT 1 FROM bookmarks WHERE word_id = :wordId AND user_id = :userId)")
    fun isBookmarked(wordId: Int, userId: String = "local_user"): Flow<Boolean>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addBookmark(bookmark: BookmarkEntity)

    @Query("DELETE FROM bookmarks WHERE word_id = :wordId AND user_id = :userId")
    suspend fun removeBookmark(wordId: Int, userId: String = "local_user")
}
