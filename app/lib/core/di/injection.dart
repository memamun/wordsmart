import 'package:get_it/get_it.dart';
import '../../features/dictionary/data/datasources/sqlite_word_local_data_source.dart';
import '../../features/dictionary/data/datasources/word_local_data_source.dart';
import '../../features/dictionary/data/repositories/search_repository_impl.dart';
import '../../features/dictionary/data/repositories/word_repository_impl.dart';
import '../../features/dictionary/domain/repositories/search_repository.dart';
import '../../features/dictionary/domain/repositories/word_repository.dart';
import '../../features/dictionary/domain/usecases/get_word_details.dart';
import '../../features/dictionary/domain/usecases/search_words.dart';
import '../database/database.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // Database client
  sl.registerLazySingleton<AppDatabase>(() => AppDatabase());

  // Use Cases
  sl.registerLazySingleton(() => SearchWordsUseCase(sl()));
  sl.registerLazySingleton(() => GetWordDetailsUseCase(sl()));

  // Repositories
  sl.registerLazySingleton<SearchRepository>(
    () => SearchRepositoryImpl(localDataSource: sl()),
  );
  sl.registerLazySingleton<WordRepository>(
    () => WordRepositoryImpl(localDataSource: sl()),
  );

  // Data Sources
  sl.registerLazySingleton<WordLocalDataSource>(
    () => SQLiteWordLocalDataSource(databaseClient: sl()),
  );
}
