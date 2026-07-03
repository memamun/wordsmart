import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/dictionary/domain/repositories/word_repository.dart';
import '../../../../../lib/features/dictionary/domain/usecases/get_word_details.dart';
import '../../../../../lib/features/dictionary/presentation/providers/word_details_notifier.dart';
import '../../../../../lib/features/profile/data/datasources/progress_local_data_source.dart';
import '../../../../../lib/features/profile/data/datasources/bookmark_local_data_source.dart';
import '../../../../../lib/features/profile/data/models/word_progress_model.dart';
import '../../../../../lib/features/dictionary/data/models/word_model.dart';

class MockWordRepository implements WordRepository {
  @override
  Future<Either<Failure, Word>> getWordDetails(int id) =>
      throw UnimplementedError();
  @override
  Future<Either<Failure, Word>> getRandomCoreWord() =>
      throw UnimplementedError();
}

class MockProgressLocalDataSource implements ProgressLocalDataSource {
  @override
  Future<WordProgressModel> getProgress(int wordId) =>
      throw UnimplementedError();
  @override
  Future<void> updateProgress(WordProgressModel progress) async {}
  @override
  Future<List<WordModel>> getWordsByStatus(String status) =>
      throw UnimplementedError();
  @override
  Future<List<WordModel>> getDueWordsForReview() =>
      throw UnimplementedError();
}

class MockBookmarkLocalDataSource implements BookmarkLocalDataSource {
  @override
  Future<bool> isBookmarked(int wordId) async => false;
  @override
  Future<void> addBookmark(int wordId) async {}
  @override
  Future<void> removeBookmark(int wordId) async {}
  @override
  Future<List<WordModel>> getBookmarkedWords() =>
      throw UnimplementedError();
}

class MockGetWordDetailsUseCase extends GetWordDetailsUseCase {
  MockGetWordDetailsUseCase() : super(MockWordRepository());

  Either<Failure, Word>? mockResult;

  @override
  Future<Either<Failure, Word>> call(int id) async {
    return mockResult ?? const Left(DatabaseFailure('Error'));
  }
}

void main() {
  late WordDetailsNotifier notifier;
  late MockGetWordDetailsUseCase mockUseCase;

  setUp(() {
    mockUseCase = MockGetWordDetailsUseCase();
    notifier = WordDetailsNotifier(
      getWordDetailsUseCase: mockUseCase,
      progressDataSource: MockProgressLocalDataSource(),
      bookmarkDataSource: MockBookmarkLocalDataSource(),
    );
  });

  test('should return initial word details state', () {
    expect(notifier.state.word, null);
    expect(notifier.state.isLoading, false);
    expect(notifier.state.failure, null);
  });

  test('should load word details and update state on success', () async {
    // Arrange
    final tWord = Word(id: 1, word: 'ABATE');
    mockUseCase.mockResult = Right(tWord);

    // Act
    final future = notifier.loadWordDetails(1);
    expect(notifier.state.isLoading, true);

    await future;

    // Assert
    expect(notifier.state.isLoading, false);
    expect(notifier.state.word, tWord);
    expect(notifier.state.failure, null);
  });

  test('should set failure state when loading details fails', () async {
    // Arrange
    mockUseCase.mockResult = const Left(DatabaseFailure('Load error'));

    // Act
    await notifier.loadWordDetails(1);

    // Assert
    expect(notifier.state.isLoading, false);
    expect(notifier.state.word, null);
    expect(notifier.state.failure, isA<DatabaseFailure>());
  });
}
