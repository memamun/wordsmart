import '../entities/value_objects.dart';

class LearningSignalAnalyzer {
  const LearningSignalAnalyzer();

  ReviewRating analyze({
    required bool isCorrect,
    required Duration responseTime,
    required bool hintUsed,
  }) {
    if (!isCorrect) {
      if (responseTime.inSeconds > 10) {
        return ReviewRating.completeBlackout; // 0
      }
      return hintUsed ? ReviewRating.incorrect : ReviewRating.difficult; // 1 or 2
    } else {
      if (hintUsed) {
        return ReviewRating.hard; // 3
      }
      if (responseTime.inSeconds > 5) {
        return ReviewRating.good; // 4
      }
      return ReviewRating.easy; // 5
    }
  }
}
