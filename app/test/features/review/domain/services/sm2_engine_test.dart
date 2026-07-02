import 'dart:math';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/core/learning/entities/learning_card.dart';
import '../../../../../lib/core/learning/entities/learning_value_objects.dart';
import '../../../../../lib/core/learning/engine/sm2_engine.dart';

void main() {
  final tWord = Word(id: 1, word: 'ABATE');
  const engine = SM2Engine();

  group('SM2Engine Calculation Rules', () {
    test('should calculate correct first review interval as 1 day', () {
      final card = LearningCard(
        word: tWord,
        learningState: LearningState.newCard,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 2.5,
        intervalDays: 0,
        repetitionCount: 0,
        mode: ReviewMode.newCard,
      );

      final result = engine.calculateNextReview(
        card: card,
        rating: ReviewRating.good, // score 4
        reviewDate: DateTime(2026, 7, 2),
      );

      expect(result.intervalDays, 1);
      expect(result.repetitionCount, 1);
      expect(result.nextReviewAt, DateTime(2026, 7, 3));
    });

    test('should calculate correct second review interval as 6 days', () {
      final card = LearningCard(
        word: tWord,
        learningState: LearningState.reviewing,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 2.5,
        intervalDays: 1,
        repetitionCount: 1,
        mode: ReviewMode.review,
      );

      final result = engine.calculateNextReview(
        card: card,
        rating: ReviewRating.good, // score 4
        reviewDate: DateTime(2026, 7, 2),
      );

      expect(result.intervalDays, 6);
      expect(result.repetitionCount, 2);
    });

    test('should calculate correct third review interval scaled by EF', () {
      final card = LearningCard(
        word: tWord,
        learningState: LearningState.reviewing,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 2.5,
        intervalDays: 6,
        repetitionCount: 2,
        mode: ReviewMode.review,
      );

      final result = engine.calculateNextReview(
        card: card,
        rating: ReviewRating.good, // score 4
        reviewDate: DateTime(2026, 7, 2),
      );

      expect(result.intervalDays, 15); // 6 * 2.5 = 15
      expect(result.repetitionCount, 3);
    });

    test(
        'should decrease EF and reset repetitions to 0 on failure (< 3 rating)',
        () {
      final card = LearningCard(
        word: tWord,
        learningState: LearningState.mastered,
        isDue: true,
        priority: ReviewPriority.medium,
        easinessFactor: 2.5,
        intervalDays: 15,
        repetitionCount: 3,
        mode: ReviewMode.review,
      );

      final result = engine.calculateNextReview(
        card: card,
        rating: ReviewRating.incorrect, // score 1
        reviewDate: DateTime(2026, 7, 2),
      );

      expect(result.intervalDays, 1);
      expect(result.repetitionCount, 0);
      expect(result.easinessFactor, lessThan(2.5));
      expect(result.learningState, LearningState.relearning);
    });

    test('should never drop EF below 1.3', () {
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
        rating: ReviewRating.completeBlackout, // score 0
        reviewDate: DateTime(2026, 7, 2),
      );

      expect(result.easinessFactor, 1.3);
    });
  });

  group('SM2Engine Property-Based Invariant Verification (1000 reviews)', () {
    test('should verify invariants across 1000 simulated reviews', () {
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

      for (int i = 0; i < 1000; i++) {
        // Random rating between 0 and 5
        final ratingVal = random.nextInt(6);
        final rating = ReviewRating.values[ratingVal];

        final result = engine.calculateNextReview(
          card: currentCard,
          rating: rating,
          reviewDate: reviewDate,
        );

        // Verify Invariants
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

        // Advance card for next simulation step
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
}
