import '../../core/database/database.dart';
import 'learning_event_logger.dart';

class SQLiteLearningEventLogger implements LearningEventLogger {
  final AppDatabase appDatabase;

  SQLiteLearningEventLogger({required this.appDatabase});

  @override
  Future<void> logEvent({
    required String wordId,
    required String eventType,
    required DateTime timestamp,
    String? referenceId,
    String? referenceType,
  }) async {
    final db = await appDatabase.database;
    final eventId =
        'event-$eventType-$wordId-${timestamp.millisecondsSinceEpoch}';

    await db.rawInsert(
      '''
      INSERT INTO learning_events (
        id, word_id, event_type, logged_at, reference_id, reference_type
      ) VALUES (?, ?, ?, ?, ?, ?);
      ''',
      [
        eventId,
        int.parse(wordId),
        eventType,
        timestamp.toIso8601String(),
        referenceId,
        referenceType,
      ],
    );
  }
}
