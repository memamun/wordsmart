import '../../error/exceptions.dart';
import 'word_example.dart';
import 'word_derivative.dart';
import 'word_root.dart';

class Word {
  final int id;
  final String word;
  final String? definition;
  final String? bengaliMeaning;
  final String? pronunciation;
  final String? partOfSpeech;
  final String? level;
  final String? audioPath;
  final String? mnemonic;
  final String? additionalExample;
  final String? additionalExampleBengali;
  final String? mnemonicHint;
  final List<String>? synonyms;
  final List<String>? antonyms;
  final List<String>? collocations;
  final List<WordExample>? examples;
  final List<WordDerivative>? derivatives;
  final List<WordRoot>? roots;

  const Word._({
    required this.id,
    required this.word,
    this.definition,
    this.bengaliMeaning,
    this.pronunciation,
    this.partOfSpeech,
    this.level,
    this.audioPath,
    this.mnemonic,
    this.additionalExample,
    this.additionalExampleBengali,
    this.mnemonicHint,
    this.synonyms,
    this.antonyms,
    this.collocations,
    this.examples,
    this.derivatives,
    this.roots,
  });

  factory Word({
    required int id,
    required String word,
    String? definition,
    String? bengaliMeaning,
    String? pronunciation,
    String? partOfSpeech,
    String? level,
    String? audioPath,
    String? mnemonic,
    String? additionalExample,
    String? additionalExampleBengali,
    String? mnemonicHint,
    List<String>? synonyms,
    List<String>? antonyms,
    List<String>? collocations,
    List<WordExample>? examples,
    List<WordDerivative>? derivatives,
    List<WordRoot>? roots,
  }) {
    if (id <= 0) {
      throw InvalidWordException(
        'Word id must be greater than zero. Received: $id',
      );
    }
    if (word.trim().isEmpty) {
      throw InvalidWordException(
        'Word spelling cannot be empty. Received: "$word"',
      );
    }
    return Word._(
      id: id,
      word: word,
      definition: definition,
      bengaliMeaning: bengaliMeaning,
      pronunciation: pronunciation,
      partOfSpeech: partOfSpeech,
      level: level,
      audioPath: audioPath,
      mnemonic: mnemonic,
      additionalExample: additionalExample,
      additionalExampleBengali: additionalExampleBengali,
      mnemonicHint: mnemonicHint,
      synonyms: synonyms,
      antonyms: antonyms,
      collocations: collocations,
      examples: examples,
      derivatives: derivatives,
      roots: roots,
    );
  }

  bool get hasAudio => audioPath != null && audioPath!.isNotEmpty;
  bool get hasMnemonic => mnemonic != null && mnemonic!.trim().isNotEmpty;
  bool get isAdvanced => level?.toLowerCase() == 'advanced';
  bool get isStub => definition == null || definition!.trim().isEmpty;
  bool get synonymsLoaded => synonyms != null;
  bool get antonymsLoaded => antonyms != null;
  bool get collocationsLoaded => collocations != null;
  bool get examplesLoaded => examples != null;
  bool get derivativesLoaded => derivatives != null;
  bool get rootsLoaded => roots != null;
}
