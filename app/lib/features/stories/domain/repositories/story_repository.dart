import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/reading_position.dart';
import '../entities/story.dart';
import '../entities/story_progress.dart';

abstract class StoryRepository {
  Future<Either<Failure, List<Story>>> getStories();
  Future<Either<Failure, Story>> getStory(int id);
  Future<Either<Failure, StoryProgress?>> getProgress(int storyId);
  Future<Either<Failure, Map<int, StoryProgress>>> getAllProgress();
  Future<Either<Failure, void>> saveReadingPosition({
    required int storyId,
    required ReadingPosition position,
    required DateTime now,
  });
  Future<Either<Failure, int?>> findWordId(String word);
}
