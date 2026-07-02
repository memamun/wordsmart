import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/reading_position.dart';
import '../repositories/story_repository.dart';

class SaveReadingPositionUseCase {
  final StoryRepository repository;

  SaveReadingPositionUseCase(this.repository);

  Future<Either<Failure, void>> call({
    required int storyId,
    required ReadingPosition position,
    required DateTime now,
  }) {
    return repository.saveReadingPosition(
      storyId: storyId,
      position: position,
      now: now,
    );
  }
}
