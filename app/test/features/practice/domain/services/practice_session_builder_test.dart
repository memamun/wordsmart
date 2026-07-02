import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/practice/domain/entities/practice_question.dart';
import '../../../../../lib/features/practice/domain/services/builders/practice_session_builder.dart';
import '../../../../../lib/features/practice/domain/services/distractors/distractor_provider.dart';
import '../../../../../lib/features/practice/domain/services/factory/question_generator_factory.dart';
import '../../../../../lib/features/review/domain/entities/review_card.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';

void main() {
  const distractorProvider = BasicDistractorProvider();
  const factory = QuestionGeneratorFactory(distractorProvider: distractorProvider);
  const builder = PracticeSessionBuilder(generatorFactory: factory);

  final tWord1 = Word(
    id: 1,
    word: 'ABATE',
    definition: 'to reduce in amount or intensity',
    partOfSpeech: 'verb',
    synonyms: ['lessen'],
  );
  
  final tWord2 = Word(
    id: 2,
    word: 'ABHOR',
    definition: 'to hate',
    partOfSpeech: 'verb',
    // Missing synonyms -> triggers fallback
  );

  final card1 = ReviewCard(
    word: tWord1,
    learningState: LearningState.learning,
    isDue: true,
    priority: ReviewPriority.medium,
    easinessFactor: 2.5,
    intervalDays: 0,
    repetitionCount: 0,
    mode: ReviewMode.newCard,
  );

  final card2 = ReviewCard(
    word: tWord2,
    learningState: LearningState.learning,
    isDue: true,
    priority: ReviewPriority.medium,
    easinessFactor: 2.5,
    intervalDays: 0,
    repetitionCount: 0,
    mode: ReviewMode.newCard,
  );

  final pool = [tWord1, tWord2];
  final now = DateTime(2026, 7, 2);

  group('PracticeSessionBuilder Assembly & Fallbacks', () {
    test('should assemble mixed practice session and fallback on missing synonyms', () {
      final session = builder.build(
        id: 'session-123',
        reviewCards: [card1, card2],
        mode: PracticeMode.mixed,
        pool: pool,
        startedAt: now,
      );

      expect(session.id, 'session-123');
      expect(session.questions.length, 2);
      
      // card1 should generate based on cyclical types
      expect(session.questions[0].word.id, 1);
      
      // card2 (missing synonyms) should successfully fallback to definitionMCQ instead of failing
      expect(session.questions[1].word.id, 2);
      expect(session.questions[1].type, QuestionType.definitionMCQ);
    });

    test('should assemble pure spelling practice session', () {
      final session = builder.build(
        id: 'session-123',
        reviewCards: [card1, card2],
        mode: PracticeMode.spelling,
        pool: pool,
        startedAt: now,
      );

      expect(session.questions.every((q) => q.type == QuestionType.spelling), true);
    });
  });
}
