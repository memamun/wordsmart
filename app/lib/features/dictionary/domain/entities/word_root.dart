import '../../../../core/error/exceptions.dart';

class WordRoot {
  final String root;
  final String meaning;

  const WordRoot._({
    required this.root,
    required this.meaning,
  });

  factory WordRoot({
    required String root,
    required String meaning,
  }) {
    if (root.trim().isEmpty) {
      throw const InvalidWordRootException(
        'WordRoot root spelling cannot be empty.',
      );
    }
    if (meaning.trim().isEmpty) {
      throw const InvalidWordRootException(
        'WordRoot root meaning cannot be empty.',
      );
    }
    return WordRoot._(
      root: root,
      meaning: meaning,
    );
  }
}
