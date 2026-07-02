import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/review_queue.dart';
import '../repositories/review_repository.dart';

class GetDailyQueueUseCase {
  final ReviewRepository repository;

  GetDailyQueueUseCase(this.repository);

  Future<Either<Failure, ReviewQueue>> call({
    required int limit,
    required DateTime now,
  }) async {
    return repository.getDailyQueue(limit: limit, now: now);
  }
}
