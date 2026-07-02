import '../../../../core/database/database.dart';
import '../models/story_model.dart';
import '../models/story_progress_model.dart';
import 'story_local_data_source.dart';
import 'story_queries.dart';

class SQLiteStoryLocalDataSource implements StoryLocalDataSource {
  final AppDatabase appDatabase;

  SQLiteStoryLocalDataSource({required this.appDatabase});

  Future<void> _ensureSchema() async {
    final db = await appDatabase.database;
    await db.execute(StoryQueries.ensureStoryProgressTable);
  }

  @override
  Future<List<StoryModel>> getStories() async {
    await _ensureSchema();
    final db = await appDatabase.database;
    final rows = await db.rawQuery(StoryQueries.selectStories);
    return rows.map(StoryModel.fromMap).toList();
  }

  @override
  Future<StoryModel> getStory(int id) async {
    await _ensureSchema();
    final db = await appDatabase.database;
    final rows = await db.rawQuery(StoryQueries.selectStoryById, [id]);
    if (rows.isEmpty) {
      throw Exception('Story not found with ID: $id');
    }
    return StoryModel.fromMap(rows.first);
  }

  @override
  Future<StoryProgressModel?> getProgress(int storyId) async {
    await _ensureSchema();
    final db = await appDatabase.database;
    final rows = await db.rawQuery(StoryQueries.selectProgressByStoryId, [storyId]);
    if (rows.isEmpty) return null;
    return StoryProgressModel.fromMap(rows.first);
  }

  @override
  Future<void> saveReadingPosition({
    required int storyId,
    required int chapter,
    required int paragraph,
    required int offset,
    required String lastStudiedAt,
  }) async {
    await _ensureSchema();
    final db = await appDatabase.database;
    await db.rawInsert(StoryQueries.upsertProgress, [
      'story-$storyId',
      storyId,
      chapter,
      paragraph,
      offset,
      lastStudiedAt,
    ]);
  }

  @override
  Future<int?> findWordId(String word) async {
    final db = await appDatabase.database;
    final rows = await db.rawQuery(StoryQueries.selectWordIdByHeadword, [word]);
    if (rows.isEmpty) return null;
    return rows.first['id'] as int;
  }
}
