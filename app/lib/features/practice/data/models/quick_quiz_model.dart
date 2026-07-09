import 'dart:convert';

class QuickQuizModel {
  final int quizId;
  final String quizTitle;
  final String matches;
  final String choices;
  final String answerKey;

  const QuickQuizModel({
    required this.quizId,
    required this.quizTitle,
    required this.matches,
    required this.choices,
    required this.answerKey,
  });

  factory QuickQuizModel.fromDatabase(Map<String, dynamic> map) {
    return QuickQuizModel(
      quizId: map['quiz_id'] as int,
      quizTitle: map['quiz_title'] as String,
      matches: map['matches'] as String,
      choices: map['choices'] as String,
      answerKey: map['answer_key'] as String,
    );
  }

  List<dynamic> get matchesList => jsonDecode(matches) as List<dynamic>;

  Map<String, dynamic> get choicesMap =>
      Map<String, dynamic>.from(jsonDecode(choices) as Map);

  Map<String, dynamic> get answerKeyMap =>
      Map<String, dynamic>.from(jsonDecode(answerKey) as Map);

  Map<String, dynamic> toDatabaseMap() {
    return {
      'quiz_id': quizId,
      'quiz_title': quizTitle,
      'matches': matches,
      'choices': choices,
      'answer_key': answerKey,
    };
  }
}
