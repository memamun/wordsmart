import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/review/domain/entities/learning_metrics.dart';
import '../../../../../lib/features/review/domain/entities/review_card.dart';
import '../../../../../lib/features/review/domain/entities/review_queue.dart';
import '../../../../../lib/features/review/domain/entities/study_session.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';
import '../../../../../lib/features/review/domain/usecases/finish_review_session.dart';
import '../../../../../lib/features/review/domain/usecases/get_daily_queue.dart';
import '../../../../../lib/features/review/domain/usecases/get_learning_metrics.dart';
import '../../../../../lib/features/review/domain/usecases/start_review_session.dart';
import '../../../../../lib/features/review/domain/usecases/submit_card_review.dart';
import '../../../../../lib/features/review/presentation/providers/progress_notifier.dart';
import '../../../../../lib/features/review/presentation/providers/progress_state.dart';
import '../../../../../lib/features/review/presentation/providers/review_queue_notifier.dart';
import '../../../../../lib/features/review/presentation/providers/review_queue_state.dart';
import '../../../../../lib/features/review/presentation/providers/review_session_notifier.dart';
import '../../../../../lib/features/review/presentation/providers/review_session_state.dart';

class MockGetDailyQueueUseCase implements GetDailyQueueUseCase {
  Either<Failure, ReviewQueue>? result;
  @override
  late final repository = throw UnimplementedError();

  @override
  Future<Either<Failure, ReviewQueue>> call({required int limit, required DateTime now}) async {
    return result ?? const Left(DatabaseFailure('Error'));
  }
}

class MockStartReviewSessionUseCase implements StartReviewSessionUseCase {
  Either<Failure, ReviewSession>? result;
  @override
  late final repository = throw UnimplementedError();

  @override
  Future<Either<Failure, ReviewSession>> call({required String sessionId, required int limit, required DateTime now}) async {
    return result ?? const Left(DatabaseFailure('Error'));
  }
}

class MockSubmitCardReviewUseCase implements SubmitCardReviewUseCase {
  Either<Failure, void>? result;
  @override
  late final repository = throw UnimplementedError();
  @override
  late final signalAnalyzer = throw UnimplementedError();
  @override
  late final sm2Engine = throw UnimplementedError();

  @override
  Future<Either<Failure, void>> call({
    required ReviewCard card,
    required bool isCorrect,
    required Duration responseTime,
    required bool hintUsed,
    required DateTime now,
    required String sessionId,
    required String sessionMode,
  }) async {
    return result ?? const Right(null);
  }
}

class MockFinishReviewSessionUseCase implements FinishReviewSessionUseCase {
  Either<Failure, void>? result;
  @override
  late final repository = throw UnimplementedError();

  @override
  Future<Either<Failure, void>> call(StudySession session) async {
    return result ?? const Right(null);
  }
}

class MockGetLearningMetricsUseCase implements GetLearningMetricsUseCase {
  Either<Failure, LearningMetrics>? result;
  @override
  late final repository = throw UnimplementedError();

  @override
  Future<Either<Failure, LearningMetrics>> call({required DateTime now}) async {
    return result ?? const Left(DatabaseFailure('Error'));
  }
}

void main() {
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

  group('ReviewQueueNotifier', () {
    test('should load daily queue and emit Loaded state', () async {
      final mockUseCase = MockGetDailyQueueUseCase();
      final queue = ReviewQueue(id: 'q1', createdAt: now, cards: [tCard]);
      mockUseCase.result = Right(queue);

      final notifier = ReviewQueueNotifier(getDailyQueueUseCase: mockUseCase);
      
      expect(notifier.state, isA<ReviewQueueInitial>());

      final future = notifier.loadQueue(limit: 5, now: now);
      expect(notifier.state, isA<ReviewQueueLoading>());

      await future;
      expect(notifier.state, isA<ReviewQueueLoaded>());
      expect((notifier.state as ReviewQueueLoaded).queue, queue);
    });
  });

  group('ReviewSessionNotifier', () {
    test('should start study session and toggle flipcard status', () async {
      final mockStart = MockStartReviewSessionUseCase();
      final mockSubmit = MockSubmitCardReviewUseCase();
      final mockFinish = MockFinishReviewSessionUseCase();

      final queue = ReviewQueue(id: 'q1', createdAt: now, cards: [tCard]);
      final session = ReviewSession(id: 'session-123', queue: queue, startedAt: now);
      mockStart.result = Right(session);

      final notifier = ReviewSessionNotifier(
        startReviewSessionUseCase: mockStart,
        submitCardReviewUseCase: mockSubmit,
        finishReviewSessionUseCase: mockFinish,
      );

      await notifier.startSession(sessionId: 'session-123', limit: 5, now: now);
      expect(notifier.state, isA<ReviewSessionActive>());

      final activeState = notifier.state as ReviewSessionActive;
      expect(activeState.isFrontSide, true);

      notifier.flipCard();
      expect((notifier.state as ReviewSessionActive).isFrontSide, false);
    });
  });

  group('ProgressNotifier', () {
    test('should load dynamic metrics successfully', () async {
      final mockMetrics = MockGetLearningMetricsUseCase();
      final metrics = LearningMetrics(
        streak: StudyStreak(current: 2, longest: 5),
        masteredWords: 10,
        learningWords: 4,
        reviewingWords: 6,
        dueToday: 3,
        studyMinutesToday: 5,
        accuracy: const Accuracy(90.0),
        retentionRate: const RetentionRate(90.0),
      );
      mockMetrics.result = Right(metrics);

      final notifier = ProgressNotifier(getLearningMetricsUseCase: mockMetrics);

      await notifier.loadMetrics(now: now);
      expect(notifier.state, isA<ProgressLoaded>());
    });
  });
}
