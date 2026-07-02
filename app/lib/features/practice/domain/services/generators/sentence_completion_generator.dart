import '../../../../dictionary/domain/entities/word.dart';
import '../../entities/practice_question.dart';
import '../distractors/distractor_provider.dart';
import 'question_generator.dart';

class SentenceCompletionQuestionGenerator implements QuestionGenerator {
  final DistractorProvider distractorProvider;

  const SentenceCompletionQuestionGenerator({required this.distractorProvider});

  @override
  PracticeQuestion generate(Word word, List<Word> pool) {
    if (word.examples == null || word.examples!.isEmpty) {
      throw UnsupportedError(
          'Word "${word.word}" has no examples to generate sentence completion.');
    }

    final sentence = word.examples!.first.sentence;
    final regex = RegExp(RegExp.escape(word.word), caseSensitive: false);
    final promptSentence = sentence.replaceAll(regex, '______');

    final correct = word.word.toUpperCase();
    final distractors = distractorProvider.getSynonymDistractors(word, pool, 3);
    final options = [correct, ...distractors.map((d) => d.toUpperCase())]
      ..shuffle();

    return PracticeQuestion(
      word: word,
      type: QuestionType.sentenceCompletion,
      prompt: 'Fill in the blank: "$promptSentence"',
      options: options,
      correctAnswer: correct,
    );
  }
}
