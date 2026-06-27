import 'package:get_it/get_it.dart';
import '../../domain/usecases/search_words.dart';
import '../../domain/repositories/word_repository.dart';
import '../repositories/word_repository_impl.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // Use Cases
  sl.registerLazySingleton(() => SearchWordsUseCase(sl()));

  // Repositories
  // In the future, implementation classes will be registered here.
  // sl.registerLazySingleton<SearchRepository>(() => SearchRepositoryImpl(localDataSource: sl()));
  // sl.registerLazySingleton<WordRepository>(() => WordRepositoryImpl(localDataSource: sl()));

  // Data Sources
  // sl.registerLazySingleton<WordLocalDataSource>(() => SQLiteWordLocalDataSource(database: sl()));
}
