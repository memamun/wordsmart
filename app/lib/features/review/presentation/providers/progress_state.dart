import '../../../../core/error/failures.dart';
import '../../domain/entities/learning_metrics.dart';

abstract class ProgressState {
  const ProgressState();
}

class ProgressInitial extends ProgressState {
  const ProgressInitial();
}

class ProgressLoading extends ProgressState {
  const ProgressLoading();
}

class ProgressLoaded extends ProgressState {
  final LearningMetrics metrics;
  const ProgressLoaded(this.metrics);
}

class ProgressFailure extends ProgressState {
  final Failure failure;
  const ProgressFailure(this.failure);
}
