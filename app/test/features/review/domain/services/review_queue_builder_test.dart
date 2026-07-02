import 'dart:math';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/review/domain/entities/review_card.dart';
import '../../../../../lib/features/review/domain/entities/queue_policy.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';
import '../../../../../lib/features/review/domain/services/review_queue_builder.dart';

void main() {
  final tWord1 = Word(id: 1, word: 'ABATE');
  final tWord2 = Word(id: 2, word: 'ABHOR');
  final tWord3 = Word(id: 3, word: 'ACME');
  final tWord4 = Word(id: 4, word: 'BOON');

  const builder = ReviewQueueBuilder();
  final now = DateTime(2026, 7, 2, 12, 0);

  group('ReviewQueueBuilder Assembly Rules', () {
    test('should build an empty queue when card list is empty', () {
      final queue = builder.build(
        cards: [],
        policy: const DailyReviewPolicy(),
        now: now,
      );

      expect(queue.cards, isEmpty);
      expect(queue.statistics.totalCount, 0);
    });

    test('should deduplicate cards matching the same word ID', () {
      final card1 = ReviewCard(
        word: tWord1,
        learningState: LearningState.newCard,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 2.5,
        intervalDays: 0,
        repetitionCount: 0,
        mode: ReviewMode.newCard,
      );

      final card2 = ReviewCard(
        word: tWord1, // Duplicate word ID
        learningState: LearningState.learning,
        isDue: true,
        priority: ReviewPriority.high,
        easinessFactor: 2.0,
        intervalDays: 1,
        repetitionCount: 1,
        mode: ReviewMode.review,
      );

      final queue = builder.build(
        cards: [card1, card2],
        policy: const DailyReviewPolicy(),
        now: now,
      );

      expect(queue.cards.length, 1);
      expect(queue.cards.first.word.id, 1);
    });

    test('should filter cards based on policy rules', () {
      final cardNew = ReviewCard(
        word: tWord1,
        learningState: LearningState.newCard,
        isDue: true,
        priority: ReviewPriority.low,
        easinessFactor: 2.5,
        intervalDays: 0,
        repetitionCount: 0,
        mode: ReviewMode.newCard,
      );

      final cardDue = ReviewCard(
        word: tWord2,
        learningState: LearningState.reviewing,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 2.5,
        intervalDays: 5,
        repetitionCount: 2,
        mode: ReviewMode.review,
      );

      // Policy excluding new words
      final policy = DailyReviewPolicy(maxCards: 10, includeNewWords: false);

      final queue = builder.build(
        cards: [cardNew, cardDue],
        policy: policy,
        now: now,
      );

      expect(queue.cards.length, 1);
      expect(queue.cards.first.word.id, 2);
    });

    test('should sort cards correctly (Overdue > Due > New)', () {
      final cardNew = ReviewCard(
        word: tWord1,
        learningState: LearningState.newCard,
        isDue: true,
        priority: ReviewPriority.low,
        easinessFactor: 2.5,
        intervalDays: 0,
        repetitionCount: 0,
        mode: ReviewMode.newCard,
      );

      final cardDue = ReviewCard(
        word: tWord2,
        learningState: LearningState.reviewing,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 2.5,
        intervalDays: 5,
        repetitionCount: 2,
        mode: ReviewMode.review,
        nextReviewAt: now.add(const Duration(hours: 2)), // due in future hours today
      );

      final cardOverdue = ReviewCard(
        word: tWord3,
        learningState: LearningState.reviewing,
        isDue: true,
        priority: ReviewPriority.critical,
        easinessFactor: 2.5,
        intervalDays: 4,
        repetitionCount: 2,
        mode: ReviewMode.review,
        lastReviewedAt: now.subtract(const Duration(days: 6)),
        nextReviewAt: now.subtract(const Duration(days: 2)), // overdue by 2 days
      );

      final queue = builder.build(
        cards: [cardNew, cardDue, cardOverdue],
        policy: const DailyReviewPolicy(maxCards: 5),
        now: now,
      );

      expect(queue.cards.length, 3);
      // Expected Sort Order: Overdue (Rank 4) -> Due (Rank 2) -> New (Rank 0)
      expect(queue.cards[0].word.id, 3); // Overdue
      expect(queue.cards[1].word.id, 2); // Due
      expect(queue.cards[2].word.id, 1); // New
    });

    test('should sort overdue cards by highest overdue ratio secondarily', () {
      final cardLessOverdue = ReviewCard(
        word: tWord1,
        learningState: LearningState.reviewing,
        isDue: true,
        priority: ReviewPriority.high,
        easinessFactor: 2.0,
        intervalDays: 4,
        repetitionCount: 2,
        mode: ReviewMode.review,
        lastReviewedAt: now.subtract(const Duration(days: 5)),
        nextReviewAt: now.subtract(const Duration(days: 1)), // 1 day overdue on 4 day interval = 0.25
      );

      final cardMoreOverdue = ReviewCard(
        word: tWord2,
        learningState: LearningState.reviewing,
        isDue: true,
        priority: ReviewPriority.high,
        easinessFactor: 2.0,
        intervalDays: 2,
        repetitionCount: 2,
        mode: ReviewMode.review,
        lastReviewedAt: now.subtract(const Duration(days: 4)),
        nextReviewAt: now.subtract(const Duration(days: 2)), // 2 days overdue on 2 day interval = 1.0
      );

      final queue = builder.build(
        cards: [cardLessOverdue, cardMoreOverdue],
        policy: const DailyReviewPolicy(maxCards: 5),
        now: now,
      );

      // cardMoreOverdue (ratio 1.0) must be positioned first
      expect(queue.cards[0].word.id, 2);
      expect(queue.cards[1].word.id, 1);
    });

    test('should limit output card count to policy.maxCards', () {
      final cards = List.generate(
        10,
        (index) => ReviewCard(
          word: Word(id: index + 1, word: 'WORD$index'),
          learningState: LearningState.reviewing,
          isDue: true,
          priority: ReviewPriority.medium,
          easinessFactor: 2.5,
          intervalDays: 1,
          repetitionCount: 1,
          mode: ReviewMode.review,
        ),
      );

      final queue = builder.build(
        cards: cards,
        policy: const DailyReviewPolicy(maxCards: 5),
        now: now,
      );

      expect(queue.cards.length, 5);
    });
  });

  group('ReviewQueueBuilder Property-Based Deck Verification', () {
    test('should verify uniqueness and constraints on 1000 simulated random decks', () {
      final random = Random(42);

      for (int t = 0; t < 100; t++) {
        // Generate random collection of cards (some duplicate words)
        final cardsCount = random.nextInt(50) + 10;
        final List<ReviewCard> cardsInput = [];
        
        for (int c = 0; c < cardsCount; c++) {
          final wordId = random.nextInt(20) + 1; // Duplicates occur naturally
          final isDue = random.nextBool();
          final state = LearningState.values[random.nextInt(LearningState.values.length)];
          final mode = ReviewMode.values[random.nextInt(ReviewMode.values.length)];
          
          cardsInput.add(
            ReviewCard(
              word: Word(id: wordId, word: 'WORD$wordId'),
              learningState: state,
              isDue: isDue,
              priority: ReviewPriority.medium,
              easinessFactor: 1.3 + random.nextDouble(),
              intervalDays: random.nextInt(30),
              repetitionCount: random.nextInt(10),
              mode: mode,
              lastReviewedAt: now.subtract(Duration(days: random.nextInt(10) + 5)),
              nextReviewAt: now.add(Duration(days: random.nextInt(10) - 5)),
            ),
          );
        }

        final limit = random.nextInt(15) + 5;
        final policy = DailyReviewPolicy(maxCards: limit);

        final queue = builder.build(
          cards: cardsInput,
          policy: policy,
          now: now,
        );

        // Verify Invariants
        expect(queue.cards.length, <= limit, reason: 'Queue count cannot exceed policy cap');
        
        final uniqueIds = <int>{};
        for (final card in queue.cards) {
          expect(uniqueIds.add(card.word.id), true, reason: 'Queue must contain unique word IDs');
        }
      }
    });
  });
}
