import 'dart:io';
import 'package:flutter/services.dart';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class DatabaseInitializer {
  static const String _dbName = 'wordsmart.db';

  /// Prepares, copies, and opens the prepackaged SQLite database from assets.
  static Future<Database> initDatabase() async {
    final databasesPath = await getDatabasesPath();
    final path = join(databasesPath, _dbName);

    // Copy from assets only if it does not exist already
    final exists = await databaseExists(path);

    if (!exists) {
      try {
        await Directory(dirname(path)).create(recursive: true);
      } catch (_) {}

      // Copy database bytes from root assets bundle
      final ByteData data = await rootBundle.load(join('assets', _dbName));
      final List<int> bytes = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);

      // Write atomically to device database path
      await File(path).writeAsBytes(bytes, flush: true);
    }

    // Open connection
    final db = await openDatabase(
      path,
      version: 1,
      onConfigure: (db) async {
        // Enforce SQLite constraints on every connection open
        await db.execute('PRAGMA foreign_keys = ON;');
      },
    );

    // Verify search indices are active before proceeding
    await _verifyIndices(db);

    return db;
  }

  /// Checks that all critical indexes are correctly provisioned for query performance.
  static Future<void> _verifyIndices(Database db) async {
    final indexes = [
      'idx_words_word',
      'idx_word_examples_word_id',
      'idx_word_synonyms_word_id',
      'idx_word_antonyms_word_id',
      'idx_word_derivatives_word_id',
      'idx_word_collocations_word_id',
      'idx_word_roots_word_id',
      'idx_word_roots_root_id'
    ];

    for (final index in indexes) {
      final List<Map<String, dynamic>> res = await db.rawQuery(
        "SELECT name FROM sqlite_master WHERE type='index' AND name=?;",
        [index],
      );
      if (res.isEmpty) {
        throw Exception("Missing critical search database index: $index");
      }
    }
  }
}
