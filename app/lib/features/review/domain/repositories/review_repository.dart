import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/learning/repositories/learning_repository.dart';
import '../entities/review_queue.dart';
import '../entities/learning_metrics.dart';
import '../entities/study_session.dart';

abstract class ReviewRepository implements LearningRepository {
  Future<Either<Failure, ReviewQueue>> getDailyQueue({
    required int limit,
    required DateTime now,
  });

  Future<Either<Failure, LearningMetrics>> getLearningMetrics({
    required DateTime now,
  });

  Future<Either<Failure, void>> logStudySession(StudySession session);
}
