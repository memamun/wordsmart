import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/review/domain/entities/review_card.dart';
import '../../../../../lib/features/review/domain/entities/review_queue.dart';
import '../../../../../lib/features/review/domain/entities/review_session.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';

void main() {
  final tWord1 = Word(id: 1, word: 'ABATE');
  final tWord2 = Word(id: 2, word: 'ABHOR');

  final tCard1 = ReviewCard(
    word: tWord1,
    learningState: LearningState.newCard,
    isDue: true,
    priority: ReviewPriority.medium,
    easinessFactor: 2.5,
    intervalDays: 0,
    repetitionCount: 0,
    mode: ReviewMode.newCard,
  );

  final tCard2 = ReviewCard(
    word: tWord2,
    learningState: LearningState.reviewing,
    isDue: true,
    priority: ReviewPriority.high,
    easinessFactor: 2.3,
    intervalDays: 4,
    repetitionCount: 2,
    mode: ReviewMode.review,
  );

  late ReviewQueue tQueue;

  setUp(() {
    tQueue = ReviewQueue(
      id: 'queue-123',
      createdAt: DateTime(2026, 7, 2),
      cards: [tCard1, tCard2],
    );
  });

  group('ReviewSession Lifecycle & Invariants', () {
    test('should construct a valid session and get first card', () {
      final session = ReviewSession(
        id: 'session-123',
        queue: tQueue,
        startedAt: DateTime(2026, 7, 2, 10, 0),
      );

      expect(session.id, 'session-123');
      expect(session.currentIndex, 0);
      expect(session.reviewedCount, 0);
      expect(session.isCompleted, false);
      expect(session.currentCard, tCard1);
    });

    test('should progress session and collect correct statistics upon answering cards', () {
      final session = ReviewSession(
        id: 'session-123',
        queue: tQueue,
        startedAt: DateTime(2026, 7, 2, 10, 0),
      );

      // Answer first card correctly (rating 4)
      final session2 = session.answerCard(const ReviewRating(4));

      expect(session2.currentIndex, 1);
      expect(session2.reviewedCount, 1);
      expect(session2.correctCount, 1);
      expect(session2.incorrectCount, 0);
      expect(session2.currentCard, tCard2);
      expect(session2.isCompleted, false);

      // Answer second card incorrectly (rating 1)
      final session3 = session2.answerCard(const ReviewRating(1), now: DateTime(2026, 7, 2, 10, 5));

      expect(session3.currentIndex, 2);
      expect(session3.reviewedCount, 2);
      expect(session3.correctCount, 1);
      expect(session3.incorrectCount, 1);
      expect(session3.isCompleted, true);
      expect(session3.finishedAt, DateTime(2026, 7, 2, 10, 5));
    });

    test('should throw StateError when getting card from completed session', () {
      final session = ReviewSession(
        id: 'session-123',
        queue: tQueue,
        startedAt: DateTime(2026, 7, 2, 10, 0),
      );

      final completedSession = session
          .answerCard(const ReviewRating(5))
          .answerCard(const ReviewRating(2));

      expect(completedSession.isCompleted, true);
      expect(() => completedSession.currentCard, throwsStateError);
      expect(() => completedSession.answerCard(const ReviewRating(4)), throwsStateError);
    });

    test('should reject invalid constructor statistics', () {
      expect(
        () => ReviewSession(
          id: 'session-123',
          queue: tQueue,
          startedAt: DateTime.now(),
          reviewedCount: -1,
        ),
        throwsArgumentError,
      );

      expect(
        () => ReviewSession(
          id: 'session-123',
          queue: tQueue,
          startedAt: DateTime.now(),
          reviewedCount: 1,
          correctCount: 2, // exceeds reviewed
        ),
        throwsArgumentError,
      );

      expect(
        () => ReviewSession(
          id: 'session-123',
          queue: tQueue,
          startedAt: DateTime.now(),
          reviewedCount: 1,
          correctCount: 0,
          incorrectCount: 0, // sum mismatch
        ),
        throwsArgumentError,
      );
    });
  });
}
