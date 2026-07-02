import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/review/domain/entities/review_card.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';

void main() {
  final tWord = Word(id: 1, word: 'ABATE');

  group('ReviewCard Invariant Validation', () {
    test('should construct a valid ReviewCard when parameters are valid', () {
      final card = ReviewCard(
        word: tWord,
        learningState: LearningState.newCard,
        isDue: true,
        priority: ReviewPriority.high,
        easinessFactor: 2.5,
        intervalDays: 1,
        repetitionCount: 0,
        mode: ReviewMode.newCard,
      );

      expect(card.word.word, 'ABATE');
      expect(card.easinessFactor, 2.5);
      expect(card.intervalDays, 1);
      expect(card.repetitionCount, 0);
    });

    test('should throw ArgumentError when easiness factor is less than 1.3', () {
      expect(
        () => ReviewCard(
          word: tWord,
          learningState: LearningState.learning,
          isDue: true,
          priority: ReviewPriority.medium,
          easinessFactor: 1.2,
          intervalDays: 1,
          repetitionCount: 0,
          mode: ReviewMode.review,
        ),
        throwsArgumentError,
      );
    });

    test('should throw ArgumentError when interval days is negative', () {
      expect(
        () => ReviewCard(
          word: tWord,
          learningState: LearningState.learning,
          isDue: true,
          priority: ReviewPriority.medium,
          easinessFactor: 2.0,
          intervalDays: -1,
          repetitionCount: 0,
          mode: ReviewMode.review,
        ),
        throwsArgumentError,
      );
    });

    test('should throw ArgumentError when repetition count is negative', () {
      expect(
        () => ReviewCard(
          word: tWord,
          learningState: LearningState.learning,
          isDue: true,
          priority: ReviewPriority.medium,
          easinessFactor: 2.0,
          intervalDays: 1,
          repetitionCount: -5,
          mode: ReviewMode.review,
        ),
        throwsArgumentError,
      );
    });
  });
}
