import '../../core/error/failures.dart';
import '../../domain/entities/word.dart';

class SearchState {
  final String query;
  final List<Word> results;
  final bool isLoading;
  final Failure? failure;

  const SearchState({
    required this.query,
    required this.results,
    required this.isLoading,
    this.failure,
  });

  /// Factory representing the initial default state of the search screen.
  factory SearchState.initial() {
    return const SearchState(
      query: '',
      results: [],
      isLoading: false,
      failure: null,
    );
  }

  /// Clones the state with updated parameters, supporting immutable updates.
  SearchState copyWith({
    String? query,
    List<Word>? results,
    bool? isLoading,
    Failure? failure,
    bool clearFailure = false,
  }) {
    return SearchState(
      query: query ?? this.query,
      results: results ?? this.results,
      isLoading: isLoading ?? this.isLoading,
      failure: clearFailure ? null : (failure ?? this.failure),
    );
  }
}
