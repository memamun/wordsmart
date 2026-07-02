import '../../../../features/dictionary/domain/entities/word.dart';

enum QuestionType {
  definitionMCQ,
  synonymMCQ,
  antonymMCQ,
  spelling,
  sentenceCompletion,
}

enum PracticeMode {
  mixed,
  definition,
  synonym,
  antonym,
  spelling,
  sentenceCompletion,
}

class PracticeQuestion {
  final Word word;
  final QuestionType type;
  final String prompt;
  final List<String> options;
  final String correctAnswer;

  const PracticeQuestion({
    required this.word,
    required this.type,
    required this.prompt,
    required this.options,
    required this.correctAnswer,
  });
}
