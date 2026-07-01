class WordRootModel {
  final String root;
  final String meaning;

  const WordRootModel({
    required this.root,
    required this.meaning,
  });

  factory WordRootModel.fromDatabase(Map<String, dynamic> map) {
    return WordRootModel(
      root: map['root'] as String,
      meaning: map['meaning'] as String,
    );
  }

  Map<String, dynamic> toDatabaseMap() {
    return {
      'root': root,
      'meaning': meaning,
    };
  }
}
