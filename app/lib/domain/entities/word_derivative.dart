class WordDerivative {
  final String derivative;
  final String partOfSpeech;

  const WordDerivative({
    required this.derivative,
    required this.partOfSpeech,
  }) : assert(derivative.length > 0, 'Derivative spelling cannot be empty.'),
       assert(partOfSpeech.length > 0, 'Part of speech cannot be empty.');
}
