import '../../../../core/database/database.dart';
import '../../../review/data/models/review_card_model.dart';
import 'practice_local_data_source.dart';
import 'practice_queries.dart';

class SQLitePracticeLocalDataSource implements PracticeLocalDataSource {
  final AppDatabase appDatabase;

  SQLitePracticeLocalDataSource({required this.appDatabase});

  @override
  Future<List<ReviewCardModel>> getPracticeCards() async {
    final db = await appDatabase.database;
    final List<Map<String, dynamic>> results = await db.rawQuery(
      PracticeQueries.selectPracticeCards,
    );
    return results.map((m) => ReviewCardModel.fromMap(m)).toList();
  }

  @override
  Future<List<Map<String, dynamic>>> getDictionaryPool() async {
    final db = await appDatabase.database;
    return db.rawQuery(PracticeQueries.selectDictionaryPool);
  }
}
