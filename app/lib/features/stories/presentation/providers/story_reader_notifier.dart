import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/learning/time/clock.dart';
import '../../domain/entities/reading_position.dart';
import '../../domain/entities/reading_session.dart';
import '../../domain/entities/story.dart';
import '../../domain/services/reading_position_tracker.dart';
import '../../domain/services/reading_statistics_calculator.dart';
import '../../domain/services/story_completion_policy.dart';
import '../../domain/services/vocabulary_exposure_analyzer.dart';
import '../../domain/usecases/continue_story.dart';
import '../../domain/usecases/get_story.dart';
import '../../domain/usecases/record_word_exposure.dart';
import '../../domain/usecases/save_reading_position.dart';
import 'story_reader_state.dart';

class StoryReaderNotifier extends StateNotifier<StoryReaderState> {
  final GetStoryUseCase getStoryUseCase;
  final ContinueStoryUseCase continueStoryUseCase;
  final SaveReadingPositionUseCase saveReadingPositionUseCase;
  final RecordWordExposureUseCase recordWordExposureUseCase;
  final ReadingPositionTracker positionTracker;
  final StoryCompletionPolicy completionPolicy;
  final VocabularyExposureAnalyzer exposureAnalyzer;
  final ReadingStatisticsCalculator statisticsCalculator;
  final Clock clock;

  StoryReaderNotifier({
    required this.getStoryUseCase,
    required this.continueStoryUseCase,
    required this.saveReadingPositionUseCase,
    required this.recordWordExposureUseCase,
    required this.positionTracker,
    required this.completionPolicy,
    required this.exposureAnalyzer,
    required this.statisticsCalculator,
    required this.clock,
  }) : super(const StoryReaderInitial());

  Future<void> loadStory(int storyId) async {
    state = const StoryReaderLoading();
    final storyResult = await getStoryUseCase(storyId);
    await storyResult.fold(
      (failure) async => state = StoryReaderFailure(failure),
      (story) async {
        final progressResult = await continueStoryUseCase(storyId);
        progressResult.fold(
          (failure) => state = StoryReaderFailure(failure),
          (progress) {
            final now = clock.now();
            final session = ReadingSession(
              id: 'story-session-$storyId-${now.millisecondsSinceEpoch}',
              storyId: storyId,
              startedAt: now,
              position: progress?.position ?? const ReadingPosition(),
            );
            state = _loadedState(story: story, session: session, now: now);
          },
        );
      },
    );
  }

  Future<void> nextParagraph() async {
    final current = state;
    if (current is! StoryReaderLoaded || current.isComplete) return;

    final nextPosition = positionTracker.nextParagraph(
      story: current.story,
      current: current.session.position,
    );
    final now = clock.now();
    final exposedWords = exposureAnalyzer.exposedWordsForParagraph(
      story: current.story,
      paragraphIndex: nextPosition.paragraph,
    );
    for (final word in exposedWords) {
      await recordWordExposureUseCase(
        word: word,
        storyId: current.story.id,
        now: now,
      );
    }

    final completed = completionPolicy.isComplete(
      story: current.story,
      position: nextPosition,
    );
    final session = ReadingSession(
      id: current.session.id,
      storyId: current.session.storyId,
      startedAt: current.session.startedAt,
      position: nextPosition,
      completedAt: completed ? now : null,
      exposedWords: {...current.session.exposedWords, ...exposedWords},
    );

    await saveReadingPositionUseCase(
      storyId: current.story.id,
      position: nextPosition,
      now: now,
    );

    state = _loadedState(story: current.story, session: session, now: now);
  }

  void selectWord(String rawWord) {
    final current = state;
    if (current is! StoryReaderLoaded) return;
    final cleaned = rawWord.replaceAll(RegExp(r'[^A-Za-z]'), '');
    state =
        current.copyWith(selectedWord: current.story.findHighlight(cleaned));
  }

  void clearSelectedWord() {
    final current = state;
    if (current is StoryReaderLoaded) {
      state = current.copyWith(clearSelectedWord: true);
    }
  }

  StoryReaderLoaded _loadedState({
    required Story story,
    required ReadingSession session,
    required DateTime now,
  }) {
    return StoryReaderLoaded(
      story: story,
      session: session,
      statistics: statisticsCalculator.calculate(
        story: story,
        session: session,
        now: now,
      ),
    );
  }
}
