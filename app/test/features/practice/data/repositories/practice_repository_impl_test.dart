import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/practice/data/datasources/practice_local_data_source.dart';
import '../../../../../lib/features/practice/data/repositories/practice_repository_impl.dart';
import '../../../../../lib/features/review/data/models/review_card_model.dart';

class MockPracticeLocalDataSource implements PracticeLocalDataSource {
  List<ReviewCardModel>? cardsResult;
  List<Map<String, dynamic>>? poolResult;
  Exception? dbException;

  @override
  Future<List<ReviewCardModel>> getPracticeCards() async {
    if (dbException != null) throw dbException!;
    return cardsResult ?? [];
  }

  @override
  Future<List<Map<String, dynamic>>> getDictionaryPool() async {
    if (dbException != null) throw dbException!;
    return poolResult ?? [];
  }
}

void main() {
  late PracticeRepositoryImpl repository;
  late MockPracticeLocalDataSource mockDataSource;
  final now = DateTime(2026, 7, 2, 12, 0);

  setUp(() {
    mockDataSource = MockPracticeLocalDataSource();
    repository = PracticeRepositoryImpl(localDataSource: mockDataSource);
  });

  group('PracticeRepositoryImpl Unit Tests', () {
    test('should load practice cards correctly', () async {
      mockDataSource.cardsResult = [
        const ReviewCardModel(
          wordId: 1,
          word: 'ABATE',
          learningState: 'learning',
        ),
      ];

      final result = await repository.loadPracticeCards(limit: 5, now: now);

      expect(result.isRight(), true);
      result.fold(
        (_) => fail('Should not fail'),
        (cards) {
          expect(cards.length, 1);
          expect(cards.first.word.word, 'ABATE');
        },
      );
    });

    test('should return DatabaseFailure on local datasource exception', () async {
      mockDataSource.dbException = Exception('Disk error');

      final result = await repository.loadDictionaryPool();

      expect(result.isLeft(), true);
      result.fold(
        (failure) => expect(failure, isA<DatabaseFailure>()),
        (_) => fail('Should return database failure'),
      );
    });
  });
}
