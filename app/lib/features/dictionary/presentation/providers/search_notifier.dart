import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/injection.dart';
import '../../domain/repositories/search_repository.dart';
import '../../domain/usecases/search_words.dart';
import 'search_state.dart';

class SearchNotifier extends StateNotifier<SearchState> {
  final SearchWordsUseCase searchWordsUseCase;
  final SearchRepository searchRepository;

  SearchNotifier({
    required this.searchWordsUseCase,
    required this.searchRepository,
  }) : super(SearchState.initial());

  /// Performs full keyword search and updates the state.
  Future<void> search(String query) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      state = SearchState.initial();
      return;
    }

    state = state.copyWith(query: trimmed, isLoading: true, failure: null);

    final result = await searchWordsUseCase(trimmed);

    result.fold(
      (failure) => state = state.copyWith(isLoading: false, failure: failure),
      (words) => state = state.copyWith(isLoading: false, results: words),
    );
  }

  /// Fetches quick autocomplete suggestions for the active prefix.
  Future<List<String>> getSuggestions(String prefix) async {
    if (prefix.trim().isEmpty) return [];
    final result = await searchRepository.getSearchSuggestions(prefix);
    return result.fold(
      (failure) => [],
      (suggestions) => suggestions,
    );
  }
}

// Riverpod Provider definitions bridging dependency graph from sl
final searchNotifierProvider =
    StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  return SearchNotifier(
    searchWordsUseCase: sl<SearchWordsUseCase>(),
    searchRepository: sl<SearchRepository>(),
  );
});
