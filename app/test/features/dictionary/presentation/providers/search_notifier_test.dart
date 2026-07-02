import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/dictionary/domain/repositories/search_repository.dart';
import '../../../../../lib/features/dictionary/domain/usecases/search_words.dart';
import '../../../../../lib/features/dictionary/presentation/providers/search_notifier.dart';

class MockSearchRepository implements SearchRepository {
  Either<Failure, List<String>>? suggestionsResult;

  @override
  Future<Either<Failure, List<Word>>> searchWords(String query) => throw UnimplementedError();

  @override
  Future<Either<Failure, List<String>>> getSearchSuggestions(String query) async {
    return suggestionsResult ?? const Left(DatabaseFailure('Error'));
  }
}

class MockSearchWordsUseCase extends SearchWordsUseCase {
  MockSearchWordsUseCase() : super(MockSearchRepository());

  Either<Failure, List<Word>>? mockResult;

  @override
  Future<Either<Failure, List<Word>>> call(String query) async {
    return mockResult ?? const Left(DatabaseFailure('Error'));
  }
}

void main() {
  late SearchNotifier notifier;
  late MockSearchWordsUseCase mockUseCase;
  late MockSearchRepository mockRepository;

  setUp(() {
    mockUseCase = MockSearchWordsUseCase();
    mockRepository = MockSearchRepository();
    notifier = SearchNotifier(
      searchWordsUseCase: mockUseCase,
      searchRepository: mockRepository,
    );
  });

  test('should return initial state as initial SearchState empty', () {
    final state = notifier.state;
    expect(state.query, '');
    expect(state.isLoading, false);
    expect(state.results, isEmpty);
  });

  test('should perform search words and update results on success', () async {
    // Arrange
    final tWords = [Word(id: 1, word: 'ABATE')];
    mockUseCase.mockResult = Right(tWords);

    // Act & Assert (state changes sequence)
    final future = notifier.search('abate');
    
    // During search state should be loading
    expect(notifier.state.isLoading, true);
    expect(notifier.state.query, 'abate');

    await future;

    // After search state should have results
    expect(notifier.state.isLoading, false);
    expect(notifier.state.results, tWords);
  });

  test('should update failure state on failed search execution', () async {
    // Arrange
    mockUseCase.mockResult = const Left(DatabaseFailure('Search error'));

    // Act
    await notifier.search('abate');

    // Assert
    expect(notifier.state.isLoading, false);
    expect(notifier.state.failure, isA<DatabaseFailure>());
  });
}
