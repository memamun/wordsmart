class WordExampleModel {
  final int id;
  final int wordId;
  final String exampleText;

  const WordExampleModel({
    required this.id,
    required this.wordId,
    required this.exampleText,
  });

  factory WordExampleModel.fromDatabase(Map<String, dynamic> map) {
    return WordExampleModel(
      id: map['id'] as int,
      wordId: map['word_id'] as int,
      exampleText: map['example_text'] as String,
    );
  }

  Map<String, dynamic> toDatabaseMap() {
    return {
      'id': id,
      'word_id': wordId,
      'example_text': exampleText,
    };
  }
}
