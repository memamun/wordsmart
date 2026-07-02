import '../../../../dictionary/domain/entities/word.dart';
import '../../entities/practice_question.dart';
import '../distractors/distractor_provider.dart';
import 'question_generator.dart';

class AntonymQuestionGenerator implements QuestionGenerator {
  final DistractorProvider distractorProvider;

  const AntonymQuestionGenerator({required this.distractorProvider});

  @override
  PracticeQuestion generate(Word word, List<Word> pool) {
    if (word.antonyms == null || word.antonyms!.isEmpty) {
      throw UnsupportedError('Word "${word.word}" has no antonyms to generate antonym question.');
    }

    final correct = word.antonyms!.first;
    final distractors = distractorProvider.getAntonymDistractors(word, pool, 3);
    
    final options = [correct, ...distractors]..shuffle();

    return PracticeQuestion(
      word: word,
      type: QuestionType.antonymMCQ,
      prompt: 'Select the antonym for the word "${word.word.toUpperCase()}":',
      options: options,
      correctAnswer: correct,
    );
  }
}
