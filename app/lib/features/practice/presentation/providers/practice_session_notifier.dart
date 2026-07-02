import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/learning/entities/learning_card.dart';
import '../../../../core/learning/entities/learning_value_objects.dart';
import '../../domain/entities/practice_question.dart';
import '../../domain/entities/practice_summary.dart';
import '../../domain/usecases/finish_practice_session.dart';
import '../../domain/usecases/get_practice_session.dart';
import '../../domain/usecases/submit_practice_answer.dart';
import 'practice_session_state.dart';

class PracticeSessionNotifier extends StateNotifier<PracticeSessionState> {
  final GetPracticeSessionUseCase getPracticeSessionUseCase;
  final SubmitPracticeAnswerUseCase submitPracticeAnswerUseCase;
  final FinishPracticeSessionUseCase finishPracticeSessionUseCase;

  DateTime? _questionStartTime;

  PracticeSessionNotifier({
    required this.getPracticeSessionUseCase,
    required this.submitPracticeAnswerUseCase,
    required this.finishPracticeSessionUseCase,
  }) : super(const PracticeSessionInitial());

  Future<void> startSession({
    required String id,
    required int limit,
    required PracticeMode mode,
    required DateTime now,
  }) async {
    state = const PracticeSessionLoading();
    final result = await getPracticeSessionUseCase(
      GetPracticeSessionParams(id: id, limit: limit, mode: mode, now: now),
    );

    result.fold(
      (failure) => state = PracticeSessionFailure(failure),
      (session) {
        state = PracticeSessionActive(session: session);
        _questionStartTime = now;
      },
    );
  }

  void selectAnswer(String answer) {
    final activeState = state;
    if (activeState is PracticeSessionActive) {
      state = activeState.copyWith(selectedAnswer: answer);
    }
  }

  void updateSpellingInput(String input) {
    final activeState = state;
    if (activeState is PracticeSessionActive) {
      state = activeState.copyWith(spellingInput: input);
    }
  }

  Future<void> submitAnswer(DateTime now) async {
    final activeState = state;
    if (activeState is! PracticeSessionActive || activeState.isSubmitting) return;

    final question = activeState.currentQuestion;
    final isSpelling = question.type == QuestionType.spelling;
    
    final answerText = isSpelling 
        ? (activeState.spellingInput ?? '').trim().toLowerCase()
        : (activeState.selectedAnswer ?? '');

    final isCorrect = answerText == question.correctAnswer.toLowerCase().trim();
    final responseTime = _questionStartTime != null 
        ? now.difference(_questionStartTime!) 
        : const Duration(seconds: 5);

    state = activeState.copyWith(isSubmitting: true, isAnswerCorrect: isCorrect);

    // Create a mock/stub ReviewCard context from Word to submit SM-2 update
    final mockCard = ReviewCard(
      word: question.word,
      learningState: LearningState.learning,
      isDue: true,
      priority: ReviewPriority.medium,
      easinessFactor: 2.5,
      intervalDays: 0,
      repetitionCount: 0,
      mode: ReviewMode.newCard,
    );

    final submitResult = await submitPracticeAnswerUseCase(
      SubmitPracticeAnswerParams(
        card: mockCard,
        isCorrect: isCorrect,
        responseTime: responseTime,
        now: now,
        sessionId: activeState.session.id,
      ),
    );

    submitResult.fold(
      (failure) {
        state = PracticeSessionFailure(failure);
      },
      (_) {
        activeState.session.answerQuestion(answerText, isCorrect, responseTime);
        state = activeState.copyWith(isSubmitting: false, isAnswerCorrect: isCorrect);
      },
    );
  }

  Future<void> nextQuestion(DateTime now) async {
    final activeState = state;
    if (activeState is! PracticeSessionActive) return;

    activeState.session.nextQuestion();

    if (activeState.session.isFinished) {
      state = const PracticeSessionLoading();
      final finishedAt = now;
      final duration = finishedAt.difference(activeState.session.startedAt);

      final finishResult = await finishPracticeSessionUseCase(
        FinishPracticeSessionParams(session: activeState.session, finishedAt: finishedAt),
      );

      finishResult.fold(
        (failure) => state = PracticeSessionFailure(failure),
        (_) {
          final summary = PracticeSummary(
            sessionId: activeState.session.id,
            totalQuestions: activeState.session.questions.length,
            correctAnswers: activeState.session.correctAnswersCount,
            incorrectAnswers: activeState.session.incorrectAnswersCount,
            accuracy: activeState.session.questions.isEmpty 
                ? 0.0 
                : (activeState.session.correctAnswersCount / activeState.session.questions.length) * 100,
            totalDuration: duration,
          );
          state = PracticeSessionCompleted(summary);
        },
      );
    } else {
      state = activeState.nextState(nextSession: activeState.session);
      _questionStartTime = now;
    }
  }
}
