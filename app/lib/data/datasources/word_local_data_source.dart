import '../models/word_derivative_model.dart';
import '../models/word_example_model.dart';
import '../models/word_model.dart';
import '../models/word_root_model.dart';

abstract class WordLocalDataSource {
  /// Queries database for a word record by its ID.
  Future<WordModel> getWordById(int id);

  /// Queries database for a random core word record (excluding stubs).
  Future<WordModel> getRandomCoreWord();

  /// Searches for words matching the query string.
  Future<List<WordModel>> searchWords(String query);

  /// Retrieves search suggestions (autocomplete queries).
  Future<List<String>> getSearchSuggestions(String query);

  /// Fetches synonyms for a specific word.
  Future<List<String>> getSynonymsForWord(int wordId);

  /// Fetches antonyms for a specific word.
  Future<List<String>> getAntonymsForWord(int wordId);

  /// Fetches collocations for a specific word.
  Future<List<String>> getCollocationsForWord(int wordId);

  /// Fetches example sentences for a specific word.
  Future<List<WordExampleModel>> getExamplesForWord(int wordId);

  /// Fetches example sentence translations from database (if available, e.g. from flashcards or other tables).
  /// Note: The translation map matches the example IDs to their translation strings.
  Future<Map<int, String>> getExampleTranslationsForWord(int wordId);

  /// Fetches derivatives for a specific word.
  Future<List<WordDerivativeModel>> getDerivativesForWord(int wordId);

  /// Fetches etymology roots for a specific word.
  Future<List<WordRootModel>> getRootsForWord(int wordId);
}
