import 'dart:convert';

class McqQuizModel {
  final int quizId;
  final String quizTitle;
  final String questions;

  const McqQuizModel({
    required this.quizId,
    required this.quizTitle,
    required this.questions,
  });

  factory McqQuizModel.fromDatabase(Map<String, dynamic> map) {
    return McqQuizModel(
      quizId: map['quiz_id'] as int,
      quizTitle: map['quiz_title'] as String,
      questions: map['questions'] as String,
    );
  }

  List<dynamic> get questionsList => jsonDecode(questions) as List<dynamic>;

  Map<String, dynamic> toDatabaseMap() {
    return {
      'quiz_id': quizId,
      'quiz_title': quizTitle,
      'questions': questions,
    };
  }
}
