import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/review/domain/entities/review_card.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';
import '../../../../../lib/features/review/domain/services/review_scheduler.dart';

void main() {
  final tWord = Word(id: 1, word: 'ABATE');
  const scheduler = ReviewScheduler();

  group('ReviewScheduler Rules', () {
    test(
        'should return SchedulingStatus.overdue when next review date has passed',
        () {
      final card = LearningCard(
        word: tWord,
        learningState: LearningState.reviewing,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 2.5,
        intervalDays: 5,
        repetitionCount: 2,
        mode: ReviewMode.review,
      );

      final status = scheduler.getStatus(
        card: card,
        nextReviewAt: DateTime(2026, 7, 1),
        now: DateTime(2026, 7, 2),
      );

      expect(status, SchedulingStatus.overdue);
    });

    test(
        'should return SchedulingStatus.decaying when next review has passed for > 7 days and EF is low',
        () {
      final card = LearningCard(
        word: tWord,
        learningState: LearningState.reviewing,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 1.5, // low EF
        intervalDays: 5,
        repetitionCount: 2,
        mode: ReviewMode.review,
      );

      final status = scheduler.getStatus(
        card: card,
        nextReviewAt: DateTime(2026, 6, 20), // 12 days overdue
        now: DateTime(2026, 7, 2),
      );

      expect(status, SchedulingStatus.decaying);
    });

    test(
        'should return SchedulingStatus.due when next review is within 24 hours of now',
        () {
      final card = LearningCard(
        word: tWord,
        learningState: LearningState.reviewing,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 2.5,
        intervalDays: 5,
        repetitionCount: 2,
        mode: ReviewMode.review,
      );

      final status = scheduler.getStatus(
        card: card,
        nextReviewAt: DateTime(2026, 7, 2, 18, 0),
        now: DateTime(2026, 7, 2, 10, 0), // 8 hours away
      );

      expect(status, SchedulingStatus.due);
    });

    test(
        'should return SchedulingStatus.future when next review is far in the future',
        () {
      final card = LearningCard(
        word: tWord,
        learningState: LearningState.reviewing,
        isDue: false,
        priority: ReviewPriority.low,
        easinessFactor: 2.5,
        intervalDays: 10,
        repetitionCount: 2,
        mode: ReviewMode.review,
      );

      final status = scheduler.getStatus(
        card: card,
        nextReviewAt: DateTime(2026, 7, 15),
        now: DateTime(2026, 7, 2),
      );

      expect(status, SchedulingStatus.future);
    });

    test('should calculate correct overdue ratio', () {
      final nextReviewAt = DateTime(2026, 7, 2);
      final lastReviewedAt = DateTime(2026, 6, 28); // 4 days interval

      final ratio = scheduler.calculateOverdueRatio(
        nextReviewAt: nextReviewAt,
        lastReviewedAt: lastReviewedAt,
        now: DateTime(2026, 7, 3), // 1 day overdue
      );

      expect(ratio, 0.25); // delay (1 day) / total interval (4 days) = 0.25
    });
  });
}
