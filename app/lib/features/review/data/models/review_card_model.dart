class LearningCardModel {
  final int wordId;
  final String word;
  final String? definition;
  final String? bengaliMeaning;
  final String? pronunciation;
  final String? partOfSpeech;
  final String? level;
  final String? audioPath;
  final String? mnemonic;

  final int? isRead;
  final int? isReviewed;
  final int? reviewCount;
  final int? correctCount;
  final int? incorrectCount;
  final int? masteryScore;
  final String? status;
  final String? lastReviewedAt;
  final String? nextReviewAt;
  final double? easeFactor;
  final int? intervalDays;
  final int? repetitions;
  final String? learningState;

  const LearningCardModel({
    required this.wordId,
    required this.word,
    this.definition,
    this.bengaliMeaning,
    this.pronunciation,
    this.partOfSpeech,
    this.level,
    this.audioPath,
    this.mnemonic,
    this.isRead,
    this.isReviewed,
    this.reviewCount,
    this.correctCount,
    this.incorrectCount,
    this.masteryScore,
    this.status,
    this.lastReviewedAt,
    this.nextReviewAt,
    this.easeFactor,
    this.intervalDays,
    this.repetitions,
    this.learningState,
  });

  factory LearningCardModel.fromMap(Map<String, dynamic> map) {
    return LearningCardModel(
      wordId: map['word_id'] as int,
      word: map['word'] as String,
      definition: map['definition'] as String?,
      bengaliMeaning: map['bengali_meaning'] as String?,
      pronunciation: map['pronunciation'] as String?,
      partOfSpeech: map['part_of_speech'] as String?,
      level: map['level'] as String?,
      audioPath: map['audio_path'] as String?,
      mnemonic: map['mnemonic'] as String?,
      isRead: map['is_read'] as int?,
      isReviewed: map['is_reviewed'] as int?,
      reviewCount: map['review_count'] as int?,
      correctCount: map['correct_count'] as int?,
      incorrectCount: map['incorrect_count'] as int?,
      masteryScore: map['mastery_score'] as int?,
      status: map['status'] as String?,
      lastReviewedAt: map['last_reviewed_at'] as String?,
      nextReviewAt: map['next_review_at'] as String?,
      easeFactor: (map['ease_factor'] as num?)?.toDouble(),
      intervalDays: map['interval_days'] as int?,
      repetitions: map['repetitions'] as int?,
      learningState: map['learning_state'] as String?,
    );
  }
}
