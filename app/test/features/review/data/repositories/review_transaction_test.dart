import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite/sqflite.dart';
import '../../../../../lib/features/review/data/datasources/review_queries.dart';

void main() {
  group('Database Transaction Integrity & Rollbacks', () {
    late Database db;

    setUp(() async {
      db = await openDatabase(
        inMemoryDatabasePath,
        version: 2,
        onCreate: (db, version) async {
          await db.execute('''
            CREATE TABLE progress (
              word_id INTEGER PRIMARY KEY,
              review_count INTEGER,
              correct_count INTEGER,
              incorrect_count INTEGER,
              mastery_score INTEGER,
              status TEXT,
              last_reviewed_at TEXT,
              next_review_at TEXT,
              ease_factor REAL,
              interval_days INTEGER,
              repetitions INTEGER,
              learning_state TEXT
            );
          ''');
          await db.execute('''
            CREATE TABLE study_sessions (
              id TEXT PRIMARY KEY,
              mode TEXT,
              started_at TEXT,
              finished_at TEXT,
              reviewed_cards INTEGER,
              correct_answers INTEGER,
              incorrect_answers INTEGER,
              duration_seconds INTEGER
            );
          ''');
        },
      );
    });

    tearDown(() async {
      await db.close();
    });

    test('should rollback progress table update if study_session insert fails due to constraint error', () async {
      // 1. Insert initial dummy data
      await db.rawInsert('''
        INSERT INTO progress (word_id, review_count, ease_factor, interval_days, repetitions)
        VALUES (1, 0, 2.5, 0, 0);
      ''');

      // Verify initial setup
      var results = await db.rawQuery('SELECT review_count FROM progress WHERE word_id = 1;');
      expect(results.first['review_count'], 0);

      // 2. Perform transactional update where the second step fails (violates primary key constraint of study_sessions)
      try {
        await db.transaction((txn) async {
          // Step 1: Update progress
          await txn.rawInsert(
            ReviewQueries.upsertProgress,
            [1, 1, 1, 0, 80, 'learning', '2026-07-02', '2026-07-08', 2.5, 6, 1, 'learning'],
          );

          // Step 2: Insert study session with null PK (violating PRIMARY KEY NOT NULL constraint)
          await txn.rawInsert(
            'INSERT INTO study_sessions (id, mode) VALUES (?, ?);',
            [null, null], 
          );
        });
        fail('Transaction should have failed and thrown an exception');
      } catch (e) {
        // Expected database exception
      }

      // 3. Verify that progress table updates were completely rolled back
      final postResults = await db.rawQuery('SELECT review_count FROM progress WHERE word_id = 1;');
      expect(postResults.first['review_count'], 0, reason: 'Progress update must be rolled back on transaction error');
    });
  });
}
