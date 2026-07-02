import '../../../../dictionary/domain/entities/word.dart';
import '../../entities/practice_question.dart';
import '../distractors/distractor_provider.dart';
import 'question_generator.dart';

class SynonymQuestionGenerator implements QuestionGenerator {
  final DistractorProvider distractorProvider;

  const SynonymQuestionGenerator({required this.distractorProvider});

  @override
  PracticeQuestion generate(Word word, List<Word> pool) {
    if (word.synonyms == null || word.synonyms!.isEmpty) {
      throw UnsupportedError(
          'Word "${word.word}" has no synonyms to generate synonym question.');
    }

    final correct = word.synonyms!.first;
    final distractors = distractorProvider.getSynonymDistractors(word, pool, 3);

    final options = [correct, ...distractors]..shuffle();

    return PracticeQuestion(
      word: word,
      type: QuestionType.synonymMCQ,
      prompt: 'Select the synonym for the word "${word.word.toUpperCase()}":',
      options: options,
      correctAnswer: correct,
    );
  }
}
