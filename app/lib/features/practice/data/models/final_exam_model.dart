import 'dart:convert';

class FinalExamModel {
  final int drillNumber;
  final String drillTitle;
  final String drillType;
  final String instructions;
  final String questions;
  final String answers;

  const FinalExamModel({
    required this.drillNumber,
    required this.drillTitle,
    required this.drillType,
    required this.instructions,
    required this.questions,
    required this.answers,
  });

  factory FinalExamModel.fromDatabase(Map<String, dynamic> map) {
    return FinalExamModel(
      drillNumber: map['drill_number'] as int,
      drillTitle: map['drill_title'] as String,
      drillType: map['drill_type'] as String,
      instructions: map['instructions'] as String,
      questions: map['questions'] as String,
      answers: map['answers'] as String,
    );
  }

  List<dynamic> get questionsList => jsonDecode(questions) as List<dynamic>;

  Map<String, dynamic> get answersMap =>
      Map<String, dynamic>.from(jsonDecode(answers) as Map);

  Map<String, dynamic> toDatabaseMap() {
    return {
      'drill_number': drillNumber,
      'drill_title': drillTitle,
      'drill_type': drillType,
      'instructions': instructions,
      'questions': questions,
      'answers': answers,
    };
  }
}
