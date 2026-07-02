import '../../../../dictionary/domain/entities/word.dart';
import '../../entities/practice_question.dart';
import '../distractors/distractor_provider.dart';
import 'question_generator.dart';

class DefinitionQuestionGenerator implements QuestionGenerator {
  final DistractorProvider distractorProvider;

  const DefinitionQuestionGenerator({required this.distractorProvider});

  @override
  PracticeQuestion generate(Word word, List<Word> pool) {
    final correct = word.definition ?? 'No definition';
    final distractors = distractorProvider.getDefinitionDistractors(word, pool, 3);
    
    final options = [correct, ...distractors]..shuffle();

    return PracticeQuestion(
      word: word,
      type: QuestionType.definitionMCQ,
      prompt: 'What is the correct definition of the word "${word.word.toUpperCase()}"?',
      options: options,
      correctAnswer: correct,
    );
  }
}
