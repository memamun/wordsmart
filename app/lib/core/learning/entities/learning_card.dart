import '../../../domain/entities/word.dart';
import 'learning_value_objects.dart';

class LearningCard {
  final Word word;
  final LearningState learningState;
  final bool isDue;
  final ReviewPriority priority;
  final double easinessFactor;
  final int intervalDays;
  final int repetitionCount;
  final ReviewMode mode;

  final DateTime? lastReviewedAt;
  final DateTime? nextReviewAt;

  const LearningCard._({
    required this.word,
    required this.learningState,
    required this.isDue,
    required this.priority,
    required this.easinessFactor,
    required this.intervalDays,
    required this.repetitionCount,
    required this.mode,
    this.lastReviewedAt,
    this.nextReviewAt,
  });

  factory LearningCard({
    required Word word,
    required LearningState learningState,
    required bool isDue,
    required ReviewPriority priority,
    required double easinessFactor,
    required int intervalDays,
    required int repetitionCount,
    required ReviewMode mode,
    DateTime? lastReviewedAt,
    DateTime? nextReviewAt,
  }) {
    if (easinessFactor < 1.3) {
      throw ArgumentError('Easiness factor cannot be less than 1.3. Received: $easinessFactor');
    }
    if (intervalDays < 0) {
      throw ArgumentError('Interval days cannot be negative. Received: $intervalDays');
    }
    if (repetitionCount < 0) {
      throw ArgumentError('Repetition count cannot be negative. Received: $repetitionCount');
    }
    return LearningCard._(
      word: word,
      learningState: learningState,
      isDue: isDue,
      priority: priority,
      easinessFactor: easinessFactor,
      intervalDays: intervalDays,
      repetitionCount: repetitionCount,
      mode: mode,
      lastReviewedAt: lastReviewedAt,
      nextReviewAt: nextReviewAt,
    );
  }
}
