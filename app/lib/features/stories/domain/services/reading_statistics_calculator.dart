import '../entities/reading_session.dart';
import '../entities/reading_statistics.dart';
import '../entities/story.dart';

class ReadingStatisticsCalculator {
  const ReadingStatisticsCalculator();

  ReadingStatistics calculate({
    required Story story,
    required ReadingSession session,
    required DateTime now,
  }) {
    return ReadingStatistics(
      totalParagraphs: story.paragraphs.length,
      completedParagraphs: session.position.paragraph + 1,
      wordsEncountered: session.exposedWords.length,
      duration: now.difference(session.startedAt),
    );
  }
}
