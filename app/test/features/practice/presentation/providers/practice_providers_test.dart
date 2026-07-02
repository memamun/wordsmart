import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/dictionary/domain/entities/word.dart';
import '../../../../../lib/features/practice/domain/entities/practice_question.dart';
import '../../../../../lib/features/practice/domain/entities/practice_session.dart';
import '../../../../../lib/features/practice/domain/usecases/finish_practice_session.dart';
import '../../../../../lib/features/practice/domain/usecases/get_practice_session.dart';
import '../../../../../lib/features/practice/domain/usecases/submit_practice_answer.dart';
import '../../../../../lib/features/practice/presentation/providers/practice_session_notifier.dart';
import '../../../../../lib/features/practice/presentation/providers/practice_session_state.dart';

class MockGetPracticeSessionUseCase implements GetPracticeSessionUseCase {
  PracticeSession? sessionResult;
  Failure? failure;

  @override
  Future<Either<Failure, PracticeSession>> call(
      GetPracticeSessionParams params) async {
    if (failure != null) return Left(failure!);
    return Right(sessionResult!);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockSubmitPracticeAnswerUseCase implements SubmitPracticeAnswerUseCase {
  @override
  Future<Either<Failure, void>> call(SubmitPracticeAnswerParams params) async {
    return const Right(null);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockFinishPracticeSessionUseCase implements FinishPracticeSessionUseCase {
  @override
  Future<Either<Failure, void>> call(FinishPracticeSessionParams params) async {
    return const Right(null);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  late PracticeSessionNotifier notifier;
  late MockGetPracticeSessionUseCase mockGetSessionUseCase;
  late MockSubmitPracticeAnswerUseCase mockSubmitAnswerUseCase;
  late MockFinishPracticeSessionUseCase mockFinishSessionUseCase;

  final tWord = Word(id: 1, word: 'ABATE', definition: 'to reduce');
  final question = PracticeQuestion(
    word: tWord,
    type: QuestionType.definitionMCQ,
    prompt: 'Definition of ABATE',
    options: ['to reduce', 'to increase'],
    correctAnswer: 'to reduce',
  );

  final now = DateTime(2026, 7, 2);

  setUp(() {
    mockGetSessionUseCase = MockGetPracticeSessionUseCase();
    mockSubmitAnswerUseCase = MockSubmitPracticeAnswerUseCase();
    mockFinishSessionUseCase = MockFinishPracticeSessionUseCase();

    notifier = PracticeSessionNotifier(
      getPracticeSessionUseCase: mockGetSessionUseCase,
      submitPracticeAnswerUseCase: mockSubmitAnswerUseCase,
      finishPracticeSessionUseCase: mockFinishSessionUseCase,
    );
  });

  group('PracticeSessionNotifier Provider Unit Tests', () {
    test('should progress from Loading to Active on startSession', () async {
      final session =
          PracticeSession(id: 's1', questions: [question], startedAt: now);
      mockGetSessionUseCase.sessionResult = session;

      final states = <PracticeSessionState>[];
      notifier.addListener((state) => states.add(state));

      await notifier.startSession(
          id: 's1', limit: 5, mode: PracticeMode.definition, now: now);

      expect(states[1], isA<PracticeSessionLoading>());
      expect(states[2], isA<PracticeSessionActive>());
      expect((states[2] as PracticeSessionActive).currentQuestion.word.word,
          'ABATE');
    });

    test('should update selected answer on selectAnswer', () async {
      final session =
          PracticeSession(id: 's1', questions: [question], startedAt: now);
      mockGetSessionUseCase.sessionResult = session;
      await notifier.startSession(
          id: 's1', limit: 5, mode: PracticeMode.definition, now: now);

      notifier.selectAnswer('to reduce');
      expect((notifier.state as PracticeSessionActive).selectedAnswer,
          'to reduce');
    });

    test('should transition to Completed on submitting final question',
        () async {
      final session =
          PracticeSession(id: 's1', questions: [question], startedAt: now);
      mockGetSessionUseCase.sessionResult = session;
      await notifier.startSession(
          id: 's1', limit: 5, mode: PracticeMode.definition, now: now);

      notifier.selectAnswer('to reduce');
      await notifier.submitAnswer(now);

      await notifier.nextQuestion(now.add(const Duration(seconds: 10)));

      expect(notifier.state, isA<PracticeSessionCompleted>());
    });
  });
}
