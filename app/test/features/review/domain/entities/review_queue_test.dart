import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/review/domain/entities/review_card.dart';
import '../../../../../lib/features/review/domain/entities/review_queue.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';

void main() {
  final tWord1 = Word(id: 1, word: 'ABATE');
  final tWord2 = Word(id: 2, word: 'ABHOR');
  final tWord3 = Word(id: 3, word: 'ACME');

  final tCard1 = LearningCard(
    word: tWord1,
    learningState: LearningState.newCard,
    isDue: true,
    priority: ReviewPriority.medium,
    easinessFactor: 2.5,
    intervalDays: 0,
    repetitionCount: 0,
    mode: ReviewMode.newCard,
  );

  final tCard2 = LearningCard(
    word: tWord2,
    learningState: LearningState.reviewing,
    isDue: true,
    priority: ReviewPriority.high,
    easinessFactor: 2.3,
    intervalDays: 4,
    repetitionCount: 2,
    mode: ReviewMode.review,
  );

  final tCard3 = LearningCard(
    word: tWord3,
    learningState: LearningState.relearning,
    isDue: true,
    priority: ReviewPriority.critical,
    easinessFactor: 1.5,
    intervalDays: 1,
    repetitionCount: 0,
    mode: ReviewMode.relearn,
  );

  group('ReviewQueue Invariant Validation & Statistics', () {
    test(
        'should construct a valid ReviewQueue and calculate correct statistics',
        () {
      final queue = ReviewQueue(
        id: 'queue-123',
        createdAt: DateTime(2026, 7, 2),
        cards: [tCard1, tCard2, tCard3],
      );

      expect(queue.id, 'queue-123');
      expect(queue.cards.length, 3);
      expect(queue.statistics.totalCount, 3);
      expect(queue.statistics.newCount, 1);
      expect(queue.statistics.reviewCount, 1);
      expect(queue.statistics.relearnCount, 1);
      expect(queue.estimatedDuration.inSeconds, 90); // 3 cards * 30 seconds
    });

    test('should throw ArgumentError when ID is empty', () {
      expect(
        () => ReviewQueue(
          id: '',
          createdAt: DateTime.now(),
          cards: [tCard1],
        ),
        throwsArgumentError,
      );
    });

    test('should handle empty cards list with zero statistics', () {
      final queue = ReviewQueue(
        id: 'queue-empty',
        createdAt: DateTime.now(),
        cards: [],
      );

      expect(queue.statistics.totalCount, 0);
      expect(queue.statistics.newCount, 0);
      expect(queue.statistics.reviewCount, 0);
      expect(queue.statistics.relearnCount, 0);
      expect(queue.estimatedDuration.inSeconds, 0);
    });
  });
}
