import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/word.dart';

abstract class SearchRepository {
  /// Searches for words matching the query. Returns list of Words with core fields only.
  Future<Either<Failure, List<Word>>> searchWords(String query);

  /// Fetches autocomplete/search suggestions for the given query prefix.
  Future<Either<Failure, List<String>>> getSearchSuggestions(String query);
}
