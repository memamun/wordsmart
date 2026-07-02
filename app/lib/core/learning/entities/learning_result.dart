import 'learning_value_objects.dart';

class LearningResult {
  final double easinessFactor;
  final int intervalDays;
  final int repetitionCount;
  final DateTime nextReviewAt;
  final LearningState learningState;
  final int masteryScore;

  const LearningResult({
    required this.easinessFactor,
    required this.intervalDays,
    required this.repetitionCount,
    required this.nextReviewAt,
    required this.learningState,
    required this.masteryScore,
  });
}
