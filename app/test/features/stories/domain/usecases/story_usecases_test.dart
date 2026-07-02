import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/stories/domain/entities/reading_position.dart';
import '../../../../../lib/features/stories/domain/entities/story.dart';
import '../../../../../lib/features/stories/domain/entities/story_progress.dart';
import '../../../../../lib/features/stories/domain/repositories/story_repository.dart';
import '../../../../../lib/features/stories/domain/usecases/continue_story.dart';
import '../../../../../lib/features/stories/domain/usecases/get_stories.dart';
import '../../../../../lib/features/stories/domain/usecases/get_story.dart';
import '../../../../../lib/features/stories/domain/usecases/save_reading_position.dart';

class MockStoryRepository implements StoryRepository {
  List<Story>? storiesResult;
  Story? storyResult;
  StoryProgress? progressResult;

  @override
  Future<Either<Failure, List<Story>>> getStories() async {
    if (storiesResult != null) return Right(storiesResult!);
    return const Left(DatabaseFailure('Error'));
  }

  @override
  Future<Either<Failure, Story>> getStory(int id) async {
    if (storyResult != null) return Right(storyResult!);
    return const Left(DatabaseFailure('Error'));
  }

  @override
  Future<Either<Failure, StoryProgress?>> getProgress(int storyId) async {
    return Right(progressResult);
  }

  @override
  Future<Either<Failure, void>> saveReadingPosition({
    required int storyId,
    required ReadingPosition position,
    required DateTime now,
  }) async {
    return const Right(null);
  }

  @override
  Future<Either<Failure, int?>> findWordId(String word) async {
    return const Right(null);
  }
}

void main() {
  late MockStoryRepository mockRepo;
  final now = DateTime(2026, 7, 2);
  final tStory = Story(
    id: 1,
    title: 'Quiz #1',
    wordsCovered: ['ABATE'],
    paragraphs: [],
    highlightedWords: [],
  );

  setUp(() {
    mockRepo = MockStoryRepository();
  });

  group('GetStoriesUseCase', () {
    test('should return list of stories from repository', () async {
      mockRepo.storiesResult = [tStory];
      final usecase = GetStoriesUseCase(mockRepo);
      final result = await usecase();
      expect(result, Right([tStory]));
    });
  });

  group('GetStoryUseCase', () {
    test('should return single story from repository', () async {
      mockRepo.storyResult = tStory;
      final usecase = GetStoryUseCase(mockRepo);
      final result = await usecase(1);
      expect(result, Right(tStory));
    });
  });

  group('ContinueStoryUseCase', () {
    test('should return progress from repository', () async {
      final progress = StoryProgress(
        id: 'story-1',
        storyId: 1,
        position: const ReadingPosition(paragraph: 2),
        lastStudiedAt: now,
      );
      mockRepo.progressResult = progress;
      final usecase = ContinueStoryUseCase(mockRepo);
      final result = await usecase(1);
      expect(result, Right(progress));
    });

    test('should return null when no progress exists', () async {
      final usecase = ContinueStoryUseCase(mockRepo);
      final result = await usecase(1);
      expect(result, const Right(null));
    });
  });

  group('SaveReadingPositionUseCase', () {
    test('should save position via repository', () async {
      final usecase = SaveReadingPositionUseCase(mockRepo);
      final result = await usecase(
        storyId: 1,
        position: const ReadingPosition(paragraph: 3),
        now: now,
      );
      expect(result, const Right(null));
    });
  });
}
