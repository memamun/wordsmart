import '../entities/reading_position.dart';
import '../entities/story.dart';

class ReadingPositionTracker {
  const ReadingPositionTracker();

  ReadingPosition nextParagraph({
    required Story story,
    required ReadingPosition current,
  }) {
    final nextIndex = current.paragraph + 1;
    if (nextIndex >= story.paragraphs.length) {
      return ReadingPosition(
        chapter: current.chapter,
        paragraph: story.paragraphs.length - 1,
        offset: current.offset,
      );
    }
    return ReadingPosition(chapter: current.chapter, paragraph: nextIndex);
  }
}
