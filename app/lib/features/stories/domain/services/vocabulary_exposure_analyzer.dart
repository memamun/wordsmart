import '../entities/story.dart';

class VocabularyExposureAnalyzer {
  const VocabularyExposureAnalyzer();

  Set<String> exposedWordsForParagraph({
    required Story story,
    required int paragraphIndex,
  }) {
    if (paragraphIndex < 0 || paragraphIndex >= story.paragraphs.length) {
      return const {};
    }

    final paragraph =
        story.paragraphs[paragraphIndex].englishText.toLowerCase();
    final exposed = <String>{};
    for (final highlight in story.highlightedWords) {
      if (paragraph.contains(highlight.word.toLowerCase())) {
        exposed.add(highlight.word);
      }
    }
    return exposed;
  }
}
