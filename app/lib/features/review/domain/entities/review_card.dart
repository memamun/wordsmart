import '../../../../features/dictionary/domain/entities/word.dart';
import 'value_objects.dart';

class ReviewCard {
  final Word word;
  final LearningState learningState;
  final bool isDue;
  final ReviewPriority priority;
  final double easinessFactor;
  final int intervalDays;
  final int repetitionCount;
  final ReviewMode mode;

  const ReviewCard._({
    required this.word,
    required this.learningState,
    required this.isDue,
    required this.priority,
    required this.easinessFactor,
    required this.intervalDays,
    required this.repetitionCount,
    required this.mode,
  });

  factory ReviewCard({
    required Word word,
    required LearningState learningState,
    required bool isDue,
    required ReviewPriority priority,
    required double easinessFactor,
    required int intervalDays,
    required int repetitionCount,
    required ReviewMode mode,
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
    return ReviewCard._(
      word: word,
      learningState: learningState,
      isDue: isDue,
      priority: priority,
      easinessFactor: easinessFactor,
      intervalDays: intervalDays,
      repetitionCount: repetitionCount,
      mode: mode,
    );
  }
}
