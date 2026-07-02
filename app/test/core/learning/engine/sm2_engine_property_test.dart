import 'dart:math';
import 'package:flutter_test/flutter_test.dart';
import 'package:wordsmart/core/learning/engine/sm2_engine.dart';
import 'package:wordsmart/core/learning/entities/learning_card.dart';
import 'package:wordsmart/core/learning/entities/learning_value_objects.dart';
import 'package:wordsmart/core/domain/entities/word.dart';

void main() {
  final tWord = Word(id: 1, word: 'ABATE');

  LearningCard createCard({
    double easinessFactor = 2.5,
    int intervalDays = 0,
    int repetitionCount = 0,
    LearningState learningState = LearningState.learning,
  }) {
    return LearningCard(
      word: tWord,
      learningState: learningState,
      isDue: true,
      priority: ReviewPriority.medium,
      easinessFactor: easinessFactor,
      intervalDays: intervalDays,
      repetitionCount: repetitionCount,
      mode: ReviewMode.review,
    );
  }

  group('SM2Engine Property-Based Invariant Verification (10000 reviews)', () {
    test('should verify invariants across 10000 simulated reviews', () {
      const engine = SM2Engine();
      final random = Random(42);

      var card = createCard();

      for (int i = 0; i < 10000; i++) {
        final rating =
            ReviewRating.values[random.nextInt(ReviewRating.values.length)];
        final result = engine.calculateNextReview(
          card: card,
          rating: rating,
          reviewDate: DateTime.now(),
        );
        expect(result.easinessFactor, greaterThanOrEqualTo(1.3),
            reason: 'EF must never drop below 1.3 at iteration $i');
        expect(result.intervalDays, greaterThanOrEqualTo(0),
            reason: 'Interval must be non-negative at iteration $i');
        expect(result.repetitionCount, greaterThanOrEqualTo(0),
            reason: 'Repetitions must be non-negative at iteration $i');

        card = createCard(
          easinessFactor: result.easinessFactor,
          intervalDays: result.intervalDays,
          repetitionCount: result.repetitionCount,
          learningState: result.learningState,
        );
      }
    });
  });
}
