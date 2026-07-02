import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/injection.dart';
import '../../domain/usecases/get_word_details.dart';
import 'word_details_state.dart';

class WordDetailsNotifier extends StateNotifier<WordDetailsState> {
  final GetWordDetailsUseCase getWordDetailsUseCase;

  WordDetailsNotifier({
    required this.getWordDetailsUseCase,
  }) : super(WordDetailsState.initial());

  /// Loads full hydrated word details by word ID.
  Future<void> loadWordDetails(int id) async {
    state = state.copyWith(isLoading: true, failure: null);

    final result = await getWordDetailsUseCase(id);

    result.fold(
      (failure) => state = state.copyWith(isLoading: false, failure: failure),
      (word) => state = state.copyWith(isLoading: false, word: word),
    );
  }
}

// Riverpod Provider definitions bridging dependency graph from sl
final wordDetailsNotifierProvider =
    StateNotifierProvider<WordDetailsNotifier, WordDetailsState>((ref) {
  return WordDetailsNotifier(
    getWordDetailsUseCase: sl<GetWordDetailsUseCase>(),
  );
});
