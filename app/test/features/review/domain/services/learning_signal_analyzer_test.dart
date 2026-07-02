import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/learning/entities/learning_value_objects.dart';
import '../../../../../lib/core/learning/engine/learning_signal_analyzer.dart';

void main() {
  const analyzer = LearningSignalAnalyzer();

  group('LearningSignalAnalyzer Rules', () {
    test(
        'should resolve ReviewRating.easy for fast correct answers with no hints',
        () {
      final rating = analyzer.analyze(
        isCorrect: true,
        responseTime: const Duration(seconds: 3),
        hintUsed: false,
      );

      expect(rating, ReviewRating.easy);
    });

    test(
        'should resolve ReviewRating.good for correct answers with moderate duration and no hints',
        () {
      final rating = analyzer.analyze(
        isCorrect: true,
        responseTime: const Duration(seconds: 8),
        hintUsed: false,
      );

      expect(rating, ReviewRating.good);
    });

    test(
        'should resolve ReviewRating.hard for correct answers where hints were used',
        () {
      final rating = analyzer.analyze(
        isCorrect: true,
        responseTime: const Duration(seconds: 4),
        hintUsed: true,
      );

      expect(rating, ReviewRating.hard);
    });

    test(
        'should resolve ReviewRating.completeBlackout for slow incorrect answers',
        () {
      final rating = analyzer.analyze(
        isCorrect: false,
        responseTime: const Duration(seconds: 12),
        hintUsed: false,
      );

      expect(rating, ReviewRating.completeBlackout);
    });

    test(
        'should resolve ReviewRating.incorrect for incorrect answers where hints were used',
        () {
      final rating = analyzer.analyze(
        isCorrect: false,
        responseTime: const Duration(seconds: 5),
        hintUsed: true,
      );

      expect(rating, ReviewRating.incorrect);
    });
  });
}
