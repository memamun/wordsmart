import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/dictionary/domain/entities/word_example.dart';
import '../../../../../lib/features/practice/domain/entities/practice_question.dart';
import '../../../../../lib/features/practice/domain/services/distractors/distractor_provider.dart';
import '../../../../../lib/features/practice/domain/services/generators/definition_generator.dart';
import '../../../../../lib/features/practice/domain/services/generators/spelling_generator.dart';
import '../../../../../lib/features/practice/domain/services/generators/synonym_generator.dart';
import '../../../../../lib/features/practice/domain/services/generators/sentence_completion_generator.dart';

void main() {
  const distractorProvider = BasicDistractorProvider();

  final tWord1 = Word(
    id: 1,
    word: 'ABATE',
    definition: 'to reduce in amount or intensity',
    partOfSpeech: 'verb',
    synonyms: ['lessen', 'decrease'],
    examples: [WordExample(id: 1, sentence: 'The storm began to abate.')],
  );

  final tWord2 =
      Word(id: 2, word: 'ABHOR', definition: 'to hate', partOfSpeech: 'verb');
  final tWord3 = Word(
      id: 3, word: 'ACME', definition: 'highest point', partOfSpeech: 'noun');
  final tWord4 = Word(
      id: 4,
      word: 'ACRE',
      definition: 'unit of land area',
      partOfSpeech: 'noun');
  final pool = [tWord1, tWord2, tWord3, tWord4];

  group('Question Generators Strategy Tests', () {
    test(
        'DefinitionQuestionGenerator should generate MCQ definition match with 4 unique options',
        () {
      final generator =
          DefinitionQuestionGenerator(distractorProvider: distractorProvider);
      final question = generator.generate(tWord1, pool);

      expect(question.type, QuestionType.definitionMCQ);
      expect(question.options.length, 4);
      expect(question.options.contains(question.correctAnswer), true);
      expect(question.options.toSet().length, 4); // Check uniqueness
    });

    test('SpellingQuestionGenerator should create blank typing prompt', () {
      const generator = SpellingQuestionGenerator();
      final question = generator.generate(tWord1, pool);

      expect(question.type, QuestionType.spelling);
      expect(question.options, isEmpty);
      expect(question.correctAnswer, 'abate');
    });

    test(
        'SentenceCompletionQuestionGenerator should blank correct spelling match',
        () {
      final generator = SentenceCompletionQuestionGenerator(
          distractorProvider: distractorProvider);
      final question = generator.generate(tWord1, pool);

      expect(question.type, QuestionType.sentenceCompletion);
      expect(question.prompt.contains('______'), true);
      expect(question.options.contains('ABATE'), true);
    });

    test(
        'SynonymQuestionGenerator should throw UnsupportedError if word has no synonyms',
        () {
      final generator =
          SynonymQuestionGenerator(distractorProvider: distractorProvider);
      expect(() => generator.generate(tWord2, pool), throwsUnsupportedError);
    });
  });
}
