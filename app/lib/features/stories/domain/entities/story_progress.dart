import 'reading_position.dart';

class StoryProgress {
  final String id;
  final int storyId;
  final ReadingPosition position;
  final DateTime lastStudiedAt;

  const StoryProgress({
    required this.id,
    required this.storyId,
    required this.position,
    required this.lastStudiedAt,
  });
}
