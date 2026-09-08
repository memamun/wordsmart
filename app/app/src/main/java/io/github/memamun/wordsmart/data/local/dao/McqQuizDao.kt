package io.github.memamun.wordsmart.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import io.github.memamun.wordsmart.data.local.entity.McqQuizEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface McqQuizDao {
    @Query("SELECT * FROM mcq_quizzes WHERE unit = :unitId ORDER BY id ASC")
    fun getQuestionsByUnit(unitId: Int): Flow<List<McqQuizEntity>>

    @Query("SELECT * FROM mcq_quizzes ORDER BY id ASC")
    fun getAllQuizzes(): Flow<List<McqQuizEntity>>

    @Query("SELECT COUNT(*) FROM mcq_quizzes")
    fun getQuizCount(): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuizzes(quizzes: List<McqQuizEntity>)
}
