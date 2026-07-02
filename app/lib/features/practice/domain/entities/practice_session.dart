import 'practice_question.dart';
import 'practice_answer.dart';

class PracticeSession {
  final String id;
  final List<PracticeQuestion> questions;
  final DateTime startedAt;
  final List<PracticeAnswer> answers;
  int _currentIndex = 0;

  PracticeSession({
    required this.id,
    required this.questions,
    required this.startedAt,
  }) : answers = [];

  int get currentIndex => _currentIndex;
  bool get isFinished => _currentIndex >= questions.length;
  PracticeQuestion get currentQuestion => questions[_currentIndex];

  void answerQuestion(String userAnswer, bool isCorrect, Duration duration) {
    if (isFinished) return;
    answers.add(PracticeAnswer(
      questionId: '${id}_$_currentIndex',
      userAnswer: userAnswer,
      isCorrect: isCorrect,
      duration: duration,
    ));
  }

  void nextQuestion() {
    if (!isFinished) {
      _currentIndex++;
    }
  }

  int get correctAnswersCount => answers.where((a) => a.isCorrect).length;
  int get incorrectAnswersCount => answers.where((a) => !a.isCorrect).length;
}
