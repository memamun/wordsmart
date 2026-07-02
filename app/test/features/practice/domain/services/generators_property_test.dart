import 'dart:math';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/dictionary/domain/entities/word_example.dart';
import '../../../../../lib/features/practice/domain/entities/practice_question.dart';
import '../../../../../lib/features/practice/domain/services/distractors/distractor_provider.dart';
import '../../../../../lib/features/practice/domain/services/generators/definition_generator.dart';
import '../../../../../lib/features/practice/domain/services/generators/spelling_generator.dart';
import '../../../../../lib/features/practice/domain/services/generators/synonym_generator.dart';
import '../../../../../lib/features/practice/domain/services/generators/antonym_generator.dart';
import '../../../../../lib/features/practice/domain/services/generators/sentence_completion_generator.dart';

void main() {
  const distractorProvider = BasicDistractorProvider();

  final tWord1 = Word(
    id: 1,
    word: 'ABATE',
    definition: 'to reduce in amount or intensity',
    partOfSpeech: 'verb',
    synonyms: ['lessen', 'decrease', 'diminish'],
    antonyms: ['increase', 'amplify'],
    examples: [WordExample(id: 1, sentence: 'The storm began to abate.')],
  );

  final tWord2 = Word(
    id: 2,
    word: 'ABHOR',
    definition: 'to hate',
    partOfSpeech: 'verb',
    synonyms: ['detest', 'loathe'],
    antonyms: ['adore', 'love'],
  );

  final tWord3 = Word(
    id: 3,
    word: 'ACME',
    definition: 'highest point',
    partOfSpeech: 'noun',
    synonyms: ['peak', 'summit', 'pinnacle'],
    antonyms: ['nadir', 'bottom'],
  );

  final tWord4 = Word(
    id: 4,
    word: 'BENEVOLENT',
    definition: 'kind and generous',
    partOfSpeech: 'adjective',
    synonyms: ['kind', 'generous', 'charitable'],
    antonyms: ['malevolent', 'cruel'],
  );

  final tWord5 = Word(
    id: 5,
    word: 'CANDID',
    definition: 'truthful and straightforward',
    partOfSpeech: 'adjective',
    synonyms: ['frank', 'honest', 'open'],
    antonyms: ['deceitful', 'dishonest'],
  );

  final pool = [tWord1, tWord2, tWord3, tWord4, tWord5];

  group('DefinitionQuestionGenerator Property Tests (10000 generations)', () {
    test('should always produce valid MCQ questions', () {
      final generator =
          DefinitionQuestionGenerator(distractorProvider: distractorProvider);
      final random = Random(42);

      for (int i = 0; i < 10000; i++) {
        final word = pool[random.nextInt(pool.length)];
        final question = generator.generate(word, pool);

        expect(question.type, QuestionType.definitionMCQ);
        expect(question.options.length, 4,
            reason: 'MCQ must have exactly 4 options');
        expect(question.options.toSet().length, 4,
            reason: 'All options must be unique');
        expect(question.options.contains(question.correctAnswer), true,
            reason: 'Correct answer must be in options');
        expect(question.correctAnswer.isNotEmpty, true,
            reason: 'Correct answer must not be empty');
      }
    });
  });

  group('SpellingQuestionGenerator Property Tests (10000 generations)', () {
    test('should always produce valid spelling prompts', () {
      final random = Random(42);

      for (int i = 0; i < 10000; i++) {
        final word = pool[random.nextInt(pool.length)];
        const generator = SpellingQuestionGenerator();
        final question = generator.generate(word, pool);

        expect(question.type, QuestionType.spelling);
        expect(question.options, isEmpty,
            reason: 'Spelling questions have no options');
        expect(question.correctAnswer, word.word.toLowerCase(),
            reason: 'Correct answer must be lowercase word');
        expect(question.correctAnswer.isNotEmpty, true,
            reason: 'Correct answer must not be empty');
      }
    });
  });

  group(
      'SentenceCompletionQuestionGenerator Property Tests (10000 generations)',
      () {
    test('should always produce valid sentence completion prompts', () {
      final generator = SentenceCompletionQuestionGenerator(
          distractorProvider: distractorProvider);
      final random = Random(42);

      for (int i = 0; i < 10000; i++) {
        final word = pool[random.nextInt(pool.length)];
        try {
          final question = generator.generate(word, pool);

          expect(question.type, QuestionType.sentenceCompletion);
          expect(question.prompt.contains('______'), true,
              reason: 'Prompt must contain blank');
          expect(question.options.isNotEmpty, true,
              reason: 'Must have options');
          expect(question.options.contains(word.word.toUpperCase()), true,
              reason: 'Correct word must be in options');
          expect(question.correctAnswer, word.word.toUpperCase(),
              reason: 'Correct answer must be uppercase word');
        } on UnsupportedError {
          // Words without examples are expected to throw
        }
      }
    });
  });

  group('SynonymQuestionGenerator Property Tests (10000 generations)', () {
    test('should always produce valid synonym MCQ questions', () {
      final generator =
          SynonymQuestionGenerator(distractorProvider: distractorProvider);
      final random = Random(42);

      for (int i = 0; i < 10000; i++) {
        // Only use words with synonyms
        final wordsWithSynonyms = pool
            .where((w) => w.synonyms != null && w.synonyms!.isNotEmpty)
            .toList();
        if (wordsWithSynonyms.isEmpty) continue;

        final word =
            wordsWithSynonyms[random.nextInt(wordsWithSynonyms.length)];
        final question = generator.generate(word, pool);

        expect(question.type, QuestionType.synonymMCQ);
        expect(question.options.length, 4,
            reason: 'MCQ must have exactly 4 options');
        expect(question.options.toSet().length, 4,
            reason: 'All options must be unique');
        expect(question.options.contains(question.correctAnswer), true,
            reason: 'Correct answer must be in options');
        expect(
            word.synonyms!.contains(question.correctAnswer.toLowerCase()), true,
            reason: 'Correct answer must be a synonym');
      }
    });
  });

  group('AntonymQuestionGenerator Property Tests (10000 generations)', () {
    test('should always produce valid antonym MCQ questions', () {
      final generator =
          AntonymQuestionGenerator(distractorProvider: distractorProvider);
      final random = Random(42);

      for (int i = 0; i < 10000; i++) {
        // Only use words with antonyms
        final wordsWithAntonyms = pool
            .where((w) => w.antonyms != null && w.antonyms!.isNotEmpty)
            .toList();
        if (wordsWithAntonyms.isEmpty) continue;

        final word =
            wordsWithAntonyms[random.nextInt(wordsWithAntonyms.length)];
        final question = generator.generate(word, pool);

        expect(question.type, QuestionType.antonymMCQ);
        expect(question.options.length, 4,
            reason: 'MCQ must have exactly 4 options');
        expect(question.options.toSet().length, 4,
            reason: 'All options must be unique');
        expect(question.options.contains(question.correctAnswer), true,
            reason: 'Correct answer must be in options');
        expect(
            word.antonyms!.contains(question.correctAnswer.toLowerCase()), true,
            reason: 'Correct answer must be an antonym');
      }
    });
  });
}
