import '../../../../core/analytics/learning_event_logger.dart';
import '../../../../core/database/database.dart';
import '../models/review_card_model.dart';
import '../models/study_session_model.dart';
import 'review_local_data_source.dart';
import 'review_queries.dart';

class SQLiteReviewLocalDataSource implements ReviewLocalDataSource {
  final AppDatabase appDatabase;
  final LearningEventLogger eventLogger;

  SQLiteReviewLocalDataSource(
      {required this.appDatabase, required this.eventLogger});

  @override
  Future<List<LearningCardModel>> getAllCardsWithProgress() async {
    final db = await appDatabase.database;
    final List<Map<String, dynamic>> results = await db.rawQuery(
      ReviewQueries.selectAllWordsWithProgress,
    );
    return results.map((m) => LearningCardModel.fromMap(m)).toList();
  }

  @override
  Future<void> saveReviewProgress({
    required int wordId,
    required double easeFactor,
    required int intervalDays,
    required int repetitionCount,
    required String learningState,
    required int masteryScore,
    required String nextReviewAt,
    required String lastReviewedAt,
    required StudySessionModel session,
  }) async {
    final db = await appDatabase.database;

    await db.transaction((txn) async {
      // 1. Fetch current progress counters
      final List<Map<String, dynamic>> existing = await txn.rawQuery(
        ReviewQueries.selectWordProgress,
        [wordId],
      );

      int currentReviewCount = 0;
      int currentCorrectCount = 0;
      int currentIncorrectCount = 0;

      if (existing.isNotEmpty) {
        final row = existing.first;
        currentReviewCount = row['review_count'] as int? ?? 0;
        currentCorrectCount = row['correct_count'] as int? ?? 0;
        currentIncorrectCount = row['incorrect_count'] as int? ?? 0;
      }

      // Check if this card review answer was correct
      final wasCorrect = session.correctAnswers > 0;
      currentReviewCount += 1;
      if (wasCorrect) {
        currentCorrectCount += 1;
      } else {
        currentIncorrectCount += 1;
      }

      // Map learningState to a proper status value
      String _mapStatus(String ls) {
        switch (ls) {
          case 'newCard':
            return 'unlearned';
          case 'learning':
          case 'reviewing':
          case 'relearning':
          case 'decaying':
            return 'learning';
          case 'mastered':
            return 'mastered';
          default:
            return 'unlearned';
        }
      }
      final statusValue = _mapStatus(learningState);

      // 2. Upsert progress record
      await txn.rawInsert(
        ReviewQueries.upsertProgress,
        [
          wordId,
          currentReviewCount,
          currentCorrectCount,
          currentIncorrectCount,
          masteryScore,
          statusValue,
          lastReviewedAt,
          nextReviewAt,
          easeFactor,
          intervalDays,
          repetitionCount,
          learningState,
        ],
      );

      // 3. Insert Study Session log
      await txn.rawInsert(
        ReviewQueries.insertStudySession,
        [
          session.id,
          session.mode,
          session.startedAt,
          session.finishedAt,
          session.reviewedCards,
          session.correctAnswers,
          session.incorrectAnswers,
          session.durationSeconds,
        ],
      );

      // 5. Log Weak Word Event if difficulty is high
      if (easeFactor < 1.8) {
        final weakEventId = 'weak-${session.id}-$wordId';
        await txn.rawInsert(
          ReviewQueries.insertWeakWordEvent,
          [
            weakEventId,
            wordId,
            'Low EF: $easeFactor',
            lastReviewedAt,
          ],
        );
      }
    });

    // 4. Log Learning Event via abstraction (called outside transaction to prevent deadlocks)
    await eventLogger.logEvent(
      wordId: wordId.toString(),
      eventType: 'review',
      timestamp: DateTime.parse(lastReviewedAt),
      referenceId: session.id,
      referenceType: 'study_session',
    );
  }

  @override
  Future<void> saveStudySession(StudySessionModel session) async {
    final db = await appDatabase.database;
    await db.rawInsert(
      ReviewQueries.insertStudySession,
      [
        session.id,
        session.mode,
        session.startedAt,
        session.finishedAt,
        session.reviewedCards,
        session.correctAnswers,
        session.incorrectAnswers,
        session.durationSeconds,
      ],
    );
  }

  @override
  Future<List<StudySessionModel>> getStudySessions() async {
    final db = await appDatabase.database;
    final List<Map<String, dynamic>> results = await db.rawQuery(
      ReviewQueries.selectAllStudySessions,
    );
    return results.map((m) => StudySessionModel.fromMap(m)).toList();
  }
}
