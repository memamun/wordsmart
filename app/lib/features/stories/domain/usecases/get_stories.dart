import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/story.dart';
import '../repositories/story_repository.dart';

class GetStoriesUseCase {
  final StoryRepository repository;

  GetStoriesUseCase(this.repository);

  Future<Either<Failure, List<Story>>> call() {
    return repository.getStories();
  }
}
