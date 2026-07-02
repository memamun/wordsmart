import '../../../../core/learning/entities/learning_card.dart';

enum SchedulingStatus { due, overdue, decaying, future }

class ReviewScheduler {
  const ReviewScheduler();

  SchedulingStatus getStatus({
    required LearningCard card,
    required DateTime nextReviewAt,
    required DateTime now,
  }) {
    final diff = nextReviewAt.difference(now);
    if (diff.isNegative) {
      final daysOverdue = -diff.inDays;
      if (daysOverdue > 7 && card.easinessFactor < 1.8) {
        return SchedulingStatus.decaying;
      }
      return SchedulingStatus.overdue;
    }

    if (diff.inHours <= 24) {
      return SchedulingStatus.due;
    }

    return SchedulingStatus.future;
  }

  double calculateOverdueRatio({
    required DateTime nextReviewAt,
    required DateTime lastReviewedAt,
    required DateTime now,
  }) {
    final totalInterval = nextReviewAt.difference(lastReviewedAt).inSeconds;
    if (totalInterval <= 0) return 1.0;

    final delay = now.difference(nextReviewAt).inSeconds;
    if (delay <= 0) return 0.0;

    return delay / totalInterval;
  }
}
