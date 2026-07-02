import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/dictionary/domain/repositories/word_repository.dart';
import '../../../../../lib/features/dictionary/domain/usecases/get_word_details.dart';

class MockWordRepository implements WordRepository {
  Either<Failure, Word>? getWordDetailsResult;

  @override
  Future<Either<Failure, Word>> getWordDetails(int id) async {
    return getWordDetailsResult ??
        const Left(DatabaseFailure('No mock configured'));
  }

  @override
  Future<Either<Failure, Word>> getRandomCoreWord() {
    throw UnimplementedError();
  }
}

void main() {
  late GetWordDetailsUseCase useCase;
  late MockWordRepository mockRepository;

  setUp(() {
    mockRepository = MockWordRepository();
    useCase = GetWordDetailsUseCase(mockRepository);
  });

  test('should return word details from repository when successful', () async {
    // Arrange
    final tWord = Word(id: 1, word: 'ABATE');
    mockRepository.getWordDetailsResult = Right(tWord);

    // Act
    final result = await useCase(1);

    // Assert
    expect(result, Right(tWord));
  });
}
