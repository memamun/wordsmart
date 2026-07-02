import 'reading_position.dart';

class ReadingSession {
  final String id;
  final int storyId;
  final DateTime startedAt;
  final DateTime? completedAt;
  final ReadingPosition position;
  final Set<String> exposedWords;

  const ReadingSession({
    required this.id,
    required this.storyId,
    required this.startedAt,
    required this.position,
    this.completedAt,
    this.exposedWords = const {},
  });

  bool get isCompleted => completedAt != null;
}
