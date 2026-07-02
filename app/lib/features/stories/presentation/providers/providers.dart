import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/injection.dart';
import '../../domain/services/reading_position_tracker.dart';
import '../../domain/services/reading_statistics_calculator.dart';
import '../../domain/services/story_completion_policy.dart';
import '../../domain/services/vocabulary_exposure_analyzer.dart';
import '../../domain/usecases/continue_story.dart';
import '../../domain/usecases/get_story.dart';
import '../../domain/usecases/record_word_exposure.dart';
import '../../domain/usecases/save_reading_position.dart';
import 'story_reader_notifier.dart';
import 'story_reader_state.dart';

final storyReaderProvider =
    StateNotifierProvider.autoDispose<StoryReaderNotifier, StoryReaderState>(
        (ref) {
  return StoryReaderNotifier(
    getStoryUseCase: sl<GetStoryUseCase>(),
    continueStoryUseCase: sl<ContinueStoryUseCase>(),
    saveReadingPositionUseCase: sl<SaveReadingPositionUseCase>(),
    recordWordExposureUseCase: sl<RecordWordExposureUseCase>(),
    positionTracker: sl<ReadingPositionTracker>(),
    completionPolicy: sl<StoryCompletionPolicy>(),
    exposureAnalyzer: sl<VocabularyExposureAnalyzer>(),
    statisticsCalculator: sl<ReadingStatisticsCalculator>(),
    clock: sl(),
  );
});
