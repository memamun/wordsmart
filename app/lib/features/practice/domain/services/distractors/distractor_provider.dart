import '../../../../dictionary/domain/entities/word.dart';

abstract class DistractorProvider {
  List<String> getDefinitionDistractors(
      Word correctWord, List<Word> pool, int count);
  List<String> getSynonymDistractors(
      Word correctWord, List<Word> pool, int count);
  List<String> getAntonymDistractors(
      Word correctWord, List<Word> pool, int count);
}

class BasicDistractorProvider implements DistractorProvider {
  const BasicDistractorProvider();

  @override
  List<String> getDefinitionDistractors(
      Word correctWord, List<Word> pool, int count) {
    final samePos = pool
        .where((w) =>
            w.id != correctWord.id &&
            w.partOfSpeech == correctWord.partOfSpeech &&
            w.definition != null &&
            w.definition!.isNotEmpty)
        .map((w) => w.definition!)
        .toSet()
        .toList();

    final fallback = pool
        .where((w) =>
            w.id != correctWord.id &&
            w.definition != null &&
            w.definition!.isNotEmpty)
        .map((w) => w.definition!)
        .toSet()
        .toList();

    final candidates = samePos.length >= count ? samePos : fallback;
    candidates.shuffle();
    return candidates.take(count).toList();
  }

  @override
  List<String> getSynonymDistractors(
      Word correctWord, List<Word> pool, int count) {
    final candidates = pool
        .where((w) => w.id != correctWord.id && w.word != correctWord.word)
        .map((w) => w.word)
        .toSet()
        .toList();
    candidates.shuffle();
    return candidates.take(count).toList();
  }

  @override
  List<String> getAntonymDistractors(
      Word correctWord, List<Word> pool, int count) {
    final candidates = pool
        .where((w) => w.id != correctWord.id && w.word != correctWord.word)
        .map((w) => w.word)
        .toSet()
        .toList();
    candidates.shuffle();
    return candidates.take(count).toList();
  }
}
