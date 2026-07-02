import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/review/domain/entities/learning_metrics.dart';
import '../../../../../lib/features/review/domain/entities/review_card.dart';
import '../../../../../lib/features/review/domain/entities/review_queue.dart';
import '../../../../../lib/features/review/domain/entities/study_session.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';
import '../../../../../lib/features/review/domain/repositories/review_repository.dart';
import '../../../../../lib/features/review/domain/services/learning_signal_analyzer.dart';
import '../../../../../lib/features/review/domain/services/sm2_engine.dart';
import '../../../../../lib/features/review/domain/usecases/get_daily_queue.dart';
import '../../../../../lib/features/review/domain/usecases/get_learning_metrics.dart';
import '../../../../../lib/features/review/domain/usecases/get_progress_summary.dart';
import '../../../../../lib/features/review/domain/usecases/start_review_session.dart';
import '../../../../../lib/features/review/domain/usecases/submit_card_review.dart';
import '../../../../../lib/features/review/domain/usecases/finish_review_session.dart';

class MockReviewRepository implements ReviewRepository {
  Either<Failure, ReviewQueue>? queueResult;
  Either<Failure, LearningMetrics>? metricsResult;
  Either<Failure, void>? saveResult;

  @override
  Future<Either<Failure, ReviewQueue>> getDailyQueue({required int limit, required DateTime now}) async {
    return queueResult ?? const Left(DatabaseFailure('Error'));
  }

  @override
  Future<Either<Failure, void>> saveReviewResult({
    required int wordId,
    required int score,
    required int durationMs,
    required double easinessFactor,
    required int intervalDays,
    required int repetitionCount,
    required String learningState,
    required int masteryScore,
    required DateTime now,
    required String sessionId,
    required String sessionMode,
  }) async {
    return saveResult ?? const Right(null);
  }

  @override
  Future<Either<Failure, LearningMetrics>> getLearningMetrics({required DateTime now}) async {
    return metricsResult ?? const Left(DatabaseFailure('Error'));
  }

  @override
  Future<Either<Failure, void>> logStudySession(StudySession session) async {
    return const Right(null);
  }
}

void main() {
  late MockReviewRepository mockRepository;
  final now = DateTime(2026, 7, 2, 12, 0);
  final tWord = Word(id: 1, word: 'ABATE');
  
  final tCard = ReviewCard(
    word: tWord,
    learningState: LearningState.newCard,
    isDue: true,
    priority: ReviewPriority.medium,
    easinessFactor: 2.5,
    intervalDays: 0,
    repetitionCount: 0,
    mode: ReviewMode.newCard,
  );

  setUp(() {
    mockRepository = MockReviewRepository();
  });

  group('GetDailyQueueUseCase', () {
    test('should fetch daily review queue from repository', () async {
      final usecase = GetDailyQueueUseCase(mockRepository);
      final queue = ReviewQueue(id: 'q1', createdAt: now, cards: [tCard]);
      mockRepository.queueResult = Right(queue);

      final result = await usecase(limit: 5, now: now);

      expect(result, Right(queue));
    });
  });

  group('StartReviewSessionUseCase', () {
    test('should load queue and initialize a ReviewSession', () async {
      final usecase = StartReviewSessionUseCase(mockRepository);
      final queue = ReviewQueue(id: 'q1', createdAt: now, cards: [tCard]);
      mockRepository.queueResult = Right(queue);

      final result = await usecase(sessionId: 'session-123', limit: 5, now: now);

      expect(result.isRight(), true);
      result.fold(
        (_) => fail('Should not fail'),
        (session) {
          expect(session.id, 'session-123');
          expect(session.queue, queue);
        },
      );
    });
  });

  group('SubmitCardReviewUseCase', () {
    test('should analyze signals, compute spacing, and save results via repository', () async {
      final usecase = SubmitCardReviewUseCase(
        repository: mockRepository,
        signalAnalyzer: const LearningSignalAnalyzer(),
        sm2Engine: const SM2Engine(),
      );

      final result = await usecase(
        card: tCard,
        isCorrect: true,
        responseTime: const Duration(seconds: 4),
        hintUsed: false,
        now: now,
        sessionId: 'session-123',
        sessionMode: 'review',
      );

      expect(result, const Right(null));
    });
  });

  group('GetProgressSummaryUseCase', () {
    test('should fetch metrics and map lightweight progress summary correctly', () async {
      final usecase = GetProgressSummaryUseCase(mockRepository);
      final metrics = LearningMetrics(
        streak: StudyStreak(current: 4, longest: 10),
        masteredWords: 15,
        learningWords: 5,
        reviewingWords: 10,
        dueToday: 8,
        studyMinutesToday: 12,
        accuracy: const Accuracy(85.0),
        retentionRate: const RetentionRate(85.0),
      );
      mockRepository.metricsResult = Right(metrics);

      final result = await usecase(now: now);

      expect(result.isRight(), true);
      result.fold(
        (_) => fail('Should not fail'),
        (summary) {
          expect(summary.dueToday, 8);
          expect(summary.mastered, 15);
          expect(summary.streakDays, 4);
        },
      );
    });
  });
}
