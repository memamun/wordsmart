import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/review/data/datasources/review_local_data_source.dart';
import '../../../../../lib/features/review/data/models/review_card_model.dart';
import '../../../../../lib/features/review/data/models/study_session_model.dart';
import '../../../../../lib/features/review/data/repositories/review_repository_impl.dart';
import '../../../../../lib/features/review/domain/services/review_queue_builder.dart';

class MockReviewLocalDataSource implements ReviewLocalDataSource {
  List<LearningCardModel>? cardsResult;
  List<StudySessionModel>? sessionsResult;
  Exception? dbException;

  @override
  Future<List<LearningCardModel>> getAllCardsWithProgress() async {
    if (dbException != null) throw dbException!;
    return cardsResult ?? [];
  }

  @override
  Future<void> saveReviewProgress({
    required int wordId,
    required double easeFactor,
    required int intervalDays,
    required int repetitionCount,
    required String learningState,
    required int masteryScore,
    required String nextReviewAt,
    required String lastReviewedAt,
    required StudySessionModel session,
  }) async {
    if (dbException != null) throw dbException!;
  }

  @override
  Future<List<StudySessionModel>> getStudySessions() async {
    if (dbException != null) throw dbException!;
    return sessionsResult ?? [];
  }
}

void main() {
  late ReviewRepositoryImpl repository;
  late MockReviewLocalDataSource mockDataSource;
  final now = DateTime(2026, 7, 2, 12, 0);

  setUp(() {
    mockDataSource = MockReviewLocalDataSource();
    repository = ReviewRepositoryImpl(
      localDataSource: mockDataSource,
      queueBuilder: const ReviewQueueBuilder(),
    );
  });

  group('ReviewRepositoryImpl Unit Tests', () {
    test('should build and return daily queue successfully', () async {
      // Arrange
      mockDataSource.cardsResult = [
        const LearningCardModel(
          wordId: 1,
          word: 'ABATE',
          learningState: 'newCard',
        ),
      ];

      // Act
      final result = await repository.getDailyQueue(limit: 5, now: now);

      // Assert
      expect(result.isRight(), true);
      result.fold(
        (failure) => fail('Should not fail'),
        (queue) {
          expect(queue.cards.length, 1);
          expect(queue.cards.first.word.word, 'ABATE');
        },
      );
    });

    test(
        'should return DatabaseFailure on datasource exception during queue building',
        () async {
      // Arrange
      mockDataSource.dbException = Exception('Disk read error');

      // Act
      final result = await repository.getDailyQueue(limit: 5, now: now);

      // Assert
      expect(result.isLeft(), true);
      result.fold(
        (failure) => expect(failure, isA<DatabaseFailure>()),
        (_) => fail('Should return database failure'),
      );
    });

    test('should save card review progress successfully', () async {
      // Act
      final result = await repository.saveReviewResult(
        wordId: 1,
        score: 4,
        durationMs: 15000,
        easinessFactor: 2.5,
        intervalDays: 6,
        repetitionCount: 2,
        learningState: 'reviewing',
        masteryScore: 80,
        now: now,
        sessionId: 'session-123',
        sessionMode: 'review',
      );

      // Assert
      expect(result.isRight(), true);
    });
  });
}
