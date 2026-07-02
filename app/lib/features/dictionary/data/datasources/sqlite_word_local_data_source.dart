import 'package:sqflite/sqflite.dart';
import '../../../../core/database/database.dart';
import '../models/word_derivative_model.dart';
import '../models/word_example_model.dart';
import '../models/word_model.dart';
import '../models/word_root_model.dart';
import 'word_local_data_source.dart';

class SQLiteWordLocalDataSource implements WordLocalDataSource {
  final AppDatabase databaseClient;

  SQLiteWordLocalDataSource({required this.databaseClient});

  @override
  Future<WordModel> getWordById(int id) async {
    final db = await databaseClient.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'words',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );

    if (maps.isEmpty) {
      throw Exception('Word not found with ID: $id');
    }

    return WordModel.fromDatabase(maps.first);
  }

  @override
  Future<WordModel> getRandomCoreWord() async {
    final db = await databaseClient.database;
    // Core words have definitions and are not stubs
    final List<Map<String, dynamic>> maps = await db.query(
      'words',
      where: 'definition IS NOT NULL AND definition != ""',
      orderBy: 'RANDOM()',
      limit: 1,
    );

    if (maps.isEmpty) {
      throw Exception('No core words found in database');
    }

    return WordModel.fromDatabase(maps.first);
  }

  @override
  Future<List<WordModel>> searchWords(String query) async {
    final db = await databaseClient.database;
    final sanitizedQuery = query.trim().toUpperCase();
    if (sanitizedQuery.isEmpty) return [];

    final Map<int, WordModel> resultsMap = {};

    // Helper to add unique rows preserving query priority order
    void addResults(List<Map<String, dynamic>> rows) {
      for (final row in rows) {
        final model = WordModel.fromDatabase(row);
        if (!resultsMap.containsKey(model.id)) {
          resultsMap[model.id] = model;
        }
      }
    }

    // 1. Exact Headword Match
    final exact = await db.query(
      'words',
      where: 'UPPER(word) = ?',
      whereArgs: [sanitizedQuery],
    );
    addResults(exact);

    // 2. Prefix Match
    final prefix = await db.query(
      'words',
      where: 'word LIKE ? AND UPPER(word) != ?',
      whereArgs: ['$query%', sanitizedQuery],
      limit: 50,
    );
    addResults(prefix);

    // 3. Whole Word Substring Match
    final substring = await db.query(
      'words',
      where: 'word LIKE ? AND word NOT LIKE ?',
      whereArgs: ['%$query%', '$query%'],
      limit: 50,
    );
    addResults(substring);

    // 4. Derivative Match
    final derivative = await db.rawQuery('''
      SELECT w.* FROM words w
      INNER JOIN word_derivatives d ON w.id = d.word_id
      WHERE d.derivative_word LIKE ?
      LIMIT 30
    ''', ['%$query%']);
    addResults(derivative);

    // 5. Synonym Match
    final synonym = await db.rawQuery('''
      SELECT w.* FROM words w
      INNER JOIN word_synonyms s ON w.id = s.word_id
      WHERE s.synonym LIKE ?
      LIMIT 30
    ''', ['%$query%']);
    addResults(synonym);

    // 6. Definition Match
    final definition = await db.query(
      'words',
      where: 'definition LIKE ?',
      whereArgs: ['%$query%'],
      limit: 30,
    );
    addResults(definition);

    return resultsMap.values.toList();
  }

  @override
  Future<List<String>> getSearchSuggestions(String query) async {
    final db = await databaseClient.database;
    final sanitizedQuery = query.trim();
    if (sanitizedQuery.isEmpty) return [];

    final List<Map<String, dynamic>> maps = await db.query(
      'words',
      columns: ['word'],
      where: 'word LIKE ?',
      whereArgs: ['$sanitizedQuery%'],
      orderBy: 'word ASC',
      limit: 10,
    );

    return maps.map((row) => row['word'] as String).toList();
  }

  @override
  Future<List<String>> getSynonymsForWord(int wordId) async {
    final db = await databaseClient.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'word_synonyms',
      columns: ['synonym'],
      where: 'word_id = ?',
      whereArgs: [wordId],
    );
    return maps.map((row) => row['synonym'] as String).toList();
  }

  @override
  Future<List<String>> getAntonymsForWord(int wordId) async {
    final db = await databaseClient.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'word_antonyms',
      columns: ['antonym'],
      where: 'word_id = ?',
      whereArgs: [wordId],
    );
    return maps.map((row) => row['antonym'] as String).toList();
  }

  @override
  Future<List<String>> getCollocationsForWord(int wordId) async {
    final db = await databaseClient.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'word_collocations',
      columns: ['collocation'],
      where: 'word_id = ?',
      whereArgs: [wordId],
    );
    return maps.map((row) => row['collocation'] as String).toList();
  }

  @override
  Future<List<WordExampleModel>> getExamplesForWord(int wordId) async {
    final db = await databaseClient.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'word_examples',
      where: 'word_id = ?',
      whereArgs: [wordId],
    );
    return maps.map((row) => WordExampleModel.fromDatabase(row)).toList();
  }

  @override
  Future<Map<int, String>> getExampleTranslationsForWord(int wordId) async {
    final db = await databaseClient.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'word_examples',
      columns: ['id', 'translation'],
      where: 'word_id = ? AND translation IS NOT NULL AND translation != ""',
      whereArgs: [wordId],
    );

    final Map<int, String> translationMap = {};
    for (final row in maps) {
      translationMap[row['id'] as int] = row['translation'] as String;
    }
    return translationMap;
  }

  @override
  Future<List<WordDerivativeModel>> getDerivativesForWord(int wordId) async {
    final db = await databaseClient.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'word_derivatives',
      where: 'word_id = ?',
      whereArgs: [wordId],
    );
    return maps.map((row) => WordDerivativeModel.fromDatabase(row)).toList();
  }

  @override
  Future<List<WordRootModel>> getRootsForWord(int wordId) async {
    final db = await databaseClient.database;
    final List<Map<String, dynamic>> maps = await db.rawQuery('''
      SELECT r.root, r.meaning FROM roots r
      INNER JOIN word_roots wr ON r.id = wr.root_id
      WHERE wr.word_id = ?
    ''', [wordId]);
    return maps.map((row) => WordRootModel.fromDatabase(row)).toList();
  }
}
