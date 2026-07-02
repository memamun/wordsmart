import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/stories/domain/entities/highlighted_word.dart';
import '../../../../../lib/features/stories/domain/entities/reading_position.dart';
import '../../../../../lib/features/stories/domain/entities/reading_session.dart';
import '../../../../../lib/features/stories/domain/entities/story.dart';
import '../../../../../lib/features/stories/domain/entities/story_paragraph.dart';
import '../../../../../lib/features/stories/domain/services/reading_position_tracker.dart';
import '../../../../../lib/features/stories/domain/services/reading_statistics_calculator.dart';
import '../../../../../lib/features/stories/domain/services/story_completion_policy.dart';
import '../../../../../lib/features/stories/domain/services/vocabulary_exposure_analyzer.dart';

void main() {
  final tStory = Story(
    id: 1,
    title: 'Quiz #1',
    wordsCovered: ['ABATE', 'ABASH'],
    paragraphs: [
      const StoryParagraph(
          index: 0,
          englishText: 'The storm began to **abate**.',
          bengaliText: ''),
      const StoryParagraph(
          index: 1, englishText: 'He felt **abashed**.', bengaliText: ''),
      const StoryParagraph(
          index: 2, englishText: 'Finally peace returned.', bengaliText: ''),
    ],
    highlightedWords: [
      const HighlightedWord(
          word: 'ABATE', definition: 'to subside', bengaliMeaning: 'কমানো'),
      const HighlightedWord(
          word: 'ABASH',
          definition: 'to embarrass',
          bengaliMeaning: 'লজ্জিত করা'),
    ],
  );

  group('ReadingPositionTracker', () {
    const tracker = ReadingPositionTracker();

    test('should advance to next paragraph', () {
      final next = tracker.nextParagraph(
        story: tStory,
        current: const ReadingPosition(paragraph: 0),
      );
      expect(next.paragraph, 1);
    });

    test('should stay at last paragraph when already at end', () {
      final next = tracker.nextParagraph(
        story: tStory,
        current: const ReadingPosition(paragraph: 2),
      );
      expect(next.paragraph, 2);
    });
  });

  group('StoryCompletionPolicy', () {
    const policy = StoryCompletionPolicy();

    test('should not be complete at first paragraph', () {
      expect(
        policy.isComplete(
            story: tStory, position: const ReadingPosition(paragraph: 0)),
        false,
      );
    });

    test('should be complete at last paragraph', () {
      expect(
        policy.isComplete(
            story: tStory, position: const ReadingPosition(paragraph: 2)),
        true,
      );
    });

    test('should not be complete for empty story', () {
      final emptyStory = Story(
        id: 2,
        title: 'Empty',
        wordsCovered: [],
        paragraphs: [],
        highlightedWords: [],
      );
      expect(
        policy.isComplete(story: emptyStory, position: const ReadingPosition()),
        false,
      );
    });
  });

  group('VocabularyExposureAnalyzer', () {
    const analyzer = VocabularyExposureAnalyzer();

    test('should detect highlighted words in paragraph', () {
      final words =
          analyzer.exposedWordsForParagraph(story: tStory, paragraphIndex: 0);
      expect(words, contains('ABATE'));
      expect(words.length, 1);
    });

    test('should return empty for out-of-bounds paragraph', () {
      final words =
          analyzer.exposedWordsForParagraph(story: tStory, paragraphIndex: 99);
      expect(words, isEmpty);
    });
  });

  group('ReadingStatisticsCalculator', () {
    const calculator = ReadingStatisticsCalculator();

    test('should calculate reading statistics', () {
      final session = ReadingSession(
        id: 's1',
        storyId: 1,
        startedAt: DateTime(2026, 7, 2, 10, 0),
        position: const ReadingPosition(paragraph: 1),
        exposedWords: {'ABATE', 'ABASH'},
      );

      final stats = calculator.calculate(
        story: tStory,
        session: session,
        now: DateTime(2026, 7, 2, 10, 5),
      );

      expect(stats.totalParagraphs, 3);
      expect(stats.completedParagraphs, 2);
      expect(stats.wordsEncountered, 2);
      expect(stats.duration, const Duration(minutes: 5));
    });
  });
}
