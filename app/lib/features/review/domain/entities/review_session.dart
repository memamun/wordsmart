import '../../../../core/learning/entities/learning_card.dart';
import 'review_queue.dart';
import 'value_objects.dart';

class ReviewSession {
  final String id;
  final ReviewQueue queue;
  final int currentIndex;
  final DateTime startedAt;
  final DateTime? finishedAt;
  final int reviewedCount;
  final int correctCount;
  final int incorrectCount;

  ReviewSession._({
    required this.id,
    required this.queue,
    required this.currentIndex,
    required this.startedAt,
    this.finishedAt,
    required this.reviewedCount,
    required this.correctCount,
    required this.incorrectCount,
  });

  factory ReviewSession({
    required String id,
    required ReviewQueue queue,
    required DateTime startedAt,
    DateTime? finishedAt,
    int currentIndex = 0,
    int reviewedCount = 0,
    int correctCount = 0,
    int incorrectCount = 0,
  }) {
    if (id.isEmpty) {
      throw ArgumentError('Session ID cannot be empty');
    }
    if (currentIndex < 0 || currentIndex > queue.cards.length) {
      throw ArgumentError('Current index $currentIndex is out of bounds for queue size ${queue.cards.length}');
    }
    if (reviewedCount < 0 || reviewedCount > queue.cards.length) {
      throw ArgumentError('Reviewed count $reviewedCount cannot exceed queue size ${queue.cards.length}');
    }
    if (correctCount < 0 || correctCount > reviewedCount) {
      throw ArgumentError('Correct count $correctCount cannot exceed reviewed count $reviewedCount');
    }
    if (incorrectCount < 0 || incorrectCount > reviewedCount) {
      throw ArgumentError('Incorrect count $incorrectCount cannot exceed reviewed count $reviewedCount');
    }
    if (correctCount + incorrectCount != reviewedCount) {
      throw ArgumentError('Sum of correct and incorrect count must match reviewed count');
    }

    return ReviewSession._(
      id: id,
      queue: queue,
      currentIndex: currentIndex,
      startedAt: startedAt,
      finishedAt: finishedAt,
      reviewedCount: reviewedCount,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
    );
  }

  bool get isCompleted => currentIndex >= queue.cards.length;

  ReviewCard get currentCard {
    if (isCompleted) {
      throw StateError('Cannot retrieve current card of a completed session');
    }
    return queue.cards[currentIndex];
  }

  ReviewSession answerCard(ReviewRating rating, {DateTime? now}) {
    if (isCompleted) {
      throw StateError('Cannot answer card in a completed session');
    }

    final newReviewedCount = reviewedCount + 1;
    final newCorrectCount = correctCount + (rating.isCorrect ? 1 : 0);
    final newIncorrectCount = incorrectCount + (rating.isCorrect ? 0 : 1);
    final newIndex = currentIndex + 1;

    DateTime? newFinishedAt = finishedAt;
    if (newIndex >= queue.cards.length) {
      newFinishedAt = now;
    }

    return ReviewSession(
      id: id,
      queue: queue,
      startedAt: startedAt,
      finishedAt: newFinishedAt,
      currentIndex: newIndex,
      reviewedCount: newReviewedCount,
      correctCount: newCorrectCount,
      incorrectCount: newIncorrectCount,
    );
  }
}
