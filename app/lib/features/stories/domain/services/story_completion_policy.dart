import '../entities/reading_position.dart';
import '../entities/story.dart';

class StoryCompletionPolicy {
  const StoryCompletionPolicy();

  bool isComplete({
    required Story story,
    required ReadingPosition position,
  }) {
    if (story.paragraphs.isEmpty) return false;
    return position.paragraph >= story.paragraphs.length - 1;
  }
}
