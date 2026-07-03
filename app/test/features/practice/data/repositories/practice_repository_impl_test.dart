import 'package:flutter_test/flutter_test.dart';
import 'package:wordsmart/core/error/failures.dart';
import 'package:wordsmart/core/learning/entities/learning_card.dart';
import 'package:wordsmart/core/learning/entities/learning_value_objects.dart';
import 'package:wordsmart/core/domain/entities/word.dart';
import 'package:wordsmart/features/practice/data/datasources/practice_local_data_source.dart';
import 'package:wordsmart/features/practice/data/repositories/practice_repository_impl.dart';
import 'package:wordsmart/features/practice/data/models/vocab_drill_model.dart';
import 'package:wordsmart/features/practice/data/models/mcq_quiz_model.dart';
import 'package:wordsmart/features/practice/data/models/quick_quiz_model.dart';
import 'package:wordsmart/features/practice/data/models/advanced_quiz_model.dart';
import 'package:wordsmart/features/practice/data/models/final_exam_model.dart';

class MockPracticeLocalDataSource implements PracticeLocalDataSource {
  List<LearningCard>? cardsResult;
  List<Map<String, dynamic>>? poolResult;
  Exception? dbException;

  @override
  Future<List<LearningCard>> getPracticeCards() async {
    if (dbException != null) throw dbException!;
    return cardsResult ?? [];
  }

  @override
  Future<List<Map<String, dynamic>>> getDictionaryPool() async {
    if (dbException != null) throw dbException!;
    return poolResult ?? [];
  }

  @override
  Future<VocabDrillModel?> getVocabDrill(int wordId) {
    throw UnimplementedError();
  }

  @override
  Future<List<McqQuizModel>> getMcqQuizzes() {
    throw UnimplementedError();
  }

  @override
  Future<List<QuickQuizModel>> getQuickQuizzes() {
    throw UnimplementedError();
  }

  @override
  Future<List<AdvancedQuizModel>> getAdvancedQuizzes() {
    throw UnimplementedError();
  }

  @override
  Future<List<FinalExamModel>> getFinalExams() {
    throw UnimplementedError();
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
        LearningCard(
          word: Word(id: 1, word: 'ABATE'),
          learningState: LearningState.learning,
          isDue: true,
          priority: ReviewPriority.medium,
          easinessFactor: 2.5,
          intervalDays: 1,
          repetitionCount: 1,
          mode: ReviewMode.newCard,
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

    test('should return DatabaseFailure on local datasource exception',
        () async {
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
