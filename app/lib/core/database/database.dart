import 'package:sqflite/sqflite.dart';
import 'database_initializer.dart';

class AppDatabase {
  static final AppDatabase _instance = AppDatabase._internal();
  Database? _db;

  AppDatabase._internal();

  factory AppDatabase() => _instance;

  /// Returns the single active SQLite connection, lazily opening it on first demand.
  Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await DatabaseInitializer.initDatabase();
    return _db!;
  }

  /// Closes the database connection if open.
  Future<void> close() async {
    if (_db != null) {
      await _db!.close();
      _db = null;
    }
  }
}
