import '../../domain/entities/reading_position.dart';
import '../../domain/entities/story_progress.dart';

class StoryProgressModel {
  final String id;
  final int storyId;
  final int chapter;
  final int paragraph;
  final int offset;
  final String lastStudiedAt;

  const StoryProgressModel({
    required this.id,
    required this.storyId,
    required this.chapter,
    required this.paragraph,
    required this.offset,
    required this.lastStudiedAt,
  });

  factory StoryProgressModel.fromMap(Map<String, dynamic> map) {
    return StoryProgressModel(
      id: map['id'] as String,
      storyId: map['story_id'] as int,
      chapter: map['chapter'] as int,
      paragraph: map['paragraph'] as int,
      offset: map['offset'] as int,
      lastStudiedAt: map['last_studied_at'] as String,
    );
  }

  StoryProgress toEntity() {
    return StoryProgress(
      id: id,
      storyId: storyId,
      position: ReadingPosition(
        chapter: chapter,
        paragraph: paragraph,
        offset: offset,
      ),
      lastStudiedAt: DateTime.parse(lastStudiedAt),
    );
  }
}
