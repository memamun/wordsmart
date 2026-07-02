import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

void main() {
  sqfliteFfiInit();

  group('Database Migration story_progress', () {
    late Database db;

    setUp(() async {
      databaseFactory = databaseFactoryFfi;
      db = await openDatabase(
        inMemoryDatabasePath,
        version: 1,
        onConfigure: (db) async {
          await db.execute('PRAGMA foreign_keys = ON;');
        },
        onCreate: (db, version) async {
          // Simulate bundled DB schema (V0) — contextual_stories exists, story_progress does NOT
          await db.execute('''
            CREATE TABLE contextual_stories (
              quiz_id INTEGER PRIMARY KEY,
              quiz_title TEXT NOT NULL,
              words_covered TEXT NOT NULL,
              story_english TEXT NOT NULL,
              story_bengali TEXT NOT NULL,
              vocabulary_mapping TEXT NOT NULL
            );
          ''');
        },
      );
    });

    tearDown(() async {
      await db.close();
    });

    test('story_progress table should NOT exist in V0 schema', () async {
      final List<Map<String, dynamic>> tables = await db.rawQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name = 'story_progress';",
      );
      expect(tables, isEmpty);
    });

    test('should create story_progress table via CREATE TABLE IF NOT EXISTS',
        () async {
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

      final List<Map<String, dynamic>> tables = await db.rawQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name = 'story_progress';",
      );
      expect(tables.length, 1);
      expect(tables.first['name'], 'story_progress');
    });

    test('should have correct columns after migration', () async {
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

      final List<Map<String, dynamic>> columns =
          await db.rawQuery('PRAGMA table_info(story_progress);');
      final columnNames = columns.map((c) => c['name'] as String).toList();

      expect(
          columnNames,
          containsAll([
            'id',
            'story_id',
            'chapter',
            'paragraph',
            'offset',
            'last_studied_at'
          ]));
    });

    test('should insert and upsert story_progress rows', () async {
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

      // Insert initial row
      await db.rawInsert(
        'INSERT INTO story_progress (id, story_id, chapter, paragraph, offset, last_studied_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['story-1', 1, 0, 2, 0, '2026-07-02T10:00:00'],
      );

      // Upsert same row with new position
      await db.rawInsert(
        '''INSERT INTO story_progress (id, story_id, chapter, paragraph, offset, last_studied_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             chapter = excluded.chapter,
             paragraph = excluded.paragraph,
             offset = excluded.offset,
             last_studied_at = excluded.last_studied_at''',
        ['story-1', 1, 0, 5, 0, '2026-07-02T10:05:00'],
      );

      final rows =
          await db.rawQuery('SELECT * FROM story_progress WHERE story_id = 1');
      expect(rows.length, 1);
      expect(rows.first['paragraph'], 5);
      expect(rows.first['last_studied_at'], '2026-07-02T10:05:00');
    });

    test('should query progress by story_id', () async {
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

      await db.rawInsert(
        'INSERT INTO story_progress (id, story_id, chapter, paragraph, offset, last_studied_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['story-1', 1, 0, 3, 0, '2026-07-02T10:00:00'],
      );
      await db.rawInsert(
        'INSERT INTO story_progress (id, story_id, chapter, paragraph, offset, last_studied_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['story-2', 2, 0, 1, 0, '2026-07-02T10:00:00'],
      );

      final rows = await db
          .rawQuery('SELECT * FROM story_progress WHERE story_id = ?', [1]);
      expect(rows.length, 1);
      expect(rows.first['id'], 'story-1');
    });
  });
}
