import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/review/domain/entities/daily_goal.dart';

void main() {
  group('DailyGoal Invariant Validation & Metrics', () {
    test('should construct a valid DailyGoal and verify completion details', () {
      final goal = DailyGoal(
        targetReviews: 20,
        completedReviews: 18,
        targetMinutes: 15,
        completedMinutes: 10,
      );

      expect(goal.isCompleted, false);
      expect(goal.reviewCompletionPercentage, 90.0);
      expect(goal.minutesCompletionPercentage, closeTo(66.66, 0.01));
    });

    test('should handle completion calculations when targets are exceeded', () {
      final goal = DailyGoal(
        targetReviews: 20,
        completedReviews: 25,
        targetMinutes: 15,
        completedMinutes: 20,
      );

      expect(goal.isCompleted, true);
      expect(goal.reviewCompletionPercentage, 125.0);
      expect(goal.minutesCompletionPercentage, closeTo(133.33, 0.01));
    });

    test('should throw ArgumentError when target reviews is zero or negative', () {
      expect(
        () => DailyGoal(
          targetReviews: 0,
          completedReviews: 0,
          targetMinutes: 15,
          completedMinutes: 0,
        ),
        throwsArgumentError,
      );
    });

    test('should throw ArgumentError when completed reviews is negative', () {
      expect(
        () => DailyGoal(
          targetReviews: 20,
          completedReviews: -1,
          targetMinutes: 15,
          completedMinutes: 0,
        ),
        throwsArgumentError,
      );
    });
  });
}
