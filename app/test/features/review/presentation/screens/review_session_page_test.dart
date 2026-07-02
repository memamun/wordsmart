import 'package:dartz/dartz.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/core/learning/entities/learning_card.dart';
import '../../../../../lib/core/learning/entities/learning_value_objects.dart';
import '../../../../../lib/core/learning/usecases/submit_learning_result.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/review/domain/entities/review_queue.dart';
import '../../../../../lib/features/review/domain/entities/review_session.dart';
import '../../../../../lib/features/review/domain/usecases/finish_review_session.dart';
import '../../../../../lib/features/review/domain/usecases/start_review_session.dart';
import '../../../../../lib/features/review/presentation/providers/providers.dart';
import '../../../../../lib/features/review/presentation/screens/review_session_page.dart';
import '../../../../../lib/features/review/presentation/widgets/review_loading_skeleton.dart';

class MockStartReviewSessionUseCase implements StartReviewSessionUseCase {
  Either<Failure, ReviewSession>? result;
  @override
  late final repository = throw UnimplementedError();

  @override
  Future<Either<Failure, ReviewSession>> call(
      {required String sessionId,
      required int limit,
      required DateTime now}) async {
    return result ?? const Left(DatabaseFailure('Error'));
  }
}

class MockSubmitLearningResultUseCase implements SubmitLearningResultUseCase {
  Either<Failure, void>? result;
  @override
  late final repository = throw UnimplementedError();
  @override
  late final signalAnalyzer = throw UnimplementedError();
  @override
  late final sm2Engine = throw UnimplementedError();

  @override
  Future<Either<Failure, void>> call({
    required LearningCard card,
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
  Future<Either<Failure, void>> call(dynamic session) async {
    return result ?? const Right(null);
  }
}

void main() {
  final now = DateTime(2026, 7, 2, 12, 0);
  final tWord = Word(id: 1, word: 'ABATE');
  final tCard = LearningCard(
    word: tWord,
    learningState: LearningState.newCard,
    isDue: true,
    priority: ReviewPriority.medium,
    easinessFactor: 2.5,
    intervalDays: 0,
    repetitionCount: 0,
    mode: ReviewMode.newCard,
  );

  testWidgets(
      'should render loading skeleton initially when session is starting',
      (WidgetTester tester) async {
    final mockStart = MockStartReviewSessionUseCase();
    final mockSubmit = MockSubmitLearningResultUseCase();
    final mockFinish = MockFinishReviewSessionUseCase();

    final queue = ReviewQueue(id: 'q1', createdAt: now, cards: [tCard]);
    mockStart.result =
        Right(ReviewSession(id: 's1', queue: queue, startedAt: now));

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          reviewSessionProvider.overrideWith((ref) => ReviewSessionNotifier(
                startReviewSessionUseCase: mockStart,
                submitLearningResultUseCase: mockSubmit,
                finishReviewSessionUseCase: mockFinish,
              )),
        ],
        child: const MaterialApp(
          home: ReviewSessionPage(),
        ),
      ),
    );

    // Initial load should display loading skeleton
    expect(find.byType(ReviewLoadingSkeleton), findsOneWidget);
  });
}
