import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';
import '../entities/word.dart';

abstract class WordRepository {
  /// Fetches a word's full details (with all lazy-loaded fields hydrated).
  Future<Either<Failure, Word>> getWordDetails(int id);

  /// Fetches a random word (useful for "Word of the Day").
  Future<Either<Failure, Word>> getRandomWord();
}
