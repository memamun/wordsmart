import '../entities/learning_card.dart';
import '../entities/learning_result.dart';
import '../entities/learning_value_objects.dart';

class SM2Engine {
  const SM2Engine();

  LearningResult calculateNextReview({
    required LearningCard card,
    required ReviewRating rating,
    required DateTime reviewDate,
  }) {
    final q = rating.score;

    double ef = card.easinessFactor;
    int repetitions = card.repetitionCount;
    int interval = card.intervalDays;

    if (q >= 3) {
      // Correct response
      if (repetitions == 0) {
        interval = 1;
      } else if (repetitions == 1) {
        interval = 6;
      } else {
        interval = (interval * ef).round();
      }
      repetitions += 1;
    } else {
      // Incorrect response
      repetitions = 0;
      interval = 1;
    }

    // Update easiness factor using standard SM-2 formula
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (ef < 1.3) {
      ef = 1.3;
    }

    // Calculate next review timestamp
    final nextReview = reviewDate.add(Duration(days: interval));

    // Calculate learning state and mastery proxy score
    LearningState state;
    int mastery;

    if (q < 3) {
      state = LearningState.relearning;
    } else {
      state =
          repetitions >= 4 ? LearningState.mastered : LearningState.reviewing;
    }

    // Mastery formula bounded 0 to 100 based on repetitions and score
    mastery = (repetitions * 20).clamp(0, 100);
    if (q < 3) {
      mastery = (mastery - 30).clamp(0, 100);
    }

    return LearningResult(
      easinessFactor: double.parse(ef.toStringAsFixed(4)),
      intervalDays: interval,
      repetitionCount: repetitions,
      nextReviewAt: nextReview,
      learningState: state,
      masteryScore: mastery,
    );
  }
}
