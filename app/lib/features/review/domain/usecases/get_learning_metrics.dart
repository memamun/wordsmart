import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/learning_metrics.dart';
import '../repositories/review_repository.dart';

class GetLearningMetricsUseCase {
  final ReviewRepository repository;

  GetLearningMetricsUseCase(this.repository);

  Future<Either<Failure, LearningMetrics>> call({
    required DateTime now,
  }) async {
    return repository.getLearningMetrics(now: now);
  }
}
