class PracticeSummary {
  final String sessionId;
  final int totalQuestions;
  final int correctAnswers;
  final int incorrectAnswers;
  final double accuracy;
  final Duration totalDuration;

  const PracticeSummary({
    required this.sessionId,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.incorrectAnswers,
    required this.accuracy,
    required this.totalDuration,
  });
}
