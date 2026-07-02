import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/dictionary/domain/repositories/word_repository.dart';
import '../../../../../lib/features/dictionary/domain/usecases/get_word_details.dart';
import '../../../../../lib/features/dictionary/presentation/providers/word_details_notifier.dart';

class MockWordRepository implements WordRepository {
  @override
  Future<Either<Failure, Word>> getWordDetails(int id) => throw UnimplementedError();
  @override
  Future<Either<Failure, Word>> getRandomCoreWord() => throw UnimplementedError();
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
    notifier = WordDetailsNotifier(getWordDetailsUseCase: mockUseCase);
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
