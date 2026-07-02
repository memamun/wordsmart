import 'package:dartz/dartz.dart';
import '../../error/failures.dart';

abstract class LearningRepository {
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
}
