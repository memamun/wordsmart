import 'dart:convert';

class VocabDrillModel {
  final int wordId;
  final String bengaliMeaning;
  final String spelling;
  final String definitionMcq;
  final String synonymMcq;
  final String antonymMcq;
  final String sentenceCompletion;

  const VocabDrillModel({
    required this.wordId,
    required this.bengaliMeaning,
    required this.spelling,
    required this.definitionMcq,
    required this.synonymMcq,
    required this.antonymMcq,
    required this.sentenceCompletion,
  });

  factory VocabDrillModel.fromDatabase(Map<String, dynamic> map) {
    return VocabDrillModel(
      wordId: map['word_id'] as int,
      bengaliMeaning: map['bengali_meaning'] as String,
      spelling: map['spelling'] as String,
      definitionMcq: map['definition_mcq'] as String,
      synonymMcq: map['synonym_mcq'] as String,
      antonymMcq: map['antonym_mcq'] as String,
      sentenceCompletion: map['sentence_completion'] as String,
    );
  }

  List<String> get spellingOptions =>
      (jsonDecode(spelling) as List<dynamic>).cast<String>();

  List<Map<String, dynamic>> get definitionMcqQuestions =>
      (jsonDecode(definitionMcq) as List<dynamic>)
          .cast<Map<String, dynamic>>();

  List<Map<String, dynamic>> get synonymMcqQuestions =>
      (jsonDecode(synonymMcq) as List<dynamic>)
          .cast<Map<String, dynamic>>();

  List<Map<String, dynamic>> get antonymMcqQuestions =>
      (jsonDecode(antonymMcq) as List<dynamic>)
          .cast<Map<String, dynamic>>();

  List<Map<String, dynamic>> get sentenceCompletionQuestions =>
      (jsonDecode(sentenceCompletion) as List<dynamic>)
          .cast<Map<String, dynamic>>();

  Map<String, dynamic> toDatabaseMap() {
    return {
      'word_id': wordId,
      'bengali_meaning': bengaliMeaning,
      'spelling': spelling,
      'definition_mcq': definitionMcq,
      'synonym_mcq': synonymMcq,
      'antonym_mcq': antonymMcq,
      'sentence_completion': sentenceCompletion,
    };
  }
}
