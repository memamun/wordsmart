import 'word_example.dart';
import 'word_derivative.dart';
import 'word_root.dart';

class Word {
  final int id;
  final String word;
  final String? definition;
  final String? bengaliMeaning;
  
  // Optional Core Fields
  final String? pronunciation;
  final String? partOfSpeech;
  final String? level;
  final String? audioPath;
  final String? mnemonic;

  // Lazy Loaded Relationships (null = Unloaded, empty list = Loaded but empty)
  final List<String>? synonyms;
  final List<String>? antonyms;
  final List<String>? collocations;
  final List<WordExample>? examples;
  final List<WordDerivative>? derivatives;
  final List<WordRoot>? roots;

  const Word({
    required this.id,
    required this.word,
    this.definition,
    this.bengaliMeaning,
    this.pronunciation,
    this.partOfSpeech,
    this.level,
    this.audioPath,
    this.mnemonic,
    this.synonyms,
    this.antonyms,
    this.collocations,
    this.examples,
    this.derivatives,
    this.roots,
  }) : assert(id > 0, 'ID must be a positive integer.'),
       assert(word.length > 0, 'Word spelling cannot be empty.');

  // Word CAN (Intrinsic Business Logic getters utilizing only internal fields)

  /// Tells if the word has a valid audio pronunciation path.
  bool get hasAudio => audioPath != null && audioPath!.isNotEmpty;

  /// Tells if the word has a mnemonic hint defined.
  bool get hasMnemonic => mnemonic != null && mnemonic!.trim().isNotEmpty;

  /// Tells if the word level is advanced.
  bool get isAdvanced => level?.toLowerCase() == 'advanced';

  /// Tells if this word is a stub entry (does not have a full definition).
  bool get isStub => definition == null || definition!.trim().isEmpty;

  // Relationship loading checks (null means unloaded)
  bool get synonymsLoaded => synonyms != null;
  bool get antonymsLoaded => antonyms != null;
  bool get collocationsLoaded => collocations != null;
  bool get examplesLoaded => examples != null;
  bool get derivativesLoaded => derivatives != null;
  bool get rootsLoaded => roots != null;
}
