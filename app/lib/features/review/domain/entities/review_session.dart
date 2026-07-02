import '../../../../core/learning/entities/learning_card.dart';
import 'review_queue.dart';
import 'study_session.dart';
import 'value_objects.dart';

class ReviewSession {
  final String id;
  final ReviewQueue queue;
  final String mode;
  final int currentIndex;
  final DateTime startedAt;
  final DateTime? finishedAt;
  final int reviewedCount;
  final int correctCount;
  final int incorrectCount;

  ReviewSession._({
    required this.id,
    required this.queue,
    required this.mode,
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
    String mode = 'review',
    int currentIndex = 0,
    int reviewedCount = 0,
    int correctCount = 0,
    int incorrectCount = 0,
  }) {
    if (id.isEmpty) {
      throw ArgumentError('Session ID cannot be empty');
    }
    if (currentIndex < 0 || currentIndex > queue.cards.length) {
      throw ArgumentError(
          'Current index $currentIndex is out of bounds for queue size ${queue.cards.length}');
    }
    if (reviewedCount < 0 || reviewedCount > queue.cards.length) {
      throw ArgumentError(
          'Reviewed count $reviewedCount cannot exceed queue size ${queue.cards.length}');
    }
    if (correctCount < 0 || correctCount > reviewedCount) {
      throw ArgumentError(
          'Correct count $correctCount cannot exceed reviewed count $reviewedCount');
    }
    if (incorrectCount < 0 || incorrectCount > reviewedCount) {
      throw ArgumentError(
          'Incorrect count $incorrectCount cannot exceed reviewed count $reviewedCount');
    }
    if (correctCount + incorrectCount != reviewedCount) {
      throw ArgumentError(
          'Sum of correct and incorrect count must match reviewed count');
    }

    return ReviewSession._(
      id: id,
      queue: queue,
      mode: mode,
      currentIndex: currentIndex,
      startedAt: startedAt,
      finishedAt: finishedAt,
      reviewedCount: reviewedCount,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
    );
  }

  bool get isCompleted => currentIndex >= queue.cards.length;

  int get correctAnswers => correctCount;
  bool get isFinished => isCompleted;

  LearningCard get currentCard {
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

  ReviewSession answer({required bool isCorrect}) {
    return ReviewSession(
      id: id,
      queue: queue,
      mode: mode,
      startedAt: startedAt,
      finishedAt: finishedAt,
      currentIndex: currentIndex + 1,
      reviewedCount: reviewedCount + 1,
      correctCount: correctCount + (isCorrect ? 1 : 0),
      incorrectCount: incorrectCount + (isCorrect ? 0 : 1),
    );
  }

  ReviewSession nextCard() {
    return ReviewSession(
      id: id,
      queue: queue,
      mode: mode,
      startedAt: startedAt,
      finishedAt: finishedAt,
      currentIndex: currentIndex + 1,
      reviewedCount: reviewedCount,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
    );
  }

  StudySession toStudySession(DateTime now) => StudySession(
        id: id,
        mode: ReviewMode.review,
        startedAt: startedAt,
        finishedAt: now,
        reviewedCards: reviewedCount,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        duration: StudyDuration(now.difference(startedAt)),
      );
}
