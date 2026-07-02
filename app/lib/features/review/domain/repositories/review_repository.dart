import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/review_queue.dart';
import '../entities/learning_metrics.dart';
import '../entities/study_session.dart';

abstract class ReviewRepository {
  Future<Either<Failure, ReviewQueue>> getDailyQueue({
    required int limit,
    required DateTime now,
  });

  Future<Either<Failure, void>> saveReviewResult({
    required int wordId,
    required int score,
    required int durationMs,
    required double easinessFactor,
    required int intervalDays,
    required int repetitionCount,
    required String learningState,
    required int masteryScore,
    required DateTime now,
    required String sessionId,
    required String sessionMode,
  });

  Future<Either<Failure, LearningMetrics>> getLearningMetrics({
    required DateTime now,
  });

  Future<Either<Failure, void>> logStudySession(StudySession session);
}
