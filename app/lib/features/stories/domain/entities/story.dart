import 'highlighted_word.dart';
import 'story_paragraph.dart';

class Story {
  final int id;
  final String title;
  final List<String> wordsCovered;
  final List<StoryParagraph> paragraphs;
  final List<HighlightedWord> highlightedWords;

  const Story({
    required this.id,
    required this.title,
    required this.wordsCovered,
    required this.paragraphs,
    required this.highlightedWords,
  });

  HighlightedWord? findHighlight(String word) {
    final normalized = word.toLowerCase();
    for (final highlight in highlightedWords) {
      if (highlight.word.toLowerCase() == normalized) {
        return highlight;
      }
    }
    return null;
  }
}
