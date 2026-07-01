import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/word.dart';

abstract class WordRepository {
  /// Fetches a word's full details (with all lazy-loaded fields hydrated).
  Future<Either<Failure, Word>> getWordDetails(int id);

  /// Fetches a random core word (ignores stubs, picks from full dictionary entries).
  Future<Either<Failure, Word>> getRandomCoreWord();
}
