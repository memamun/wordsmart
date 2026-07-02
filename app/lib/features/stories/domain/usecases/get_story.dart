import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/story.dart';
import '../repositories/story_repository.dart';

class GetStoryUseCase {
  final StoryRepository repository;

  GetStoryUseCase(this.repository);

  Future<Either<Failure, Story>> call(int id) {
    return repository.getStory(id);
  }
}
