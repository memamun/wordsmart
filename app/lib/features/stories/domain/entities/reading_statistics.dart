class ReadingStatistics {
  final int totalParagraphs;
  final int completedParagraphs;
  final int wordsEncountered;
  final Duration duration;

  const ReadingStatistics({
    required this.totalParagraphs,
    required this.completedParagraphs,
    required this.wordsEncountered,
    required this.duration,
  });

  double get completionPercent {
    if (totalParagraphs == 0) return 0;
    return (completedParagraphs / totalParagraphs) * 100;
  }
}
