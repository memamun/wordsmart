import '../../../../core/error/failures.dart';
import '../../domain/entities/word.dart';

class WordDetailsState {
  final Word? word;
  final bool isLoading;
  final Failure? failure;

  const WordDetailsState({
    this.word,
    required this.isLoading,
    this.failure,
  });

  factory WordDetailsState.initial() {
    return const WordDetailsState(
      word: null,
      isLoading: false,
      failure: null,
    );
  }

  WordDetailsState copyWith({
    Word? word,
    bool? isLoading,
    Failure? failure,
    bool clearFailure = false,
  }) {
    return WordDetailsState(
      word: word ?? this.word,
      isLoading: isLoading ?? this.isLoading,
      failure: clearFailure ? null : (failure ?? this.failure),
    );
  }
}
