import 'package:sqflite/sqflite.dart';
import '../../../../core/database/database.dart';
import '../models/review_card_model.dart';
import '../models/study_session_model.dart';
import 'review_local_data_source.dart';
import 'review_queries.dart';

class SQLiteReviewLocalDataSource implements ReviewLocalDataSource {
  final AppDatabase appDatabase;

  SQLiteReviewLocalDataSource({required this.appDatabase});

  @override
  Future<List<ReviewCardModel>> getAllCardsWithProgress() async {
    final db = await appDatabase.database;
    final List<Map<String, dynamic>> results = await db.rawQuery(
      ReviewQueries.selectAllWordsWithProgress,
    );
    return results.map((m) => ReviewCardModel.fromMap(m)).toList();
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

      // 2. Upsert progress record
      await txn.rawInsert(
        ReviewQueries.upsertProgress,
        [
          wordId,
          currentReviewCount,
          currentCorrectCount,
          currentIncorrectCount,
          masteryScore,
          learningState,
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

      // 4. Log Learning Event
      final eventId = 'event-${session.id}-$wordId';
      await txn.rawInsert(
        ReviewQueries.insertLearningEvent,
        [
          eventId,
          wordId,
          'review',
          lastReviewedAt,
          session.id,
          'study_session',
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
