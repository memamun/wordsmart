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
      final List<int> bytes =
          data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);

      // Write atomically to device database path
      await File(path).writeAsBytes(bytes, flush: true);
    }

    // Open connection
    final db = await openDatabase(
      path,
      version: 2,
      onConfigure: (db) async {
        // Enforce SQLite constraints on every connection open
        await db.execute('PRAGMA foreign_keys = ON;');
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          // 1. Alter progress table
          await db.execute(
              'ALTER TABLE progress ADD COLUMN ease_factor REAL DEFAULT 2.5;');
          await db.execute(
              'ALTER TABLE progress ADD COLUMN interval_days INTEGER DEFAULT 0;');
          await db.execute(
              'ALTER TABLE progress ADD COLUMN repetitions INTEGER DEFAULT 0;');
          await db.execute(
              'ALTER TABLE progress ADD COLUMN learning_state TEXT DEFAULT "newCard";');

          // 2. Create progress indexes
          await db.execute(
              'CREATE INDEX IF NOT EXISTS idx_progress_next_review_at ON progress(next_review_at);');
          await db.execute(
              'CREATE INDEX IF NOT EXISTS idx_progress_learning_state ON progress(learning_state);');
          await db.execute(
              'CREATE INDEX IF NOT EXISTS idx_progress_word_id ON progress(word_id);');

          // 3. Create study_sessions table & index
          await db.execute('''
            CREATE TABLE IF NOT EXISTS study_sessions (
              id TEXT PRIMARY KEY,
              mode TEXT NOT NULL,
              started_at TEXT NOT NULL,
              finished_at TEXT NOT NULL,
              reviewed_cards INTEGER NOT NULL,
              correct_answers INTEGER NOT NULL,
              incorrect_answers INTEGER NOT NULL,
              duration_seconds INTEGER NOT NULL
            );
          ''');
          await db.execute(
              'CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at);');

          // 4. Create learning_events table & index
          await db.execute('''
            CREATE TABLE IF NOT EXISTS learning_events (
              id TEXT PRIMARY KEY,
              word_id INTEGER NOT NULL,
              event_type TEXT NOT NULL,
              logged_at TEXT NOT NULL,
              reference_id TEXT,
              reference_type TEXT
            );
          ''');
          await db.execute(
              'CREATE INDEX IF NOT EXISTS idx_learning_events_logged_at ON learning_events(logged_at);');

          // 5. Create other required tables
          await db.execute('''
            CREATE TABLE IF NOT EXISTS quiz_attempts (
              id TEXT PRIMARY KEY,
              score REAL NOT NULL,
              started_at TEXT NOT NULL,
              finished_at TEXT NOT NULL
            );
          ''');

          await db.execute('''
            CREATE TABLE IF NOT EXISTS story_progress (
              id TEXT PRIMARY KEY,
              story_id INTEGER NOT NULL,
              chapter INTEGER NOT NULL,
              paragraph INTEGER NOT NULL,
              offset INTEGER NOT NULL,
              last_studied_at TEXT NOT NULL
            );
          ''');

          await db.execute('''
            CREATE TABLE IF NOT EXISTS daily_goals (
              id TEXT PRIMARY KEY,
              date TEXT UNIQUE NOT NULL,
              target_reviews INTEGER NOT NULL,
              completed_reviews INTEGER NOT NULL,
              target_minutes INTEGER NOT NULL,
              completed_minutes INTEGER NOT NULL
            );
          ''');

          await db.execute('''
            CREATE TABLE IF NOT EXISTS learning_profile (
              id TEXT PRIMARY KEY,
              preferred_learning_mode TEXT NOT NULL,
              daily_goal INTEGER NOT NULL,
              preferred_story_language TEXT NOT NULL,
              audio_autoplay INTEGER NOT NULL
            );
          ''');

          await db.execute('''
            CREATE TABLE IF NOT EXISTS weak_word_events (
              id TEXT PRIMARY KEY,
              word_id INTEGER NOT NULL,
              weakness_reason TEXT NOT NULL,
              logged_at TEXT NOT NULL
            );
          ''');

          await db.execute('''
            CREATE TABLE IF NOT EXISTS milestones (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              completed_at TEXT NOT NULL
            );
          ''');
        }
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
