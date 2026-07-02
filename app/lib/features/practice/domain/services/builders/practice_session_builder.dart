import 'dart:math';
import '../../../review/domain/entities/review_card.dart';
import '../../entities/practice_question.dart';
import '../../entities/practice_session.dart';
import '../factory/question_generator_factory.dart';
import '../../../../dictionary/domain/entities/word.dart';

class PracticeSessionBuilder {
  final QuestionGeneratorFactory generatorFactory;

  const PracticeSessionBuilder({required this.generatorFactory});

  PracticeSession build({
    required String id,
    required List<ReviewCard> reviewCards,
    required PracticeMode mode,
    required List<Word> pool,
    required DateTime startedAt,
    Random? random,
  }) {
    final List<PracticeQuestion> questions = [];
    final rand = random ?? Random();

    for (int i = 0; i < reviewCards.length; i++) {
      final card = reviewCards[i];
      final targetType = _getTargetType(mode, i, rand);
      
      try {
        final generator = generatorFactory.getGenerator(targetType);
        final question = generator.generate(card.word, pool);
        questions.add(question);
      } catch (_) {
        // Fallback Step 1: Try Definition MCQ
        try {
          final generator = generatorFactory.getGenerator(QuestionType.definitionMCQ);
          final question = generator.generate(card.word, pool);
          questions.add(question);
        } catch (_) {
          // Fallback Step 2: Try Spelling (guaranteed to succeed since every word spelling exists)
          try {
            final generator = generatorFactory.getGenerator(QuestionType.spelling);
            final question = generator.generate(card.word, pool);
            questions.add(question);
          } catch (_) {
            // Unlikely to ever fail, but ignore card if so
          }
        }
      }
    }

    return PracticeSession(
      id: id,
      questions: questions,
      startedAt: startedAt,
    );
  }

  QuestionType _getTargetType(PracticeMode mode, int index, Random random) {
    switch (mode) {
      case PracticeMode.definition:
        return QuestionType.definitionMCQ;
      case PracticeMode.synonym:
        return QuestionType.synonymMCQ;
      case PracticeMode.antonym:
        return QuestionType.antonymMCQ;
      case PracticeMode.spelling:
        return QuestionType.spelling;
      case PracticeMode.sentenceCompletion:
        return QuestionType.sentenceCompletion;
      case PracticeMode.mixed:
        // Balanced cyclical selection to keep formatting diverse
        final types = [
          QuestionType.definitionMCQ,
          QuestionType.spelling,
          QuestionType.sentenceCompletion,
          QuestionType.synonymMCQ,
          QuestionType.antonymMCQ,
        ];
        return types[index % types.length];
    }
  }
}
