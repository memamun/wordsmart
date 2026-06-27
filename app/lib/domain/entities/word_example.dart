import '../exceptions/exceptions.dart';

class WordExample {
  final int id;
  final String sentence;
  final String translation;

  const WordExample._({
    required this.id,
    required this.sentence,
    required this.translation,
  });

  factory WordExample({
    required int id,
    required String sentence,
    required String translation,
  }) {
    if (id <= 0) {
      throw InvalidWordExampleException(
        'WordExample id must be greater than zero. Received: $id',
      );
    }
    if (sentence.trim().isEmpty) {
      throw const InvalidWordExampleException(
        'WordExample sentence cannot be empty.',
      );
    }
    if (translation.trim().isEmpty) {
      throw const InvalidWordExampleException(
        'WordExample translation cannot be empty.',
      );
    }
    return WordExample._(
      id: id,
      sentence: sentence,
      translation: translation,
    );
  }
}
