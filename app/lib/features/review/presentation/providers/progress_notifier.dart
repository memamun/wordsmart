import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_learning_metrics.dart';
import 'progress_state.dart';

class ProgressNotifier extends StateNotifier<ProgressState> {
  final GetLearningMetricsUseCase getLearningMetricsUseCase;

  ProgressNotifier({required this.getLearningMetricsUseCase})
      : super(const ProgressInitial());

  Future<void> loadMetrics({required DateTime now}) async {
    state = const ProgressLoading();
    final result = await getLearningMetricsUseCase(now: now);
    
    state = result.fold(
      (failure) => ProgressFailure(failure),
      (metrics) => ProgressLoaded(metrics),
    );
  }
}
