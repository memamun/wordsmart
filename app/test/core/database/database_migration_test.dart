import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite/sqflite.dart';

void main() {
  group('Database Migration V1 to V2', () {
    late Database db;

    setUp(() async {
      // In-memory sqlite database setup simulating the upgrade migration path
      db = await openDatabase(
        inMemoryDatabasePath,
        version: 2,
        onConfigure: (db) async {
          await db.execute('PRAGMA foreign_keys = ON;');
        },
        onCreate: (db, version) async {
          // 1. Create simulated V1 progress table
          await db.execute('''
            CREATE TABLE progress (
              id INTEGER PRIMARY KEY,
              word_id INTEGER UNIQUE,
              is_read INTEGER DEFAULT 0,
              is_reviewed INTEGER DEFAULT 0,
              review_count INTEGER DEFAULT 0,
              correct_count INTEGER DEFAULT 0,
              incorrect_count INTEGER DEFAULT 0,
              mastery_score INTEGER DEFAULT 0,
              status TEXT,
              last_reviewed_at TEXT,
              next_review_at TEXT
            );
          ''');
        },
        onUpgrade: (db, oldVersion, newVersion) async {
          if (oldVersion < 2) {
            // Alter progress table
            await db.execute('ALTER TABLE progress ADD COLUMN ease_factor REAL DEFAULT 2.5;');
            await db.execute('ALTER TABLE progress ADD COLUMN interval_days INTEGER DEFAULT 0;');
            await db.execute('ALTER TABLE progress ADD COLUMN repetitions INTEGER DEFAULT 0;');
            await db.execute('ALTER TABLE progress ADD COLUMN learning_state TEXT DEFAULT "newCard";');

            // Create progress indexes
            await db.execute('CREATE INDEX IF NOT EXISTS idx_progress_next_review_at ON progress(next_review_at);');
            await db.execute('CREATE INDEX IF NOT EXISTS idx_progress_learning_state ON progress(learning_state);');
            await db.execute('CREATE INDEX IF NOT EXISTS idx_progress_word_id ON progress(word_id);');

            // Create study_sessions table & index
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
            await db.execute('CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at);');

            // Create learning_events table & index
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
            await db.execute('CREATE INDEX IF NOT EXISTS idx_learning_events_logged_at ON learning_events(logged_at);');
          }
        },
      );
    });

    tearDown(() async {
      await db.close();
    });

    test('should add ease_factor, interval_days, repetitions, and learning_state columns to progress table', () async {
      final List<Map<String, dynamic>> columns = await db.rawQuery('PRAGMA table_info(progress);');
      final columnNames = columns.map((c) => c['name'] as String).toList();

      expect(columnNames.contains('ease_factor'), true);
      expect(columnNames.contains('interval_days'), true);
      expect(columnNames.contains('repetitions'), true);
      expect(columnNames.contains('learning_state'), true);
    });

    test('should create study_sessions and learning_events tables successfully', () async {
      final List<Map<String, dynamic>> tables = await db.rawQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('study_sessions', 'learning_events');",
      );
      final tableNames = tables.map((t) => t['name'] as String).toList();

      expect(tableNames.contains('study_sessions'), true);
      expect(tableNames.contains('learning_events'), true);
    });

    test('should verify index existences on new schema', () async {
      final List<Map<String, dynamic>> indexes = await db.rawQuery(
        "SELECT name FROM sqlite_master WHERE type='index' AND name IN ('idx_progress_next_review_at', 'idx_study_sessions_started_at');",
      );
      final indexNames = indexes.map((i) => i['name'] as String).toList();

      expect(indexNames.contains('idx_progress_next_review_at'), true);
      expect(indexNames.contains('idx_study_sessions_started_at'), true);
    });
  });
}
