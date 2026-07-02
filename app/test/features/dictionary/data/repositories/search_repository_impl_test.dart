import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/dictionary/data/datasources/word_local_data_source.dart';
import '../../../../../lib/features/dictionary/data/models/word_model.dart';
import '../../../../../lib/features/dictionary/data/models/word_example_model.dart';
import '../../../../../lib/features/dictionary/data/models/word_derivative_model.dart';
import '../../../../../lib/features/dictionary/data/models/word_root_model.dart';
import '../../../../../lib/features/dictionary/data/repositories/search_repository_impl.dart';

class MockWordLocalDataSource implements WordLocalDataSource {
  List<WordModel>? searchWordsResult;
  List<String>? suggestionsResult;
  Exception? dbException;

  @override
  Future<List<WordModel>> searchWords(String query) async {
    if (dbException != null) throw dbException!;
    return searchWordsResult ?? [];
  }

  @override
  Future<List<String>> getSearchSuggestions(String query) async {
    if (dbException != null) throw dbException!;
    return suggestionsResult ?? [];
  }

  @override
  Future<WordModel> getWordById(int id) => throw UnimplementedError();

  @override
  Future<WordModel> getRandomCoreWord() => throw UnimplementedError();

  @override
  Future<List<String>> getSynonymsForWord(int wordId) =>
      throw UnimplementedError();

  @override
  Future<List<String>> getAntonymsForWord(int wordId) =>
      throw UnimplementedError();

  @override
  Future<List<String>> getCollocationsForWord(int wordId) =>
      throw UnimplementedError();

  @override
  Future<List<WordExampleModel>> getExamplesForWord(int wordId) =>
      throw UnimplementedError();

  @override
  Future<Map<int, String>> getExampleTranslationsForWord(int wordId) =>
      throw UnimplementedError();

  @override
  Future<List<WordDerivativeModel>> getDerivativesForWord(int wordId) =>
      throw UnimplementedError();

  @override
  Future<List<WordRootModel>> getRootsForWord(int wordId) =>
      throw UnimplementedError();
}

void main() {
  late SearchRepositoryImpl repository;
  late MockWordLocalDataSource mockDataSource;

  setUp(() {
    mockDataSource = MockWordLocalDataSource();
    repository = SearchRepositoryImpl(localDataSource: mockDataSource);
  });

  group('searchWords', () {
    test('should return Word Entities list when success', () async {
      // Arrange
      mockDataSource.searchWordsResult = [
        const WordModel(id: 1, word: 'ABATE'),
      ];

      // Act
      final result = await repository.searchWords('abate');

      // Assert
      expect(result.isRight(), true);
      result.fold(
        (failure) => fail('Should not return failure'),
        (words) {
          expect(words.length, 1);
          expect(words[0].word, 'ABATE');
        },
      );
    });

    test('should return DatabaseFailure on database error exceptions',
        () async {
      // Arrange
      mockDataSource.dbException = Exception('Disk error');

      // Act
      final result = await repository.searchWords('abate');

      // Assert
      expect(result.isLeft(), true);
      result.fold(
        (failure) => expect(failure, isA<DatabaseFailure>()),
        (_) => fail('Should return database failure'),
      );
    });
  });
}
