package io.github.memamun.wordsmart.domain.model

data class PrepStage(
    val stageNumber: Int,
    val title: String,
    val requiredXp: Int,
    val description: String,
    val unitCount: Int = 5
) {
    companion object {
        val ALL_STAGES = listOf(
            PrepStage(1, "Beginner Foundations I", 0, "Essential vocabulary for core communication and everyday comprehension."),
            PrepStage(2, "Beginner Foundations II", 500, "High-frequency terms, descriptive nuances, and basic collegiate roots."),
            PrepStage(3, "Beginner & Intermediate Bridge", 1200, "Transition to formal academic reading, common idioms, and collocations."),
            PrepStage(4, "Intermediate Core I", 2200, "Standard collegiate lexicon, persuasive rhetorical devices, and prefixes."),
            PrepStage(5, "Intermediate Core II", 3500, "Rigorous vocabulary found in competitive standardized entrance exams."),
            PrepStage(6, "Intermediate & Advanced Bridge", 5000, "Bridge towards high-complexity critical analysis and GRE/SAT verbal sections."),
            PrepStage(7, "Advanced Mastery I", 7000, "Sophisticated vocabulary, academic prose analysis, and Greek/Latin roots."),
            PrepStage(8, "Advanced Mastery II", 9500, "High-yield GRE Hit Parade, philosophical discourse, and arcane nuances."),
            PrepStage(9, "Advanced Mastery III", 12500, "Elite verbal mastery, erudite literature reading, and dual-blank mastery."),
            PrepStage(10, "Advanced Mastery IV", 16000, "Virtuoso level vocabulary, maximum verbal benchmark, and scholarly eloquence.")
        )

        fun getStageForXp(xp: Int): PrepStage {
            return ALL_STAGES.lastOrNull { xp >= it.requiredXp } ?: ALL_STAGES.first()
        }

        fun getNextStage(currentStageNumber: Int): PrepStage? {
            return ALL_STAGES.firstOrNull { it.stageNumber == currentStageNumber + 1 }
        }
    }
}
