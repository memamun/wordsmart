import 'dart:convert';
import '../../domain/entities/highlighted_word.dart';
import '../../domain/entities/story.dart';
import '../../domain/entities/story_paragraph.dart';

class StoryModel {
  final int id;
  final String title;
  final String wordsCoveredJson;
  final String storyEnglish;
  final String storyBengali;
  final String vocabularyMappingJson;

  const StoryModel({
    required this.id,
    required this.title,
    required this.wordsCoveredJson,
    required this.storyEnglish,
    required this.storyBengali,
    required this.vocabularyMappingJson,
  });

  factory StoryModel.fromMap(Map<String, dynamic> map) {
    return StoryModel(
      id: map['quiz_id'] as int,
      title: map['quiz_title'] as String,
      wordsCoveredJson: map['words_covered'] as String,
      storyEnglish: map['story_english'] as String,
      storyBengali: map['story_bengali'] as String,
      vocabularyMappingJson: map['vocabulary_mapping'] as String,
    );
  }

  Story toEntity() {
    final words = (jsonDecode(wordsCoveredJson) as List<dynamic>)
        .map((value) => value.toString())
        .toList();
    final mapping = (jsonDecode(vocabularyMappingJson) as List<dynamic>)
        .cast<Map<String, dynamic>>();

    return Story(
      id: id,
      title: title,
      wordsCovered: words,
      paragraphs: _buildParagraphs(),
      highlightedWords: mapping.map((item) {
        return HighlightedWord(
          word: item['word'] as String,
          definition: item['definition'] as String? ?? '',
          bengaliMeaning: item['bengali_meaning'] as String? ?? '',
        );
      }).toList(),
    );
  }

  List<StoryParagraph> _buildParagraphs() {
    final englishParagraphs = _splitParagraphs(storyEnglish);
    final bengaliParagraphs = _splitParagraphs(storyBengali);
    final maxLength = englishParagraphs.length > bengaliParagraphs.length
        ? englishParagraphs.length
        : bengaliParagraphs.length;

    return List.generate(maxLength, (index) {
      return StoryParagraph(
        index: index,
        englishText: index < englishParagraphs.length ? englishParagraphs[index] : '',
        bengaliText: index < bengaliParagraphs.length ? bengaliParagraphs[index] : '',
      );
    });
  }

  List<String> _splitParagraphs(String text) {
    final normalized = text.trim();
    if (normalized.isEmpty) return const [];
    final paragraphs = normalized
        .split(RegExp(r'\n\s*\n'))
        .map((value) => value.trim())
        .where((value) => value.isNotEmpty)
        .toList();
    return paragraphs.isEmpty ? [normalized] : paragraphs;
  }
}
