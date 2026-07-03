import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/injection.dart';
import '../../domain/usecases/get_word_details.dart';
import '../../../../features/profile/data/datasources/progress_local_data_source.dart';
import '../../../../features/profile/data/datasources/bookmark_local_data_source.dart';
import '../../../../features/profile/data/models/word_progress_model.dart';
import 'word_details_state.dart';

class WordDetailsNotifier extends StateNotifier<WordDetailsState> {
  final GetWordDetailsUseCase getWordDetailsUseCase;
  final ProgressLocalDataSource progressDataSource;
  final BookmarkLocalDataSource bookmarkDataSource;

  WordDetailsNotifier({
    required this.getWordDetailsUseCase,
    required this.progressDataSource,
    required this.bookmarkDataSource,
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

  Future<void> scheduleForReview(int wordId) async {
    try {
      await progressDataSource.updateProgress(WordProgressModel(
        wordId: wordId,
        isRead: true,
        isReviewed: false,
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        masteryScore: 0,
        status: 'unlearned',
        nextReviewAt: DateTime.now(),
      ));
    } catch (_) {}
  }

  Future<void> markAsMastered(int wordId) async {
    try {
      final existing = await progressDataSource.getProgress(wordId);
      await progressDataSource.updateProgress(WordProgressModel(
        wordId: wordId,
        isRead: existing.isRead,
        isReviewed: true,
        reviewCount: existing.reviewCount,
        correctCount: existing.correctCount,
        incorrectCount: existing.incorrectCount,
        masteryScore: 100,
        status: 'mastered',
        lastReviewedAt: existing.lastReviewedAt,
        nextReviewAt: existing.nextReviewAt,
      ));
    } catch (_) {
      await progressDataSource.updateProgress(WordProgressModel(
        wordId: wordId,
        isRead: true,
        isReviewed: true,
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        masteryScore: 100,
        status: 'mastered',
      ));
    }
  }

  Future<bool> checkBookmarkStatus(int wordId) async {
    try {
      return await bookmarkDataSource.isBookmarked(wordId);
    } catch (_) {
      return false;
    }
  }

  Future<bool> toggleBookmark(int wordId) async {
    try {
      final bookmarked = await bookmarkDataSource.isBookmarked(wordId);
      if (bookmarked) {
        await bookmarkDataSource.removeBookmark(wordId);
      } else {
        await bookmarkDataSource.addBookmark(wordId);
      }
      return !bookmarked;
    } catch (_) {
      return false;
    }
  }
}

// Riverpod Provider definitions bridging dependency graph from sl
final wordDetailsNotifierProvider =
    StateNotifierProvider<WordDetailsNotifier, WordDetailsState>((ref) {
  return WordDetailsNotifier(
    getWordDetailsUseCase: sl<GetWordDetailsUseCase>(),
    progressDataSource: sl<ProgressLocalDataSource>(),
    bookmarkDataSource: sl<BookmarkLocalDataSource>(),
  );
});
