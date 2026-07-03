import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/reading_position.dart';
import '../../domain/entities/story.dart';
import '../../domain/entities/story_progress.dart';
import '../../domain/repositories/story_repository.dart';
import '../datasources/story_local_data_source.dart';

class StoryRepositoryImpl implements StoryRepository {
  final StoryLocalDataSource localDataSource;

  StoryRepositoryImpl({required this.localDataSource});

  @override
  Future<Either<Failure, List<Story>>> getStories() async {
    try {
      final models = await localDataSource.getStories();
      return Right(models.map((model) => model.toEntity()).toList());
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Story>> getStory(int id) async {
    try {
      final model = await localDataSource.getStory(id);
      return Right(model.toEntity());
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, StoryProgress?>> getProgress(int storyId) async {
    try {
      final model = await localDataSource.getProgress(storyId);
      return Right(model?.toEntity());
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Map<int, StoryProgress>>> getAllProgress() async {
    try {
      final models = await localDataSource.getAllProgress();
      final entities = <int, StoryProgress>{};
      for (final entry in models.entries) {
        entities[entry.key] = entry.value.toEntity();
      }
      return Right(entities);
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> saveReadingPosition({
    required int storyId,
    required ReadingPosition position,
    required DateTime now,
  }) async {
    try {
      await localDataSource.saveReadingPosition(
        storyId: storyId,
        chapter: position.chapter,
        paragraph: position.paragraph,
        offset: position.offset,
        lastStudiedAt: now.toIso8601String(),
      );
      return const Right(null);
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, int?>> findWordId(String word) async {
    try {
      return Right(await localDataSource.findWordId(word));
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }
}
