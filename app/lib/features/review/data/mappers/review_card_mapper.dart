import '../../../dictionary/domain/entities/word.dart';
import '../../../../core/learning/entities/learning_card.dart';
import '../../../../core/learning/entities/learning_value_objects.dart';
import '../models/review_card_model.dart';

class ReviewCardMapper {
  static LearningCard toEntity(ReviewCardModel model, DateTime now) {
    final word = Word(
      id: model.wordId,
      word: model.word,
      definition: model.definition,
      bengaliMeaning: model.bengaliMeaning,
      pronunciation: model.pronunciation,
      partOfSpeech: model.partOfSpeech,
      level: model.level,
      audioPath: model.audioPath,
      mnemonic: model.mnemonic,
    );

    final lastReviewed = model.lastReviewedAt != null 
        ? DateTime.parse(model.lastReviewedAt!) 
        : null;
        
    final nextReview = model.nextReviewAt != null 
        ? DateTime.parse(model.nextReviewAt!) 
        : null;

    LearningState state = LearningState.newCard;
    if (model.learningState != null) {
      state = LearningState.values.firstWhere(
        (e) => e.toString().split('.').last == model.learningState,
        orElse: () => LearningState.newCard,
      );
    }

    ReviewMode mode = ReviewMode.newCard;
    if (model.learningState != null) {
      if (model.learningState == 'relearning') {
        mode = ReviewMode.relearn;
      } else {
        mode = ReviewMode.review;
      }
    }

    ReviewPriority priority = ReviewPriority.low;
    if (nextReview != null) {
      final diff = nextReview.difference(now);
      if (diff.isNegative) {
        priority = -diff.inDays > 3 ? ReviewPriority.critical : ReviewPriority.high;
      } else if (diff.inHours <= 24) {
        priority = ReviewPriority.medium;
      }
    }

    final isCardDue = nextReview == null ? true : nextReview.isBefore(now);

    return LearningCard(
      word: word,
      learningState: state,
      isDue: isCardDue,
      priority: priority,
      easinessFactor: model.easeFactor ?? 2.5,
      intervalDays: model.intervalDays ?? 0,
      repetitionCount: model.repetitions ?? 0,
      mode: mode,
      lastReviewedAt: lastReviewed,
      nextReviewAt: nextReview,
    );
  }
}
