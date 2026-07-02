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
import '../../features/review/data/datasources/review_local_data_source.dart';
import '../../features/review/data/datasources/sqlite_review_local_data_source.dart';
import '../../features/review/data/repositories/review_repository_impl.dart';
import '../../features/review/domain/repositories/review_repository.dart';
import '../../features/review/domain/services/learning_signal_analyzer.dart';
import '../../features/review/domain/services/review_queue_builder.dart';
import '../../features/review/domain/services/review_scheduler.dart';
import '../../features/review/domain/services/sm2_engine.dart';
import '../../features/review/domain/usecases/finish_review_session.dart';
import '../../features/review/domain/usecases/get_daily_queue.dart';
import '../../features/review/domain/usecases/get_learning_metrics.dart';
import '../../features/review/domain/usecases/get_progress_summary.dart';
import '../../features/review/domain/usecases/start_review_session.dart';
import '../../features/review/domain/usecases/submit_card_review.dart';
import '../../features/practice/data/datasources/practice_local_data_source.dart';
import '../../features/practice/data/datasources/sqlite_practice_local_data_source.dart';
import '../../features/practice/data/repositories/practice_repository_impl.dart';
import '../../features/practice/domain/repositories/practice_repository.dart';
import '../../features/practice/domain/services/distractors/distractor_provider.dart';
import '../../features/practice/domain/services/factory/question_generator_factory.dart';
import '../../features/practice/domain/services/builders/practice_session_builder.dart';
import '../../features/practice/domain/usecases/finish_practice_session.dart';
import '../../features/practice/domain/usecases/get_practice_session.dart';
import '../../features/practice/domain/usecases/submit_practice_answer.dart';

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

  // Review Feature
  // Engines & Services
  sl.registerLazySingleton(() => const SM2Engine());
  sl.registerLazySingleton(() => const LearningSignalAnalyzer());
  sl.registerLazySingleton(() => const ReviewScheduler());
  sl.registerLazySingleton(() => const ReviewQueueBuilder());

  // Review Data Sources
  sl.registerLazySingleton<ReviewLocalDataSource>(
    () => SQLiteReviewLocalDataSource(appDatabase: sl()),
  );

  // Review Repositories
  sl.registerLazySingleton<ReviewRepository>(
    () => ReviewRepositoryImpl(localDataSource: sl(), queueBuilder: sl()),
  );

  // Review Use Cases
  sl.registerLazySingleton(() => GetDailyQueueUseCase(sl()));
  sl.registerLazySingleton(() => StartReviewSessionUseCase(sl()));
  sl.registerLazySingleton(() => SubmitCardReviewUseCase(
        repository: sl(),
        signalAnalyzer: sl(),
        sm2Engine: sl(),
      ));
  sl.registerLazySingleton(() => FinishReviewSessionUseCase(sl()));
  sl.registerLazySingleton(() => GetLearningMetricsUseCase(sl()));
  sl.registerLazySingleton(() => GetProgressSummaryUseCase(sl()));

  // Practice Feature
  // Practice Services
  sl.registerLazySingleton<DistractorProvider>(() => const BasicDistractorProvider());
  sl.registerLazySingleton(() => QuestionGeneratorFactory(distractorProvider: sl()));
  sl.registerLazySingleton(() => PracticeSessionBuilder(generatorFactory: sl()));

  // Practice Data Sources
  sl.registerLazySingleton<PracticeLocalDataSource>(
    () => SQLitePracticeLocalDataSource(appDatabase: sl()),
  );

  // Practice Repositories
  sl.registerLazySingleton<PracticeRepository>(
    () => PracticeRepositoryImpl(localDataSource: sl()),
  );

  // Practice Use Cases
  sl.registerLazySingleton(() => GetPracticeSessionUseCase(repository: sl(), builder: sl()));
  sl.registerLazySingleton(() => SubmitPracticeAnswerUseCase(submitCardReviewUseCase: sl()));
  sl.registerLazySingleton(() => FinishPracticeSessionUseCase(finishReviewSessionUseCase: sl()));
}

