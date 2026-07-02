import '../../../../core/database/database.dart';
import '../../../../core/learning/entities/learning_card.dart';
import '../../../../core/learning/entities/learning_value_objects.dart';
import '../../../dictionary/domain/entities/word.dart';
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
    final now = DateTime.now();
    return results.map((m) => _mapToLearningCard(m, now)).toList();
  }

  LearningCard _mapToLearningCard(Map<String, dynamic> map, DateTime now) {
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
}
