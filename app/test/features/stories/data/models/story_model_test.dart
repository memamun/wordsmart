import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/stories/data/models/story_model.dart';

void main() {
  final tMap = {
    'quiz_id': 1,
    'quiz_title': 'Quick Quiz #1',
    'words_covered': '["ABATE", "ABASH"]',
    'story_english': 'The storm began to **abate**.\n\nHe felt **abashed**.',
    'story_bengali': 'ঝড় কমতে শুরু করল।\n\nসে লজ্জিত বোধ করল।',
    'vocabulary_mapping': '[{"word":"ABATE","definition":"to subside","bengali_meaning":"কমানো"},{"word":"ABASH","definition":"to embarrass","bengali_meaning":"লজ্জিত করা"}]',
  };

  group('StoryModel', () {
    test('should parse from database map', () {
      final model = StoryModel.fromMap(tMap);
      expect(model.id, 1);
      expect(model.title, 'Quick Quiz #1');
    });

    test('should convert to Story entity with correct paragraphs', () {
      final model = StoryModel.fromMap(tMap);
      final story = model.toEntity();
      expect(story.id, 1);
      expect(story.paragraphs.length, 2);
      expect(story.paragraphs[0].englishText, contains('abate'));
      expect(story.paragraphs[1].bengaliText, contains('লজ্জিত'));
    });

    test('should parse vocabulary mapping into HighlightedWords', () {
      final model = StoryModel.fromMap(tMap);
      final story = model.toEntity();
      expect(story.highlightedWords.length, 2);
      expect(story.highlightedWords[0].word, 'ABATE');
      expect(story.highlightedWords[0].definition, 'to subside');
    });

    test('should preserve words_covered list', () {
      final model = StoryModel.fromMap(tMap);
      final story = model.toEntity();
      expect(story.wordsCovered, ['ABATE', 'ABASH']);
    });
  });
}
