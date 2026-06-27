import '../exceptions/exceptions.dart';

class WordDerivative {
  final String derivative;
  final String partOfSpeech;

  const WordDerivative._({
    required this.derivative,
    required this.partOfSpeech,
  });

  factory WordDerivative({
    required String derivative,
    required String partOfSpeech,
  }) {
    if (derivative.trim().isEmpty) {
      throw const InvalidWordDerivativeException(
        'WordDerivative spelling cannot be empty.',
      );
    }
    if (partOfSpeech.trim().isEmpty) {
      throw const InvalidWordDerivativeException(
        'WordDerivative part of speech cannot be empty.',
      );
    }
    return WordDerivative._(
      derivative: derivative,
      partOfSpeech: partOfSpeech,
    );
  }
}
