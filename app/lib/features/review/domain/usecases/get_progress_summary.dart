import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/review_repository.dart';

class ProgressSummary {
  final int dueToday;
  final int mastered;
  final int learning;
  final int streakDays;

  const ProgressSummary({
    required this.dueToday,
    required this.mastered,
    required this.learning,
    required this.streakDays,
  });
}

class GetProgressSummaryUseCase {
  final ReviewRepository repository;

  GetProgressSummaryUseCase(this.repository);

  Future<Either<Failure, ProgressSummary>> call({
    required DateTime now,
  }) async {
    final metricsResult = await repository.getLearningMetrics(now: now);

    return metricsResult.map((metrics) => ProgressSummary(
          dueToday: metrics.dueToday,
          mastered: metrics.masteredWords,
          learning: metrics.learningWords,
          streakDays: metrics.streak.current,
        ));
  }
}
