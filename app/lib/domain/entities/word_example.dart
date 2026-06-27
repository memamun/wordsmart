class WordExample {
  final int id;
  final String sentence;
  final String translation;

  const WordExample({
    required this.id,
    required this.sentence,
    required this.translation,
  }) : assert(id > 0, 'ID must be a positive integer.'),
       assert(sentence.length > 0, 'Sentence cannot be empty.'),
       assert(translation.length > 0, 'Translation cannot be empty.');
}
