import '../../../../core/error/failures.dart';
import '../../domain/entities/practice_question.dart';
import '../../domain/entities/practice_session.dart';
import '../../domain/entities/practice_summary.dart';

abstract class PracticeSessionState {
  const PracticeSessionState();
}

class PracticeSessionInitial extends PracticeSessionState {
  const PracticeSessionInitial();
}

class PracticeSessionLoading extends PracticeSessionState {
  const PracticeSessionLoading();
}

class PracticeSessionActive extends PracticeSessionState {
  final PracticeSession session;
  final bool isSubmitting;
  final String? selectedAnswer;
  final bool? isAnswerCorrect;
  final String? spellingInput;

  const PracticeSessionActive({
    required this.session,
    this.isSubmitting = false,
    this.selectedAnswer,
    this.isAnswerCorrect,
    this.spellingInput,
  });

  PracticeQuestion get currentQuestion => session.currentQuestion;
  int get currentIndex => session.currentIndex;
  int get remainingQuestions => session.questions.length - session.currentIndex;

  PracticeSessionActive copyWith({
    PracticeSession? session,
    bool? isSubmitting,
    String? selectedAnswer,
    bool? isAnswerCorrect,
    String? spellingInput,
  }) {
    return PracticeSessionActive(
      session: session ?? this.session,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      selectedAnswer: selectedAnswer ?? this.selectedAnswer,
      isAnswerCorrect: isAnswerCorrect ?? this.isAnswerCorrect,
      spellingInput: spellingInput ?? this.spellingInput,
    );
  }

  // Helper to clear options on transition
  PracticeSessionActive nextState({required PracticeSession nextSession}) {
    return PracticeSessionActive(
      session: nextSession,
      isSubmitting: false,
      selectedAnswer: null,
      isAnswerCorrect: null,
      spellingInput: null,
    );
  }
}

class PracticeSessionCompleted extends PracticeSessionState {
  final PracticeSummary summary;
  const PracticeSessionCompleted(this.summary);
}

class PracticeSessionFailure extends PracticeSessionState {
  final Failure failure;
  const PracticeSessionFailure(this.failure);
}
