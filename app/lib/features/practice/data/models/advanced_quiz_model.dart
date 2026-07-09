import 'dart:convert';

class AdvancedQuizModel {
  final int quizId;
  final String quizTitle;
  final String analogies;
  final String sentenceCompletions;
  final String contextualLexical;

  const AdvancedQuizModel({
    required this.quizId,
    required this.quizTitle,
    required this.analogies,
    required this.sentenceCompletions,
    required this.contextualLexical,
  });

  factory AdvancedQuizModel.fromDatabase(Map<String, dynamic> map) {
    return AdvancedQuizModel(
      quizId: map['quiz_id'] as int,
      quizTitle: map['quiz_title'] as String,
      analogies: map['analogies'] as String,
      sentenceCompletions: map['sentence_completions'] as String,
      contextualLexical: map['contextual_lexical'] as String,
    );
  }

  List<dynamic> get analogiesList => jsonDecode(analogies) as List<dynamic>;

  List<dynamic> get sentenceCompletionsList =>
      jsonDecode(sentenceCompletions) as List<dynamic>;

  List<dynamic> get contextualLexicalList =>
      jsonDecode(contextualLexical) as List<dynamic>;

  Map<String, dynamic> toDatabaseMap() {
    return {
      'quiz_id': quizId,
      'quiz_title': quizTitle,
      'analogies': analogies,
      'sentence_completions': sentenceCompletions,
      'contextual_lexical': contextualLexical,
    };
  }
}
