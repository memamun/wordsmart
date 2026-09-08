package io.github.memamun.wordsmart.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import io.github.memamun.wordsmart.data.local.entity.RootEntity
import io.github.memamun.wordsmart.data.local.entity.WordEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RootDao {
    @Query("SELECT * FROM roots ORDER BY root ASC")
    fun getAllRoots(): Flow<List<RootEntity>>

    @Query("SELECT * FROM roots WHERE id = :rootId LIMIT 1")
    suspend fun getRootById(rootId: Int): RootEntity?

    @Transaction
    @Query("""
        SELECT words.* FROM words 
        INNER JOIN word_roots ON words.id = word_roots.word_id 
        WHERE word_roots.root_id = :rootId
        ORDER BY words.word ASC
    """)
    fun getWordsForRoot(rootId: Int): Flow<List<WordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRoots(roots: List<RootEntity>)
}
