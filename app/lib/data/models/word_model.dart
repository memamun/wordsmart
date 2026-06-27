class WordModel {
  final int id;
  final String word;
  final String? pronunciation;
  final String? partOfSpeech;
  final String? definition;
  final String? bengaliMeaning;
  final String? mnemonic;
  final String? level;
  final String? audioPath;
  final int? quickQuizId;

  const WordModel({
    required this.id,
    required this.word,
    this.pronunciation,
    this.partOfSpeech,
    this.definition,
    this.bengaliMeaning,
    this.mnemonic,
    this.level,
    this.audioPath,
    this.quickQuizId,
  });

  /// Factory constructor to hydrate from SQLite row map.
  factory WordModel.fromDatabase(Map<String, dynamic> map) {
    return WordModel(
      id: map['id'] as int,
      word: map['word'] as String,
      pronunciation: map['pronunciation'] as String?,
      partOfSpeech: map['part_of_speech'] as String?,
      definition: map['definition'] as String?,
      bengaliMeaning: map['bengali_meaning'] as String?,
      mnemonic: map['mnemonic'] as String?,
      level: map['level'] as String?,
      audioPath: map['audio'] as String?,
      quickQuizId: map['quick_quiz_id'] as int?,
    );
  }

  /// Converts the model back to SQLite database insertion format map.
  Map<String, dynamic> toDatabaseMap() {
    return {
      'id': id,
      'word': word,
      'pronunciation': pronunciation,
      'part_of_speech': partOfSpeech,
      'definition': definition,
      'bengali_meaning': bengaliMeaning,
      'mnemonic': mnemonic,
      'level': level,
      'audio': audioPath,
      'quick_quiz_id': quickQuizId,
    };
  }
}
