import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/practice/domain/entities/practice_question.dart';
import '../../../../../lib/features/practice/domain/entities/practice_session.dart';

void main() {
  final tWord = Word(id: 1, word: 'ABATE');
  final question1 = PracticeQuestion(
    word: tWord,
    type: QuestionType.definitionMCQ,
    prompt: 'Select the definition of ABATE',
    options: ['to decrease', 'to increase', 'to slide', 'to jump'],
    correctAnswer: 'to decrease',
  );

  group('PracticeSession Domain Entities', () {
    test('should initialize session with 0 index and progress correctly', () {
      final session = PracticeSession(
        id: 's1',
        questions: [question1],
        startedAt: DateTime(2026, 7, 2),
      );

      expect(session.currentIndex, 0);
      expect(session.isFinished, false);
      expect(session.currentQuestion, question1);

      session.answerQuestion('to decrease', true, const Duration(seconds: 5));
      expect(session.correctAnswersCount, 1);
      expect(session.incorrectAnswersCount, 0);

      session.nextQuestion();
      expect(session.isFinished, true);
    });
  });
}
