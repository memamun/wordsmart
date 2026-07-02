class DailyGoal {
  final int targetReviews;
  final int completedReviews;
  final int targetMinutes;
  final int completedMinutes;

  const DailyGoal._({
    required this.targetReviews,
    required this.completedReviews,
    required this.targetMinutes,
    required this.completedMinutes,
  });

  factory DailyGoal({
    required int targetReviews,
    required int completedReviews,
    required int targetMinutes,
    required int completedMinutes,
  }) {
    if (targetReviews <= 0) {
      throw ArgumentError(
          'Target reviews must be greater than zero. Received: $targetReviews');
    }
    if (targetMinutes <= 0) {
      throw ArgumentError(
          'Target minutes must be greater than zero. Received: $targetMinutes');
    }
    if (completedReviews < 0) {
      throw ArgumentError('Completed reviews cannot be negative');
    }
    if (completedMinutes < 0) {
      throw ArgumentError('Completed minutes cannot be negative');
    }
    return DailyGoal._(
      targetReviews: targetReviews,
      completedReviews: completedReviews,
      targetMinutes: targetMinutes,
      completedMinutes: completedMinutes,
    );
  }

  bool get isCompleted => completedReviews >= targetReviews;

  double get reviewCompletionPercentage =>
      (completedReviews / targetReviews) * 100.0;
  double get minutesCompletionPercentage =>
      (completedMinutes / targetMinutes) * 100.0;
}
