import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_daily_queue.dart';
import 'review_queue_state.dart';

class ReviewQueueNotifier extends StateNotifier<ReviewQueueState> {
  final GetDailyQueueUseCase getDailyQueueUseCase;

  ReviewQueueNotifier({required this.getDailyQueueUseCase})
      : super(const ReviewQueueInitial());

  Future<void> loadQueue({required int limit, required DateTime now}) async {
    state = const ReviewQueueLoading();
    final result = await getDailyQueueUseCase(limit: limit, now: now);

    state = result.fold(
      (failure) => ReviewQueueFailure(failure),
      (queue) => ReviewQueueLoaded(queue),
    );
  }
}
