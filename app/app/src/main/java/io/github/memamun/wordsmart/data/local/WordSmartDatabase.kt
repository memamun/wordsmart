package io.github.memamun.wordsmart.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
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
import io.github.memamun.wordsmart.data.local.entity.WordAntonymEntity
import io.github.memamun.wordsmart.data.local.entity.WordCollocationEntity
import io.github.memamun.wordsmart.data.local.entity.WordEntity
import io.github.memamun.wordsmart.data.local.entity.WordExampleEntity
import io.github.memamun.wordsmart.data.local.entity.WordRootCrossRef
import io.github.memamun.wordsmart.data.local.entity.WordSynonymEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        WordEntity::class,
        WordExampleEntity::class,
        WordSynonymEntity::class,
        WordAntonymEntity::class,
        WordCollocationEntity::class,
        RootEntity::class,
        WordRootCrossRef::class,
        UserProgressEntity::class,
        BookmarkEntity::class,
        McqQuizEntity::class,
        ContextualStoryEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class WordSmartDatabase : RoomDatabase() {
    abstract fun wordDao(): WordDao
    abstract fun progressDao(): ProgressDao
    abstract fun mcqQuizDao(): McqQuizDao
    abstract fun contextualStoryDao(): ContextualStoryDao
    abstract fun rootDao(): RootDao

    companion object {
        @Volatile
        private var INSTANCE: WordSmartDatabase? = null

        fun getInstance(context: Context): WordSmartDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    WordSmartDatabase::class.java,
                    "wordsmart.db"
                )
                    .createFromAsset("wordsmart.db")
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

