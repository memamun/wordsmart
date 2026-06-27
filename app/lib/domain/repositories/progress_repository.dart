import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';
import '../entities/learning_status.dart';
import '../entities/word.dart';
import '../entities/word_progress.dart';

abstract class ProgressRepository {
  /// Fetches the study progress details for a specific word.
  Future<Either<Failure, WordProgress>> getProgress(int wordId);

  /// Updates or inserts study progress for a word.
  Future<Either<Failure, void>> updateProgress(WordProgress progress);

  /// Fetches words classified by their learning status.
  Future<Either<Failure, List<Word>>> getWordsByStatus(LearningStatus status);

  /// Fetches words that are currently due for spaced-repetition review.
  Future<Either<Failure, List<Word>>> getDueWordsForReview();
}
