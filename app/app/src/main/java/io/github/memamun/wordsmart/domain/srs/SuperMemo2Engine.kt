package io.github.memamun.wordsmart.domain.srs

import kotlin.math.roundToInt

enum class SrsRating(val quality: Int, val label: String) {
    AGAIN(1, "Again"),
    HARD(2, "Hard"),
    GOOD(3, "Good"),
    EASY(4, "Easy")
}

data class SrsResult(
    val repetitionCount: Int,
    val intervalDays: Int,
    val easinessFactor: Float,
    val nextReviewAt: Long,
    val status: String,
    val masteryScore: Int
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
                else -> intervalDays = (intervalDays * ef).roundToInt().coerceAtLeast(1)
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
        val masteryScore = (repetitions * 25).coerceIn(0, 100)

        return SrsResult(
            repetitionCount = repetitions,
            intervalDays = intervalDays,
            easinessFactor = ef,
            nextReviewAt = nextReviewAt,
            status = status,
            masteryScore = masteryScore
        )
    }
}
