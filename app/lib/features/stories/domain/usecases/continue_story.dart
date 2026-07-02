import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/story_progress.dart';
import '../repositories/story_repository.dart';

class ContinueStoryUseCase {
  final StoryRepository repository;

  ContinueStoryUseCase(this.repository);

  Future<Either<Failure, StoryProgress?>> call(int storyId) {
    return repository.getProgress(storyId);
  }
}
