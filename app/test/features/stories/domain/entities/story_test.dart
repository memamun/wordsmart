import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/stories/domain/entities/highlighted_word.dart';
import '../../../../../lib/features/stories/domain/entities/story.dart';
import '../../../../../lib/features/stories/domain/entities/story_paragraph.dart';

void main() {
  final tParagraphs = [
    const StoryParagraph(
        index: 0,
        englishText: 'The storm began to **abate**.',
        bengaliText: 'ঝড় কমতে শুরু করল।'),
    const StoryParagraph(
        index: 1,
        englishText: 'He felt **abashed**.',
        bengaliText: 'সে লজ্জিত বোধ করল।'),
  ];

  final tHighlights = [
    const HighlightedWord(
        word: 'ABATE', definition: 'to subside', bengaliMeaning: 'কমানো'),
    const HighlightedWord(
        word: 'ABASH',
        definition: 'to embarrass',
        bengaliMeaning: 'লজ্জিত করা'),
  ];

  final tStory = Story(
    id: 1,
    title: 'Quick Quiz #1',
    wordsCovered: ['ABATE', 'ABASH'],
    paragraphs: tParagraphs,
    highlightedWords: tHighlights,
  );

  group('Story', () {
    test('should find highlight by word case-insensitively', () {
      final highlight = tStory.findHighlight('abate');
      expect(highlight, isNotNull);
      expect(highlight!.word, 'ABATE');
      expect(highlight.definition, 'to subside');
    });

    test('should return null for unknown word', () {
      expect(tStory.findHighlight('unknown'), isNull);
    });
  });
}
