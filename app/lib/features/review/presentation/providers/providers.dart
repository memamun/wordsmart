import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/injection.dart';
import 'review_queue_notifier.dart';
import 'review_queue_state.dart';
import 'review_session_notifier.dart';
import 'review_session_state.dart';
import 'progress_notifier.dart';
import 'progress_state.dart';

export 'progress_notifier.dart';
export 'review_session_notifier.dart';

final reviewQueueProvider =
    StateNotifierProvider.autoDispose<ReviewQueueNotifier, ReviewQueueState>(
        (ref) {
  return ReviewQueueNotifier(
    getDailyQueueUseCase: sl(),
  );
});

final reviewSessionProvider = StateNotifierProvider.autoDispose<
    ReviewSessionNotifier, ReviewSessionState>((ref) {
  return ReviewSessionNotifier(
    startReviewSessionUseCase: sl(),
    submitLearningResultUseCase: sl(),
    finishReviewSessionUseCase: sl(),
  );
});

final progressProvider =
    StateNotifierProvider.autoDispose<ProgressNotifier, ProgressState>((ref) {
  return ProgressNotifier(
    getLearningMetricsUseCase: sl(),
  );
});
