import 'package:sqflite/sqflite.dart';

import '../../../../core/database/database.dart';
import '../../../dictionary/data/models/word_model.dart';
import '../models/word_progress_model.dart';
import 'progress_local_data_source.dart';

class SQLiteProgressLocalDataSource implements ProgressLocalDataSource {
  final AppDatabase appDatabase;

  SQLiteProgressLocalDataSource({required this.appDatabase});

  @override
  Future<WordProgressModel> getProgress(int wordId) async {
    final db = await appDatabase.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'progress',
      where: 'word_id = ?',
      whereArgs: [wordId],
      limit: 1,
    );
    if (maps.isEmpty) {
      return WordProgressModel(
        wordId: wordId,
        isRead: false,
        isReviewed: false,
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        masteryScore: 0,
        status: 'unlearned',
      );
    }
    return WordProgressModel.fromDatabase(maps.first);
  }

  @override
  Future<void> updateProgress(WordProgressModel progress) async {
    final db = await appDatabase.database;
    await db.insert(
      'progress',
      progress.toDatabaseMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  @override
  Future<List<WordModel>> getWordsByStatus(String status) async {
    final db = await appDatabase.database;
    final List<Map<String, dynamic>> maps = await db.rawQuery('''
      SELECT w.* FROM words w
      INNER JOIN progress p ON w.id = p.word_id
      WHERE p.status = ?
      AND w.definition IS NOT NULL AND w.definition != ''
      ORDER BY w.word ASC
    ''', [status]);
    return maps.map((m) => WordModel.fromDatabase(m)).toList();
  }

  @override
  Future<List<WordModel>> getDueWordsForReview() async {
    final db = await appDatabase.database;
    final now = DateTime.now().toIso8601String();
    final List<Map<String, dynamic>> maps = await db.rawQuery('''
      SELECT w.* FROM words w
      INNER JOIN progress p ON w.id = p.word_id
      WHERE (p.next_review_at IS NULL OR p.next_review_at <= ?)
      AND w.definition IS NOT NULL AND w.definition != ''
      ORDER BY p.next_review_at ASC
    ''', [now]);
    return maps.map((m) => WordModel.fromDatabase(m)).toList();
  }
}
