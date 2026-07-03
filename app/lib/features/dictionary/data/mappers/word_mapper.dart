import '../../domain/entities/word.dart';
import '../../domain/entities/word_derivative.dart';
import '../../domain/entities/word_example.dart';
import '../../domain/entities/word_root.dart';
import '../models/word_derivative_model.dart';
import '../models/word_example_model.dart';
import '../models/word_model.dart';
import '../models/word_root_model.dart';

extension WordModelMapper on WordModel {
  /// Maps storage model representation to pure Domain Word Entity,
  /// accepting lazy loaded relationship lists if resolved by the repository.
  Word toEntity({
    List<String>? synonyms,
    List<String>? antonyms,
    List<String>? collocations,
    List<WordExample>? examples,
    List<WordDerivative>? derivatives,
    List<WordRoot>? roots,
    String? additionalExample,
    String? additionalExampleBengali,
    String? mnemonicHint,
  }) {
    return Word(
      id: id,
      word: word,
      definition: definition,
      bengaliMeaning: bengaliMeaning,
      pronunciation: pronunciation,
      partOfSpeech: partOfSpeech,
      level: level,
      audioPath: audioPath,
      mnemonic: mnemonic,
      synonyms: synonyms,
      antonyms: antonyms,
      collocations: collocations,
      examples: examples,
      derivatives: derivatives,
      roots: roots,
      additionalExample: additionalExample,
      additionalExampleBengali: additionalExampleBengali,
      mnemonicHint: mnemonicHint,
    );
  }
}

extension WordExampleModelMapper on WordExampleModel {
  /// Maps example storage model to Domain Entity.
  /// Maps translation directly without injecting business fallback strings.
  WordExample toEntity({String? translation}) {
    return WordExample(
      id: id,
      sentence: exampleText,
      translation: translation,
    );
  }
}

extension WordDerivativeModelMapper on WordDerivativeModel {
  /// Maps derivative storage model to Domain Entity.
  WordDerivative toEntity() {
    return WordDerivative(
      derivative: derivativeWord,
      partOfSpeech: partOfSpeech,
    );
  }
}

extension WordRootModelMapper on WordRootModel {
  /// Maps root storage model to Domain Entity.
  WordRoot toEntity() {
    return WordRoot(
      root: root,
      meaning: meaning,
    );
  }
}
