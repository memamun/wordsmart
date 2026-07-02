import '../../entities/practice_question.dart';
import '../distractors/distractor_provider.dart';
import '../generators/question_generator.dart';
import '../generators/definition_generator.dart';
import '../generators/synonym_generator.dart';
import '../generators/antonym_generator.dart';
import '../generators/spelling_generator.dart';
import '../generators/sentence_completion_generator.dart';

class QuestionGeneratorFactory {
  final DistractorProvider distractorProvider;

  const QuestionGeneratorFactory({required this.distractorProvider});

  QuestionGenerator getGenerator(QuestionType type) {
    switch (type) {
      case QuestionType.definitionMCQ:
        return DefinitionQuestionGenerator(distractorProvider: distractorProvider);
      case QuestionType.synonymMCQ:
        return SynonymQuestionGenerator(distractorProvider: distractorProvider);
      case QuestionType.antonymMCQ:
        return AntonymQuestionGenerator(distractorProvider: distractorProvider);
      case QuestionType.spelling:
        return const SpellingQuestionGenerator();
      case QuestionType.sentenceCompletion:
        return SentenceCompletionQuestionGenerator(distractorProvider: distractorProvider);
    }
  }
}
