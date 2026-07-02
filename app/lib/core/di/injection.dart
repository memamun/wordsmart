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
import '../analytics/learning_event_logger.dart';
import '../analytics/sqlite_learning_event_logger.dart';
import '../learning/time/clock.dart';
import '../learning/time/system_clock.dart';
import '../../features/review/data/datasources/review_local_data_source.dart';
import '../../features/review/data/datasources/sqlite_review_local_data_source.dart';
import '../../features/review/data/repositories/review_repository_impl.dart';
import '../../features/review/domain/repositories/review_repository.dart';
import '../learning/engine/learning_signal_analyzer.dart';
import '../learning/engine/sm2_engine.dart';
import '../learning/usecases/submit_learning_result.dart';
import '../../features/review/domain/services/review_queue_builder.dart';
import '../../features/review/domain/services/review_scheduler.dart';
import '../../features/review/domain/usecases/finish_review_session.dart';
import '../../features/review/domain/usecases/get_daily_queue.dart';
import '../../features/review/domain/usecases/get_learning_metrics.dart';
import '../../features/review/domain/usecases/get_progress_summary.dart';
import '../../features/review/domain/usecases/start_review_session.dart';
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
import '../../features/stories/data/datasources/sqlite_story_local_data_source.dart';
import '../../features/stories/data/datasources/story_local_data_source.dart';
import '../../features/stories/data/repositories/story_repository_impl.dart';
import '../../features/stories/domain/repositories/story_repository.dart';
import '../../features/stories/domain/services/reading_position_tracker.dart';
import '../../features/stories/domain/services/reading_statistics_calculator.dart';
import '../../features/stories/domain/services/story_completion_policy.dart';
import '../../features/stories/domain/services/vocabulary_exposure_analyzer.dart';
import '../../features/stories/domain/usecases/continue_story.dart';
import '../../features/stories/domain/usecases/get_stories.dart';
import '../../features/stories/domain/usecases/get_story.dart';
import '../../features/stories/domain/usecases/record_word_exposure.dart';
import '../../features/stories/domain/usecases/save_reading_position.dart';
import '../../features/recommendation/domain/repositories/recommendation_repository.dart';
import '../../features/recommendation/data/repositories/recommendation_repository_impl.dart';
import '../../features/recommendation/domain/services/recommendation_candidate_factory.dart';
import '../../features/recommendation/domain/services/recommendation_scorer.dart';
import '../../features/recommendation/domain/services/recommendation_ranker.dart';
import '../../features/recommendation/domain/services/recommendation_policy.dart';
import '../../features/recommendation/domain/usecases/get_recommendations.dart';
import '../../features/recommendation/domain/usecases/dismiss_recommendation.dart';
import '../../features/recommendation/domain/usecases/complete_recommendation.dart';

final sl = GetIt.instance;


Future<void> init() async {
  // Database client
  sl.registerLazySingleton<AppDatabase>(() => AppDatabase());

  // Clock
  sl.registerLazySingleton<Clock>(() => const SystemClock());

  // Analytics
  sl.registerLazySingleton<LearningEventLogger>(
    () => SQLiteLearningEventLogger(appDatabase: sl()),
  );

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
    () => SQLiteReviewLocalDataSource(appDatabase: sl(), eventLogger: sl()),
  );

  // Review Repositories
  sl.registerLazySingleton<ReviewRepository>(
    () => ReviewRepositoryImpl(localDataSource: sl(), queueBuilder: sl()),
  );

  // Review Use Cases
  sl.registerLazySingleton(() => GetDailyQueueUseCase(sl()));
  sl.registerLazySingleton(() => StartReviewSessionUseCase(sl()));
  sl.registerLazySingleton(() => SubmitLearningResultUseCase(
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
  sl.registerLazySingleton(() => SubmitPracticeAnswerUseCase(submitLearningResultUseCase: sl()));
  sl.registerLazySingleton(() => FinishPracticeSessionUseCase(finishReviewSessionUseCase: sl()));

  // Stories Feature
  // Story Services
  sl.registerLazySingleton(() => const ReadingPositionTracker());
  sl.registerLazySingleton(() => const StoryCompletionPolicy());
  sl.registerLazySingleton(() => const VocabularyExposureAnalyzer());
  sl.registerLazySingleton(() => const ReadingStatisticsCalculator());

  // Story Data Sources
  sl.registerLazySingleton<StoryLocalDataSource>(
    () => SQLiteStoryLocalDataSource(appDatabase: sl()),
  );

  // Story Repositories
  sl.registerLazySingleton<StoryRepository>(
    () => StoryRepositoryImpl(localDataSource: sl()),
  );

  // Story Use Cases
  sl.registerLazySingleton(() => GetStoriesUseCase(sl()));
  sl.registerLazySingleton(() => GetStoryUseCase(sl()));
  sl.registerLazySingleton(() => ContinueStoryUseCase(sl()));
  sl.registerLazySingleton(() => SaveReadingPositionUseCase(sl()));
  sl.registerLazySingleton(() => RecordWordExposureUseCase(
        repository: sl(),
        eventLogger: sl(),
      ));

  // Recommendation Engine
  // Services
  sl.registerLazySingleton(() => const RecommendationCandidateFactory());
  sl.registerLazySingleton(() => const RecommendationScorer());
  sl.registerLazySingleton(() => RecommendationRanker(scorer: sl()));
  sl.registerLazySingleton(() => const RecommendationPolicy());

  // Repositories
  sl.registerLazySingleton<RecommendationRepository>(
    () => RecommendationRepositoryImpl(
      getDailyQueueUseCase: sl(),
      getLearningMetricsUseCase: sl(),
      getProgressSummaryUseCase: sl(),
      storyRepository: sl(),
      candidateFactory: sl(),
    ),
  );

  // Use Cases
  sl.registerLazySingleton(() => GetRecommendationsUseCase(
        repository: sl(),
        ranker: sl(),
      ));
  sl.registerLazySingleton(() => DismissRecommendationUseCase(sl()));
  sl.registerLazySingleton(() => CompleteRecommendationUseCase(sl()));
}
