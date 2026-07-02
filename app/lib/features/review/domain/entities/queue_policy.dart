import 'value_objects.dart';
import '../../../../core/learning/entities/learning_card.dart';

abstract class QueuePolicy {
  int get maxCards;
  int get maxMinutes;
  bool get includeNewWords;
  bool get includeDecaying;
  
  bool shouldInclude(ReviewCard card);
}

class DailyReviewPolicy implements QueuePolicy {
  @override
  final int maxCards;
  @override
  final int maxMinutes;
  @override
  final bool includeNewWords;
  @override
  final bool includeDecaying;

  const DailyReviewPolicy({
    this.maxCards = 20,
    this.maxMinutes = 15,
    this.includeNewWords = true,
    this.includeDecaying = true,
  });

  @override
  bool shouldInclude(ReviewCard card) {
    if (!includeDecaying && card.learningState == LearningState.decaying) {
      return false;
    }
    if (!includeNewWords && card.mode == ReviewMode.newCard) {
      return false;
    }
    return true;
  }
}
