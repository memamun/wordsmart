import 'dart:math';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/learning/entities/learning_card.dart';
import '../../../../../lib/core/learning/entities/learning_result.dart';
import '../../../../../lib/core/learning/entities/learning_value_objects.dart';
import '../../../../../lib/core/learning/engine/sm2_engine.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';

void main() {
  final tWord = Word(id: 1, word: 'ABATE');
  const engine = SM2Engine();

  group('SM2Engine Property-Based Invariant Verification (10000 reviews)', () {
    test('should verify invariants across 10000 simulated reviews', () {
      final random = Random(42);

      LearningCard currentCard = LearningCard(
        word: tWord,
        learningState: LearningState.newCard,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 2.5,
        intervalDays: 0,
        repetitionCount: 0,
        mode: ReviewMode.newCard,
      );

      DateTime reviewDate = DateTime(2026, 7, 2);

      for (int i = 0; i < 10000; i++) {
        final ratingVal = random.nextInt(6);
        final rating = ReviewRating.values[ratingVal];

        final result = engine.calculateNextReview(
          card: currentCard,
          rating: rating,
          reviewDate: reviewDate,
        );

        // Core invariants
        expect(result.easinessFactor, greaterThanOrEqualTo(1.3),
            reason: 'EF must never fall below 1.3');
        expect(result.intervalDays, greaterThanOrEqualTo(0),
            reason: 'Interval days must never be negative');
        expect(result.repetitionCount, greaterThanOrEqualTo(0),
            reason: 'Repetition count must never be negative');
        expect(result.nextReviewAt.isAfter(reviewDate), true,
            reason: 'Next review must be in the future');
        expect(result.masteryScore, greaterThanOrEqualTo(0),
            reason: 'Mastery score cannot be negative');
        expect(result.masteryScore, lessThanOrEqualTo(100),
            reason: 'Mastery score cannot exceed 100');

        // LearningState transition validity
        if (rating.score < 3) {
          expect(result.learningState, LearningState.relearning,
              reason: 'Incorrect answer must lead to relearning state');
        } else {
          expect(
            result.learningState == LearningState.reviewing ||
                result.learningState == LearningState.mastered,
            true,
            reason: 'Correct answer must lead to reviewing or mastered state',
          );
        }

        // Repetition count logic
        if (rating.score < 3) {
          expect(result.repetitionCount, 0,
              reason: 'Incorrect answer must reset repetitions to 0');
        } else {
          expect(result.repetitionCount, greaterThanOrEqualTo(1),
              reason: 'Correct answer must increment repetitions');
        }

        // Interval logic for first two reviews
        if (currentCard.repetitionCount == 0 && rating.score >= 3) {
          expect(result.intervalDays, 1,
              reason: 'First correct review interval must be 1 day');
        }
        if (currentCard.repetitionCount == 1 && rating.score >= 3) {
          expect(result.intervalDays, 6,
              reason: 'Second correct review interval must be 6 days');
        }

        currentCard = LearningCard(
          word: tWord,
          learningState: result.learningState,
          isDue: true,
          priority: ReviewPriority.medium,
          easinessFactor: result.easinessFactor,
          intervalDays: result.intervalDays,
          repetitionCount: result.repetitionCount,
          mode: ReviewMode.review,
        );

        reviewDate = result.nextReviewAt;
      }
    });
  });

  group('SM2Engine Edge Cases', () {
    test('should handle minimum EF boundary correctly', () {
      final card = LearningCard(
        word: tWord,
        learningState: LearningState.learning,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 1.3,
        intervalDays: 1,
        repetitionCount: 0,
        mode: ReviewMode.review,
      );

      final result = engine.calculateNextReview(
        card: card,
        rating: ReviewRating.completeBlackout,
        reviewDate: DateTime(2026, 7, 2),
      );

      expect(result.easinessFactor, 1.3);
    });

    test('should handle maximum rating correctly', () {
      final card = LearningCard(
        word: tWord,
        learningState: LearningState.reviewing,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 2.5,
        intervalDays: 15,
        repetitionCount: 5,
        mode: ReviewMode.review,
      );

      final result = engine.calculateNextReview(
        card: card,
        rating: ReviewRating.easy,
        reviewDate: DateTime(2026, 7, 2),
      );

      expect(result.learningState, LearningState.mastered);
      expect(result.repetitionCount, 6);
      expect(result.intervalDays, greaterThan(15));
    });
  });
}
