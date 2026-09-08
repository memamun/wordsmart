package io.github.memamun.wordsmart.data.local.entity

import androidx.room.Embedded
import androidx.room.Junction
import androidx.room.Relation

data class WordWithDetails(
    @Embedded val word: WordEntity,

    @Relation(
        parentColumn = "id",
        entityColumn = "word_id"
    )
    val examples: List<WordExampleEntity> = emptyList(),

    @Relation(
        parentColumn = "id",
        entityColumn = "word_id"
    )
    val synonyms: List<WordSynonymEntity> = emptyList(),

    @Relation(
        parentColumn = "id",
        entityColumn = "word_id"
    )
    val antonyms: List<WordAntonymEntity> = emptyList(),

    @Relation(
        parentColumn = "id",
        entityColumn = "word_id"
    )
    val collocations: List<WordCollocationEntity> = emptyList(),

    @Relation(
        parentColumn = "id",
        entityColumn = "id",
        associateBy = Junction(
            value = WordRootCrossRef::class,
            parentColumn = "word_id",
            entityColumn = "root_id"
        )
    )
    val roots: List<RootEntity> = emptyList()
)
