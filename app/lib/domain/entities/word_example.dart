import '../exceptions/exceptions.dart';

class WordExample {
  final int id;
  final String sentence;
  final String translation;

  WordExample({
    required this.id,
    required this.sentence,
    required this.translation,
  }) {
    if (id <= 0) {
      throw const InvalidWordExampleException('ID must be a positive integer.');
    }
    if (sentence.trim().isEmpty) {
      throw const InvalidWordExampleException('Sentence cannot be empty.');
    }
    if (translation.trim().isEmpty) {
      throw const InvalidWordExampleException('Translation cannot be empty.');
    }
  }
}
