import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/practice/domain/entities/practice_question.dart';
import '../../../../../lib/features/practice/domain/entities/practice_session.dart';
import '../../../../../lib/features/practice/domain/repositories/practice_repository.dart';
import '../../../../../lib/features/practice/domain/services/builders/practice_session_builder.dart';
import '../../../../../lib/features/practice/domain/services/distractors/distractor_provider.dart';
import '../../../../../lib/features/practice/domain/services/factory/question_generator_factory.dart';
import '../../../../../lib/features/practice/domain/usecases/finish_practice_session.dart';
import '../../../../../lib/features/practice/domain/usecases/get_practice_session.dart';
import '../../../../../lib/features/practice/domain/usecases/submit_practice_answer.dart';
import '../../../../../lib/features/review/domain/entities/review_card.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';
import '../../../../../lib/features/review/domain/usecases/finish_review_session.dart';
import '../../../../../lib/features/review/domain/usecases/submit_card_review.dart';

class MockPracticeRepository implements PracticeRepository {
  List<ReviewCard>? cardsResult;
  List<Word>? poolResult;
  Failure? failure;

  @override
  Future<Either<Failure, List<ReviewCard>>> loadPracticeCards({
    required int limit,
    required DateTime now,
  }) async {
    if (failure != null) return Left(failure!);
    return Right(cardsResult ?? []);
  }

  @override
  Future<Either<Failure, List<Word>>> loadDictionaryPool() async {
    if (failure != null) return Left(failure!);
    return Right(poolResult ?? []);
  }
}

class MockSubmitCardReviewUseCase implements SubmitCardReviewUseCase {
  bool called = false;
  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #call) {
      called = true;
      return Future.value(const Right<Failure, void>(null));
    }
    return super.noSuchMethod(invocation);
  }
}

class MockFinishReviewSessionUseCase implements FinishReviewSessionUseCase {
  bool called = false;
  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #call) {
      called = true;
      return Future.value(const Right<Failure, void>(null));
    }
    return super.noSuchMethod(invocation);
  }
}

void main() {
  late MockPracticeRepository mockRepository;
  late GetPracticeSessionUseCase getSessionUseCase;
  late SubmitPracticeAnswerUseCase submitAnswerUseCase;
  late FinishPracticeSessionUseCase finishSessionUseCase;
  late MockSubmitCardReviewUseCase mockSubmitCardUseCase;
  late MockFinishReviewSessionUseCase mockFinishReviewUseCase;

  const distractorProvider = BasicDistractorProvider();
  const factory = QuestionGeneratorFactory(distractorProvider: distractorProvider);
  const builder = PracticeSessionBuilder(generatorFactory: factory);

  final tWord1 = Word(id: 1, word: 'ABATE', definition: 'to reduce');
  final card1 = ReviewCard(
    word: tWord1,
    learningState: LearningState.learning,
    isDue: true,
    priority: ReviewPriority.medium,
    easinessFactor: 2.5,
    intervalDays: 0,
    repetitionCount: 0,
    mode: ReviewMode.newCard,
  );

  final now = DateTime(2026, 7, 2);

  setUp(() {
    mockRepository = MockPracticeRepository();
    getSessionUseCase = GetPracticeSessionUseCase(
      repository: mockRepository,
      builder: builder,
    );

    mockSubmitCardUseCase = MockSubmitCardReviewUseCase();
    submitAnswerUseCase = SubmitPracticeAnswerUseCase(
      submitCardReviewUseCase: mockSubmitCardUseCase,
    );

    mockFinishReviewUseCase = MockFinishReviewSessionUseCase();
    finishSessionUseCase = FinishPracticeSessionUseCase(
      finishReviewSessionUseCase: mockFinishReviewUseCase,
    );
  });

  group('Practice Use Cases Unit Tests', () {
    test('GetPracticeSessionUseCase should return a practice session successfully', () async {
      mockRepository.cardsResult = [card1];
      mockRepository.poolResult = [tWord1];

      final result = await getSessionUseCase(
        GetPracticeSessionParams(id: 's1', limit: 5, mode: PracticeMode.definition, now: now),
      );

      expect(result.isRight(), true);
      result.fold(
        (_) => fail('Should not fail'),
        (session) {
          expect(session.questions.length, 1);
          expect(session.questions.first.word.word, 'ABATE');
        },
      );
    });

    test('SubmitPracticeAnswerUseCase should delegate correct call to SubmitCardReviewUseCase', () async {
      final result = await submitAnswerUseCase(
        SubmitPracticeAnswerParams(card: card1, isCorrect: true, responseTime: const Duration(seconds: 4), now: now, sessionId: 's1'),
      );

      expect(result.isRight(), true);
      expect(mockSubmitCardUseCase.called, true);
    });

    test('FinishPracticeSessionUseCase should delegate correct call to FinishReviewSessionUseCase', () async {
      final session = PracticeSession(id: 's1', questions: [], startedAt: now);
      final result = await finishSessionUseCase(
        FinishPracticeSessionParams(session: session, finishedAt: now.add(const Duration(seconds: 10))),
      );

      expect(result.isRight(), true);
      expect(mockFinishReviewUseCase.called, true);
    });
  });
}
