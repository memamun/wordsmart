class FlashcardModel {
  final int wordId;
  final String? additionalExample;
  final String? additionalExampleBengali;
  final String? mnemonicHint;

  const FlashcardModel({
    required this.wordId,
    this.additionalExample,
    this.additionalExampleBengali,
    this.mnemonicHint,
  });

  factory FlashcardModel.fromDatabase(Map<String, dynamic> map) {
    return FlashcardModel(
      wordId: map['word_id'] as int,
      additionalExample: map['additional_example'] as String?,
      additionalExampleBengali: map['additional_example_bengali'] as String?,
      mnemonicHint: map['mnemonic_hint'] as String?,
    );
  }

  Map<String, dynamic> toDatabaseMap() {
    return {
      'word_id': wordId,
      'additional_example': additionalExample,
      'additional_example_bengali': additionalExampleBengali,
      'mnemonic_hint': mnemonicHint,
    };
  }
}
