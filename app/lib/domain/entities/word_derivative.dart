import '../exceptions/exceptions.dart';

class WordDerivative {
  final String derivative;
  final String partOfSpeech;

  WordDerivative({
    required this.derivative,
    required this.partOfSpeech,
  }) {
    if (derivative.trim().isEmpty) {
      throw const InvalidWordDerivativeException('Derivative spelling cannot be empty.');
    }
    if (partOfSpeech.trim().isEmpty) {
      throw const InvalidWordDerivativeException('Part of speech cannot be empty.');
    }
  }
}
