import '../../../dictionary/data/models/word_model.dart';
import '../models/word_progress_model.dart';

abstract class ProgressLocalDataSource {
  /// Fetches study progress for a word.
  Future<WordProgressModel> getProgress(int wordId);

  /// Updates or inserts study progress for a word.
  Future<void> updateProgress(WordProgressModel progress);

  /// Fetches words matching a specific learning status.
  Future<List<WordModel>> getWordsByStatus(String status);

  /// Fetches words that are due for spaced-repetition review.
  Future<List<WordModel>> getDueWordsForReview();
}
