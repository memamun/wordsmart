import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../dictionary/domain/entities/word.dart';

abstract class BookmarkRepository {
  /// Checks if a word is bookmarked by the user.
  Future<Either<Failure, bool>> isBookmarked(int wordId);

  /// Bookmarks a word.
  Future<Either<Failure, void>> addBookmark(int wordId);

  /// Removes a bookmark from a word.
  Future<Either<Failure, void>> removeBookmark(int wordId);

  /// Fetches all words bookmarked by the user.
  Future<Either<Failure, List<Word>>> getBookmarkedWords();
}
