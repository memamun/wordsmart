import 'package:sqflite/sqflite.dart';

import '../../../../core/database/database.dart';
import '../../../../core/learning/entities/learning_card.dart';
import '../../../../core/learning/entities/learning_value_objects.dart';
import '../../../dictionary/domain/entities/word.dart';
import '../models/advanced_quiz_model.dart';
import '../models/final_exam_model.dart';
import '../models/mcq_quiz_model.dart';
import '../models/quick_quiz_model.dart';
import '../models/vocab_drill_model.dart';
import 'practice_local_data_source.dart';
import 'practice_queries.dart';

class SQLitePracticeLocalDataSource implements PracticeLocalDataSource {
  final AppDatabase appDatabase;

  SQLitePracticeLocalDataSource({required this.appDatabase});

  @override
  Future<List<LearningCard>> getPracticeCards() async {
    final db = await appDatabase.database;
    final List<Map<String, dynamic>> results = await db.rawQuery(
      PracticeQueries.selectPracticeCards,
    );

    if (results.isEmpty) return [];

    final wordIds = results.map((m) => m['word_id'] as int).toList();
    final synonymsMap = await _batchLoadSynonyms(db, wordIds);
    final antonymsMap = await _batchLoadAntonyms(db, wordIds);

    final now = DateTime.now();
    return results.map((m) {
      final id = m['word_id'] as int;
      return _mapToLearningCard(m, now, synonymsMap[id], antonymsMap[id]);
    }).toList();
  }

  Future<Map<int, List<String>>> _batchLoadSynonyms(
    Database db,
    List<int> wordIds,
  ) async {
    final placeholders = wordIds.map((_) => '?').join(',');
    final rows = await db.rawQuery(
      'SELECT word_id, synonym FROM word_synonyms WHERE word_id IN ($placeholders)',
      wordIds,
    );
    final map = <int, List<String>>{};
    for (final row in rows) {
      final wid = row['word_id'] as int;
      map.putIfAbsent(wid, () => []).add(row['synonym'] as String);
    }
    return map;
  }

  Future<Map<int, List<String>>> _batchLoadAntonyms(
    Database db,
    List<int> wordIds,
  ) async {
    final placeholders = wordIds.map((_) => '?').join(',');
    final rows = await db.rawQuery(
      'SELECT word_id, antonym FROM word_antonyms WHERE word_id IN ($placeholders)',
      wordIds,
    );
    final map = <int, List<String>>{};
    for (final row in rows) {
      final wid = row['word_id'] as int;
      map.putIfAbsent(wid, () => []).add(row['antonym'] as String);
    }
    return map;
  }

  LearningCard _mapToLearningCard(
    Map<String, dynamic> map,
    DateTime now, [
    List<String>? synonyms,
    List<String>? antonyms,
  ]) {
    final word = Word(
      id: map['word_id'] as int,
      word: map['word'] as String,
      definition: map['definition'] as String?,
      bengaliMeaning: map['bengali_meaning'] as String?,
      pronunciation: map['pronunciation'] as String?,
      partOfSpeech: map['part_of_speech'] as String?,
      level: map['level'] as String?,
      audioPath: map['audio_path'] as String?,
      mnemonic: map['mnemonic'] as String?,
      synonyms: synonyms,
      antonyms: antonyms,
    );

    final lastReviewedAt = map['last_reviewed_at'] != null
        ? DateTime.parse(map['last_reviewed_at'] as String)
        : null;
    final nextReviewAt = map['next_review_at'] != null
        ? DateTime.parse(map['next_review_at'] as String)
        : null;

    LearningState state = LearningState.newCard;
    final learningStateStr = map['learning_state'] as String?;
    if (learningStateStr != null) {
      state = LearningState.values.firstWhere(
        (e) => e.toString().split('.').last == learningStateStr,
        orElse: () => LearningState.newCard,
      );
    }

    ReviewMode mode = ReviewMode.newCard;
    if (learningStateStr != null) {
      mode = learningStateStr == 'relearning'
          ? ReviewMode.relearn
          : ReviewMode.review;
    }

    ReviewPriority priority = ReviewPriority.low;
    if (nextReviewAt != null) {
      final diff = nextReviewAt.difference(now);
      if (diff.isNegative) {
        priority =
            -diff.inDays > 3 ? ReviewPriority.critical : ReviewPriority.high;
      } else if (diff.inHours <= 24) {
        priority = ReviewPriority.medium;
      }
    }

    final isCardDue = nextReviewAt == null ? true : nextReviewAt.isBefore(now);

    return LearningCard(
      word: word,
      learningState: state,
      isDue: isCardDue,
      priority: priority,
      easinessFactor: (map['ease_factor'] as num?)?.toDouble() ?? 2.5,
      intervalDays: map['interval_days'] as int? ?? 0,
      repetitionCount: map['repetitions'] as int? ?? 0,
      mode: mode,
      lastReviewedAt: lastReviewedAt,
      nextReviewAt: nextReviewAt,
    );
  }

  @override
  Future<List<Map<String, dynamic>>> getDictionaryPool() async {
    final db = await appDatabase.database;
    return db.rawQuery(PracticeQueries.selectDictionaryPool);
  }

  @override
  Future<VocabDrillModel?> getVocabDrill(int wordId) async {
    final db = await appDatabase.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'vocab_drills',
      where: 'word_id = ?',
      whereArgs: [wordId],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return VocabDrillModel.fromDatabase(maps.first);
  }

  @override
  Future<List<McqQuizModel>> getMcqQuizzes() async {
    final db = await appDatabase.database;
    final rows = await db.rawQuery(
      'SELECT quiz_id, quiz_title, questions FROM mcq_quizzes ORDER BY quiz_id',
    );
    return rows.map((m) => McqQuizModel.fromDatabase(m)).toList();
  }

  @override
  Future<List<QuickQuizModel>> getQuickQuizzes() async {
    final db = await appDatabase.database;
    final rows = await db.rawQuery(
      'SELECT quiz_id, quiz_title, matches, choices, answer_key FROM quick_quizzes ORDER BY quiz_id',
    );
    return rows.map((m) => QuickQuizModel.fromDatabase(m)).toList();
  }

  @override
  Future<List<AdvancedQuizModel>> getAdvancedQuizzes() async {
    final db = await appDatabase.database;
    final rows = await db.rawQuery(
      'SELECT quiz_id, quiz_title, analogies, sentence_completions, contextual_lexical FROM advanced_sat_gre_quizzes ORDER BY quiz_id',
    );
    return rows.map((m) => AdvancedQuizModel.fromDatabase(m)).toList();
  }

  @override
  Future<List<FinalExamModel>> getFinalExams() async {
    final db = await appDatabase.database;
    final rows = await db.rawQuery(
      'SELECT drill_number, drill_title, drill_type, instructions, questions, answers FROM final_exam ORDER BY drill_number',
    );
    return rows.map((m) => FinalExamModel.fromDatabase(m)).toList();
  }
}
