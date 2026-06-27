class WordDerivativeModel {
  final int id;
  final int wordId;
  final String derivativeWord;
  final String partOfSpeech;

  const WordDerivativeModel({
    required this.id,
    required this.wordId,
    required this.derivativeWord,
    required this.partOfSpeech,
  });

  factory WordDerivativeModel.fromDatabase(Map<String, dynamic> map) {
    return WordDerivativeModel(
      id: map['id'] as int,
      wordId: map['word_id'] as int,
      derivativeWord: map['derivative_word'] as String,
      partOfSpeech: map['part_of_speech'] as String,
    );
  }

  Map<String, dynamic> toDatabaseMap() {
    return {
      'id': id,
      'word_id': wordId,
      'derivative_word': derivativeWord,
      'part_of_speech': partOfSpeech,
    };
  }
}
