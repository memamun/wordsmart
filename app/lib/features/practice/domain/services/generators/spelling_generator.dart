import '../../../../dictionary/domain/entities/word.dart';
import '../../entities/practice_question.dart';
import 'question_generator.dart';

class SpellingQuestionGenerator implements QuestionGenerator {
  const SpellingQuestionGenerator();

  @override
  PracticeQuestion generate(Word word, List<Word> pool) {
    final definition = word.definition ?? 'No definition available';
    
    return PracticeQuestion(
      word: word,
      type: QuestionType.spelling,
      prompt: 'Type the spelling matching this definition: "$definition"',
      options: const [],
      correctAnswer: word.word.toLowerCase().trim(),
    );
  }
}
