import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/dictionary/domain/repositories/search_repository.dart';
import '../../../../../lib/features/dictionary/domain/usecases/search_words.dart';

class MockSearchRepository implements SearchRepository {
  Either<Failure, List<Word>>? searchWordsResult;

  @override
  Future<Either<Failure, List<Word>>> searchWords(String query) async {
    return searchWordsResult ?? const Left(DatabaseFailure('No mock configured'));
  }

  @override
  Future<Either<Failure, List<String>>> getSearchSuggestions(String query) async {
    throw UnimplementedError();
  }
}

void main() {
  late SearchWordsUseCase useCase;
  late MockSearchRepository mockRepository;

  setUp(() {
    mockRepository = MockSearchRepository();
    useCase = SearchWordsUseCase(mockRepository);
  });

  test('should return list of words from repository when search is successful', () async {
    // Arrange
    final tWords = [Word(id: 1, word: 'ABATE')];
    mockRepository.searchWordsResult = Right(tWords);

    // Act
    final result = await useCase('abate');

    // Assert
    expect(result, Right(tWords));
  });
}
