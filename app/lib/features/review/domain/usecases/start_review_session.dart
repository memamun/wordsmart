import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/review_session.dart';
import '../repositories/review_repository.dart';

class StartReviewSessionUseCase {
  final ReviewRepository repository;

  StartReviewSessionUseCase(this.repository);

  Future<Either<Failure, ReviewSession>> call({
    required String sessionId,
    required int limit,
    required DateTime now,
  }) async {
    final queueResult = await repository.getDailyQueue(limit: limit, now: now);
    
    return queueResult.map((queue) => ReviewSession(
      id: sessionId,
      queue: queue,
      startedAt: now,
    ));
  }
}
