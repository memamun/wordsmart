class PracticeAnswer {
  final String questionId;
  final String userAnswer;
  final bool isCorrect;
  final Duration duration;

  const PracticeAnswer({
    required this.questionId,
    required this.userAnswer,
    required this.isCorrect,
    required this.duration,
  });
}
