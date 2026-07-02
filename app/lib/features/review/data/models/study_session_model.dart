class StudySessionModel {
  final String id;
  final String mode;
  final String startedAt;
  final String finishedAt;
  final int reviewedCards;
  final int correctAnswers;
  final int incorrectAnswers;
  final int durationSeconds;

  const StudySessionModel({
    required this.id,
    required this.mode,
    required this.startedAt,
    required this.finishedAt,
    required this.reviewedCards,
    required this.correctAnswers,
    required this.incorrectAnswers,
    required this.durationSeconds,
  });

  factory StudySessionModel.fromMap(Map<String, dynamic> map) {
    return StudySessionModel(
      id: map['id'] as String,
      mode: map['mode'] as String,
      startedAt: map['started_at'] as String,
      finishedAt: map['finished_at'] as String,
      reviewedCards: map['reviewed_cards'] as int,
      correctAnswers: map['correct_answers'] as int,
      incorrectAnswers: map['incorrect_answers'] as int,
      durationSeconds: map['duration_seconds'] as int,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'mode': mode,
      'started_at': startedAt,
      'finished_at': finishedAt,
      'reviewed_cards': reviewedCards,
      'correct_answers': correctAnswers,
      'incorrect_answers': incorrectAnswers,
      'duration_seconds': durationSeconds,
    };
  }
}
