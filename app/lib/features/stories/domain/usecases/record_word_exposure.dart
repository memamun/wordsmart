import 'package:dartz/dartz.dart';
import '../../../../core/analytics/learning_event_logger.dart';
import '../../../../core/error/failures.dart';
import '../repositories/story_repository.dart';

class RecordWordExposureUseCase {
  final StoryRepository repository;
  final LearningEventLogger eventLogger;

  RecordWordExposureUseCase({
    required this.repository,
    required this.eventLogger,
  });

  Future<Either<Failure, void>> call({
    required String word,
    required int storyId,
    required DateTime now,
  }) async {
    final wordIdResult = await repository.findWordId(word);
    return wordIdResult.fold(
      (failure) => Left(failure),
      (wordId) async {
        if (wordId == null) return const Right(null);
        await eventLogger.logEvent(
          wordId: wordId.toString(),
          eventType: 'story_exposure',
          timestamp: now,
          referenceId: storyId.toString(),
          referenceType: 'contextual_story',
        );
        return const Right(null);
      },
    );
  }
}
