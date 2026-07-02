import '../../../../core/error/failures.dart';
import '../../domain/entities/review_queue.dart';

abstract class ReviewQueueState {
  const ReviewQueueState();
}

class ReviewQueueInitial extends ReviewQueueState {
  const ReviewQueueInitial();
}

class ReviewQueueLoading extends ReviewQueueState {
  const ReviewQueueLoading();
}

class ReviewQueueLoaded extends ReviewQueueState {
  final ReviewQueue queue;
  const ReviewQueueLoaded(this.queue);
}

class ReviewQueueFailure extends ReviewQueueState {
  final Failure failure;
  const ReviewQueueFailure(this.failure);
}
