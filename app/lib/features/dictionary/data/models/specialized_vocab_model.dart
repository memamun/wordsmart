import 'dart:convert';

class SpecializedVocabModel {
  final int chapterNumber;
  final String chapterTitle;
  final String term;
  final String definition;
  final String examples;

  const SpecializedVocabModel({
    required this.chapterNumber,
    required this.chapterTitle,
    required this.term,
    required this.definition,
    required this.examples,
  });

  factory SpecializedVocabModel.fromDatabase(Map<String, dynamic> map) {
    return SpecializedVocabModel(
      chapterNumber: map['chapter_number'] as int,
      chapterTitle: map['chapter_title'] as String,
      term: map['term'] as String,
      definition: map['definition'] as String,
      examples: map['examples'] as String,
    );
  }

  List<dynamic> get examplesList => jsonDecode(examples) as List<dynamic>;

  Map<String, dynamic> toDatabaseMap() {
    return {
      'chapter_number': chapterNumber,
      'chapter_title': chapterTitle,
      'term': term,
      'definition': definition,
      'examples': examples,
    };
  }
}
