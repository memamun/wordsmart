import '../../domain/entities/learning_status.dart';
import '../../domain/entities/word_progress.dart';
import '../models/word_progress_model.dart';

extension WordProgressModelMapper on WordProgressModel {
  /// Maps storage progress model to Domain Entity.
  WordProgress toEntity() {
    return WordProgress(
      wordId: wordId,
      isRead: isRead,
      isReviewed: isReviewed,
      reviewCount: reviewCount,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      masteryScore: masteryScore,
      status: LearningStatus.fromString(status),
      lastReviewedAt: lastReviewedAt,
      nextReviewAt: nextReviewAt,
    );
  }
}

extension WordProgressMapper on WordProgress {
  /// Maps domain progress entity back to storage model representation.
  WordProgressModel toModel() {
    return WordProgressModel(
      wordId: wordId,
      isRead: isRead,
      isReviewed: isReviewed,
      reviewCount: reviewCount,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      masteryScore: masteryScore,
      status: status.toDbString(),
      lastReviewedAt: lastReviewedAt,
      nextReviewAt: nextReviewAt,
    );
  }
}
