import 'package:sqflite/sqflite.dart';

import '../../../../core/database/database.dart';
import '../../../dictionary/data/models/word_model.dart';
import 'bookmark_local_data_source.dart';

class SQLiteBookmarkLocalDataSource implements BookmarkLocalDataSource {
  final AppDatabase appDatabase;

  SQLiteBookmarkLocalDataSource({required this.appDatabase});

  @override
  Future<bool> isBookmarked(int wordId) async {
    final db = await appDatabase.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'bookmarks',
      columns: ['id'],
      where: 'word_id = ?',
      whereArgs: [wordId],
      limit: 1,
    );
    return maps.isNotEmpty;
  }

  @override
  Future<void> addBookmark(int wordId) async {
    final db = await appDatabase.database;
    await db.insert(
      'bookmarks',
      {'word_id': wordId},
      conflictAlgorithm: ConflictAlgorithm.ignore,
    );
  }

  @override
  Future<void> removeBookmark(int wordId) async {
    final db = await appDatabase.database;
    await db.delete(
      'bookmarks',
      where: 'word_id = ?',
      whereArgs: [wordId],
    );
  }

  @override
  Future<List<WordModel>> getBookmarkedWords() async {
    final db = await appDatabase.database;
    final List<Map<String, dynamic>> maps = await db.rawQuery('''
      SELECT w.* FROM words w
      INNER JOIN bookmarks b ON w.id = b.word_id
      WHERE w.definition IS NOT NULL AND w.definition != ''
      ORDER BY b.created_at DESC
    ''');
    return maps.map((m) => WordModel.fromDatabase(m)).toList();
  }
}
