import '../models/review_card_model.dart';
import '../models/study_session_model.dart';

abstract class ReviewLocalDataSource {
  Future<List<ReviewCardModel>> getAllCardsWithProgress();
  
  Future<void> saveReviewProgress({
    required int wordId,
    required double easeFactor,
    required int intervalDays,
    required int repetitionCount,
    required String learningState,
    required int masteryScore,
    required String nextReviewAt,
    required String lastReviewedAt,
    required StudySessionModel session,
  });

  Future<List<StudySessionModel>> getStudySessions();
}
