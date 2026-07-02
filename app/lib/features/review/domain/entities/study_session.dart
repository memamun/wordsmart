import '../../../../core/learning/entities/learning_value_objects.dart';

class StudySession {
  final String id;
  final ReviewMode mode;
  final DateTime startedAt;
  final DateTime finishedAt;
  final int reviewedCards;
  final int correctAnswers;
  final int incorrectAnswers;
  final StudyDuration duration;

  const StudySession._({
    required this.id,
    required this.mode,
    required this.startedAt,
    required this.finishedAt,
    required this.reviewedCards,
    required this.correctAnswers,
    required this.incorrectAnswers,
    required this.duration,
  });

  factory StudySession({
    required String id,
    required ReviewMode mode,
    required DateTime startedAt,
    required DateTime finishedAt,
    required int reviewedCards,
    required int correctAnswers,
    required int incorrectAnswers,
    required StudyDuration duration,
  }) {
    if (id.isEmpty) {
      throw ArgumentError('Session ID cannot be empty');
    }
    if (finishedAt.isBefore(startedAt)) {
      throw ArgumentError('Finished date cannot be before started date');
    }
    if (reviewedCards < 0) {
      throw ArgumentError('Reviewed cards cannot be negative');
    }
    if (correctAnswers < 0 || correctAnswers > reviewedCards) {
      throw ArgumentError(
          'Correct answers count ($correctAnswers) cannot exceed reviewed cards count ($reviewedCards)');
    }
    if (incorrectAnswers < 0 || incorrectAnswers > reviewedCards) {
      throw ArgumentError(
          'Incorrect answers count ($incorrectAnswers) cannot exceed reviewed cards count ($reviewedCards)');
    }
    if (correctAnswers + incorrectAnswers > reviewedCards) {
      throw ArgumentError(
          'Sum of correct and incorrect answers cannot exceed reviewed cards');
    }
    return StudySession._(
      id: id,
      mode: mode,
      startedAt: startedAt,
      finishedAt: finishedAt,
      reviewedCards: reviewedCards,
      correctAnswers: correctAnswers,
      incorrectAnswers: incorrectAnswers,
      duration: duration,
    );
  }
}
