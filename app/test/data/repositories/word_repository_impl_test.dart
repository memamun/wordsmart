import 'package:flutter_test/flutter_test.dart';
import '../../../lib/core/error/failures.dart';
import '../../../lib/features/dictionary/data/datasources/word_local_data_source.dart';
import '../../../lib/features/dictionary/data/models/word_derivative_model.dart';
import '../../../lib/features/dictionary/data/models/word_example_model.dart';
import '../../../lib/features/dictionary/data/models/word_model.dart';
import '../../../lib/features/dictionary/data/models/word_root_model.dart';
import '../../../lib/features/dictionary/data/repositories/word_repository_impl.dart';

// Manual Mock implementation for WordLocalDataSource to keep tests dependency-free
class MockWordLocalDataSource implements WordLocalDataSource {
  // Stub fields configured by individual tests
  WordModel? getWordByIdResult;
  Exception? getWordByIdException;

  List<String> getSynonymsResult = [];
  List<String> getAntonymsResult = [];
  List<String> getCollocationsResult = [];
  List<WordExampleModel> getExamplesResult = [];
  Map<int, String> getExampleTranslationsResult = {};
  List<WordDerivativeModel> getDerivativesResult = [];
  List<WordRootModel> getRootsResult = [];

  @override
  Future<WordModel> getWordById(int id) async {
    if (getWordByIdException != null) {
      throw getWordByIdException!;
    }
    if (getWordByIdResult != null) {
      return getWordByIdResult!;
    }
    throw Exception('No stub configured for getWordById');
  }

  @override
  Future<WordModel> getRandomCoreWord() {
    throw UnimplementedError();
  }

  @override
  Future<List<WordModel>> searchWords(String query) {
    throw UnimplementedError();
  }

  @override
  Future<List<String>> getSearchSuggestions(String query) {
    throw UnimplementedError();
  }

  @override
  Future<List<String>> getSynonymsForWord(int wordId) async =>
      getSynonymsResult;

  @override
  Future<List<String>> getAntonymsForWord(int wordId) async =>
      getAntonymsResult;

  @override
  Future<List<String>> getCollocationsForWord(int wordId) async =>
      getCollocationsResult;

  @override
  Future<List<WordExampleModel>> getExamplesForWord(int wordId) async =>
      getExamplesResult;

  @override
  Future<Map<int, String>> getExampleTranslationsForWord(int wordId) async =>
      getExampleTranslationsResult;

  @override
  Future<List<WordDerivativeModel>> getDerivativesForWord(int wordId) async =>
      getDerivativesResult;

  @override
  Future<List<WordRootModel>> getRootsForWord(int wordId) async =>
      getRootsResult;
}

void main() {
  late WordRepositoryImpl repository;
  late MockWordLocalDataSource mockDataSource;

  setUp(() {
    mockDataSource = MockWordLocalDataSource();
    repository = WordRepositoryImpl(localDataSource: mockDataSource);
  });

  group('getWordDetails', () {
    const tWordId = 1;
    final tWordModel = WordModel(
      id: tWordId,
      word: 'ABASH',
      definition: 'to make ashamed',
      bengaliMeaning: 'লজ্জিত করা',
    );

    test(
        'should return Word Entity when the call to local data source is successful',
        () async {
      // Arrange
      mockDataSource.getWordByIdResult = tWordModel;
      mockDataSource.getSynonymsResult = ['embarrass', 'mortify'];
      mockDataSource.getAntonymsResult = ['encourage'];
      mockDataSource.getCollocationsResult = ['feel abashed'];
      mockDataSource.getExamplesResult = [
        const WordExampleModel(
            id: 10, wordId: tWordId, exampleText: 'Meredith felt abashed')
      ];
      mockDataSource.getExampleTranslationsResult = {
        10: 'মেরডিথ অপ্রস্তুত বোধ করছিলেন'
      };
      mockDataSource.getDerivativesResult = [
        const WordDerivativeModel(
            id: 20,
            wordId: tWordId,
            derivativeWord: 'abashment',
            partOfSpeech: 'n')
      ];
      mockDataSource.getRootsResult = [
        const WordRootModel(root: 'AB', meaning: 'off')
      ];

      // Act
      final result = await repository.getWordDetails(tWordId);

      // Assert
      expect(result.isRight(), true);
      result.fold(
        (failure) => fail('Should not return failure'),
        (word) {
          expect(word.id, tWordId);
          expect(word.word, 'ABASH');
          expect(word.synonyms, ['embarrass', 'mortify']);
          expect(word.examples?[0].sentence, 'Meredith felt abashed');
          expect(word.examples?[0].translation, 'মেরডিথ অপ্রস্তুত বোধ করছিলেন');
          expect(word.derivatives?[0].derivative, 'abashment');
          expect(word.roots?[0].root, 'AB');
        },
      );
    });

    test(
        'should return ValidationFailure when database contains corrupted data violating invariants',
        () async {
      // Arrange - Word ID is invalid (<= 0)
      mockDataSource.getWordByIdResult = WordModel(
        id: -1, // Violates id > 0 invariant
        word: 'INVALID',
      );

      // Act
      final result = await repository.getWordDetails(tWordId);

      // Assert
      expect(result.isLeft(), true);
      result.fold(
        (failure) {
          expect(failure, isA<Failure>());
        },
        (_) => fail('Should have returned a failure'),
      );
    });

    test(
        'should return DatabaseFailure when local data source throws a database Exception',
        () async {
      // Arrange
      mockDataSource.getWordByIdException = Exception('SQLite Disk I/O Error');

      // Act
      final result = await repository.getWordDetails(tWordId);

      // Assert
      expect(result.isLeft(), true);
      result.fold(
        (failure) {
          expect(failure, isA<DatabaseFailure>());
          // Ensure database internal exception message is NOT leaked to user
          expect(failure.message,
              'Unable to load word details. Please try again.');
        },
        (_) => fail('Should have returned database failure'),
      );
    });

    test(
        'should load successfully with empty collections when word has no relationships',
        () async {
      // Arrange
      mockDataSource.getWordByIdResult = tWordModel;
      mockDataSource.getSynonymsResult = [];
      mockDataSource.getAntonymsResult = [];
      mockDataSource.getCollocationsResult = [];
      mockDataSource.getExamplesResult = [];
      mockDataSource.getExampleTranslationsResult = {};
      mockDataSource.getDerivativesResult = [];
      mockDataSource.getRootsResult = [];

      // Act
      final result = await repository.getWordDetails(tWordId);

      // Assert
      expect(result.isRight(), true);
      result.fold(
        (failure) => fail('Should not return failure'),
        (word) {
          expect(word.id, tWordId);
          expect(word.synonyms, isEmpty);
          expect(word.examples, isEmpty);
          expect(word.derivatives, isEmpty);
          expect(word.roots, isEmpty);
        },
      );
    });
  });
}
