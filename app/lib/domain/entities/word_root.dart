import '../exceptions/exceptions.dart';

class WordRoot {
  final String root;
  final String meaning;

  WordRoot({
    required this.root,
    required this.meaning,
  }) {
    if (root.trim().isEmpty) {
      throw const InvalidWordRootException('Root cannot be empty.');
    }
    if (meaning.trim().isEmpty) {
      throw const InvalidWordRootException('Root meaning cannot be empty.');
    }
  }
}
