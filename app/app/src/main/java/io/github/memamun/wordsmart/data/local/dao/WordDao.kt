package io.github.memamun.wordsmart.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import io.github.memamun.wordsmart.data.local.entity.RootEntity
import io.github.memamun.wordsmart.data.local.entity.WordAntonymEntity
import io.github.memamun.wordsmart.data.local.entity.WordCollocationEntity
import io.github.memamun.wordsmart.data.local.entity.WordEntity
import io.github.memamun.wordsmart.data.local.entity.WordExampleEntity
import io.github.memamun.wordsmart.data.local.entity.WordRootCrossRef
import io.github.memamun.wordsmart.data.local.entity.WordSynonymEntity
import io.github.memamun.wordsmart.data.local.entity.WordWithDetails
import kotlinx.coroutines.flow.Flow

@Dao
interface WordDao {
    @Query("SELECT * FROM words ORDER BY id ASC")
    fun getAllWords(): Flow<List<WordEntity>>

    @Query("SELECT * FROM words WHERE id = :id LIMIT 1")
    suspend fun getWordById(id: Int): WordEntity?

    @Transaction
    @Query("SELECT * FROM words WHERE id = :id LIMIT 1")
    fun getWordWithDetails(id: Int): Flow<WordWithDetails?>

    @Query("SELECT * FROM words WHERE stage = :stage ORDER BY unit ASC, id ASC")
    fun getWordsByStage(stage: Int): Flow<List<WordEntity>>

    @Query("SELECT * FROM words WHERE unit = :unitId ORDER BY id ASC")
    fun getWordsByUnit(unitId: Int): Flow<List<WordEntity>>

    @Query("SELECT * FROM words WHERE level = :level ORDER BY id ASC")
    fun getWordsByLevel(level: String): Flow<List<WordEntity>>

    @Query("SELECT COUNT(*) FROM words")
    fun getTotalWordCount(): Flow<Int>

    @Query("SELECT * FROM words WHERE stage = :stage AND unit = :unit ORDER BY id ASC")
    fun getWordsByStageAndUnit(stage: Int, unit: Int): Flow<List<WordEntity>>

    @Query("SELECT * FROM words WHERE category = :category ORDER BY id ASC")
    fun getWordsByCategory(category: String): Flow<List<WordEntity>>

    @Query("SELECT * FROM words WHERE word LIKE '%' || :query || '%' OR definition LIKE '%' || :query || '%' OR bengali_meaning LIKE '%' || :query || '%'")
    fun searchWords(query: String): Flow<List<WordEntity>>

    @Query("""
        SELECT * FROM words 
        WHERE (:unitId IS NULL OR unit = :unitId)
          AND (:level IS NULL OR level = :level)
          AND (:query = '' OR word LIKE '%' || :query || '%' OR definition LIKE '%' || :query || '%' OR bengali_meaning LIKE '%' || :query || '%')
        ORDER BY id ASC
    """)
    fun searchWordsFiltered(query: String, unitId: Int?, level: String?): Flow<List<WordEntity>>


    @Query("SELECT * FROM words WHERE LOWER(word) = LOWER(:word) LIMIT 1")
    suspend fun getWordByName(word: String): WordEntity?

    @Query("SELECT * FROM roots ORDER BY root ASC")
    fun getAllRoots(): Flow<List<RootEntity>>

    @Transaction
    @Query("""
        SELECT words.* FROM words 
        INNER JOIN word_roots ON words.id = word_roots.word_id 
        WHERE word_roots.root_id = :rootId
    """)
    fun getWordsForRoot(rootId: Int): Flow<List<WordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWords(words: List<WordEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExamples(examples: List<WordExampleEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSynonyms(synonyms: List<WordSynonymEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAntonyms(antonyms: List<WordAntonymEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCollocations(collocations: List<WordCollocationEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRoots(roots: List<RootEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWordRoots(crossRefs: List<WordRootCrossRef>)
}
