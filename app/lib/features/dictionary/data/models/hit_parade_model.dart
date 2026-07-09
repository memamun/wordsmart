class HitParadeModel {
  final String listName;
  final int wordId;
  final int rank;
  final String word;

  const HitParadeModel({
    required this.listName,
    required this.wordId,
    required this.rank,
    required this.word,
  });

  factory HitParadeModel.fromDatabase(Map<String, dynamic> map) {
    return HitParadeModel(
      listName: map['list_name'] as String,
      wordId: map['word_id'] as int,
      rank: map['rank'] as int,
      word: map['word'] as String,
    );
  }

  Map<String, dynamic> toDatabaseMap() {
    return {
      'list_name': listName,
      'word_id': wordId,
      'rank': rank,
      'word': word,
    };
  }
}
