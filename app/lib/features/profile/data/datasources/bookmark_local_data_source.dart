import '../../../dictionary/data/models/word_model.dart';

abstract class BookmarkLocalDataSource {
  /// Checks if a word is bookmarked in local storage.
  Future<bool> isBookmarked(int wordId);

  /// Bookmarks a word.
  Future<void> addBookmark(int wordId);

  /// Removes a bookmark from a word.
  Future<void> removeBookmark(int wordId);

  /// Fetches all bookmarked words from local storage.
  Future<List<WordModel>> getBookmarkedWords();
}
