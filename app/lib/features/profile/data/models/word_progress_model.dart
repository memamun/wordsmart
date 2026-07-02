class WordProgressModel {
  final int wordId;
  final bool isRead;
  final bool isReviewed;
  final int reviewCount;
  final int correctCount;
  final int incorrectCount;
  final int masteryScore;
  final String status;
  final DateTime? lastReviewedAt;
  final DateTime? nextReviewAt;

  const WordProgressModel({
    required this.wordId,
    required this.isRead,
    required this.isReviewed,
    required this.reviewCount,
    required this.correctCount,
    required this.incorrectCount,
    required this.masteryScore,
    required this.status,
    this.lastReviewedAt,
    this.nextReviewAt,
  });

  /// Factory constructor to hydrate from SQLite row map.
  /// Handles SQLite's integer representation of booleans (0/1).
  factory WordProgressModel.fromDatabase(Map<String, dynamic> map) {
    return WordProgressModel(
      wordId: map['word_id'] as int,
      isRead: (map['is_read'] as int? ?? 0) == 1,
      isReviewed: (map['is_reviewed'] as int? ?? 0) == 1,
      reviewCount: map['review_count'] as int? ?? 0,
      correctCount: map['correct_count'] as int? ?? 0,
      incorrectCount: map['incorrect_count'] as int? ?? 0,
      masteryScore: map['mastery_score'] as int? ?? 0,
      status: map['status'] as String? ?? 'unlearned',
      lastReviewedAt: map['last_reviewed_at'] != null
          ? DateTime.tryParse(map['last_reviewed_at'] as String)
          : null,
      nextReviewAt: map['next_review_at'] != null
          ? DateTime.tryParse(map['next_review_at'] as String)
          : null,
    );
  }

  /// Converts the model back to SQLite format map.
  Map<String, dynamic> toDatabaseMap() {
    return {
      'word_id': wordId,
      'is_read': isRead ? 1 : 0,
      'is_reviewed': isReviewed ? 1 : 0,
      'review_count': reviewCount,
      'correct_count': correctCount,
      'incorrect_count': incorrectCount,
      'mastery_score': masteryScore,
      'status': status,
      'last_reviewed_at': lastReviewedAt?.toIso8601String(),
      'next_review_at': nextReviewAt?.toIso8601String(),
    };
  }
}
