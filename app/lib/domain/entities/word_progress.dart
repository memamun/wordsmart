import '../exceptions/exceptions.dart';

class WordProgress {
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

  const WordProgress._({
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

  factory WordProgress({
    required int wordId,
    required bool isRead,
    required bool isReviewed,
    required int reviewCount,
    required int correctCount,
    required int incorrectCount,
    required int masteryScore,
    required String status,
    DateTime? lastReviewedAt,
    DateTime? nextReviewAt,
  }) {
    if (wordId <= 0) {
      throw InvalidWordException(
        'WordProgress wordId must be greater than zero. Received: $wordId',
      );
    }
    if (reviewCount < 0) {
      throw InvalidWordException(
        'WordProgress reviewCount cannot be negative. Received: $reviewCount',
      );
    }
    if (correctCount < 0) {
      throw InvalidWordException(
        'WordProgress correctCount cannot be negative. Received: $correctCount',
      );
    }
    if (incorrectCount < 0) {
      throw InvalidWordException(
        'WordProgress incorrectCount cannot be negative. Received: $incorrectCount',
      );
    }
    if (masteryScore < 0 || masteryScore > 100) {
      throw InvalidWordException(
        'WordProgress masteryScore must be between 0 and 100. Received: $masteryScore',
      );
    }
    if (status.trim().isEmpty) {
      throw InvalidWordException(
        'WordProgress status cannot be empty.',
      );
    }
    return WordProgress._(
      wordId: wordId,
      isRead: isRead,
      isReviewed: isReviewed,
      reviewCount: reviewCount,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      masteryScore: masteryScore,
      status: status,
      lastReviewedAt: lastReviewedAt,
      nextReviewAt: nextReviewAt,
    );
  }
}
