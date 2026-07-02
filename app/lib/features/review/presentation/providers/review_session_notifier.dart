import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/learning/usecases/submit_learning_result.dart';
import '../../domain/usecases/start_review_session.dart';
import '../../domain/usecases/finish_review_session.dart';
import 'review_session_state.dart';

class ReviewSessionNotifier extends StateNotifier<ReviewSessionState> {
  final StartReviewSessionUseCase startReviewSessionUseCase;
  final SubmitLearningResultUseCase submitLearningResultUseCase;
  final FinishReviewSessionUseCase finishReviewSessionUseCase;

  ReviewSessionNotifier({
    required this.startReviewSessionUseCase,
    required this.submitLearningResultUseCase,
    required this.finishReviewSessionUseCase,
  }) : super(const ReviewSessionInitial());

  Future<void> startSession({
    required String sessionId,
    required int limit,
    required DateTime now,
  }) async {
    state = const ReviewSessionLoading();
    final result = await startReviewSessionUseCase(
      sessionId: sessionId,
      limit: limit,
      now: now,
    );

    state = result.fold(
      (failure) => ReviewSessionFailure(failure),
      (session) => ReviewSessionActive(session: session),
    );
  }

  void flipCard() {
    final currentState = state;
    if (currentState is ReviewSessionActive) {
      state = currentState.copyWith(isFrontSide: !currentState.isFrontSide);
    }
  }

  Future<void> submitReview({
    required bool isCorrect,
    required Duration responseTime,
    required bool hintUsed,
    required DateTime now,
  }) async {
    final currentState = state;
    if (currentState is ReviewSessionActive) {
      if (isCorrect) {
        HapticFeedback.vibrate().catchError((_) {});
      } else {
        HapticFeedback.heavyImpact().catchError((_) {});
      }
      state = currentState.copyWith(isSubmitting: true);

      final session = currentState.session;
      final currentCard = session.currentCard;

      // Submit card review to persistence layer
      final result = await submitLearningResultUseCase(
        card: currentCard,
        isCorrect: isCorrect,
        responseTime: responseTime,
        hintUsed: hintUsed,
        now: now,
        sessionId: session.id,
        sessionMode: session.mode.toString().split('.').last,
      );

      result.fold(
        (failure) => state = ReviewSessionFailure(failure),
        (_) async {
          // Track answer correct metrics on the active session entity
          var updatedSession = session.answer(isCorrect: isCorrect);

          if (updatedSession.isFinished) {
            // Log study session completion
            final finishResult = await finishReviewSessionUseCase(
              updatedSession.toStudySession(now),
            );

            finishResult.fold(
              (failure) => state = ReviewSessionFailure(failure),
              (_) => state = ReviewSessionCompleted(updatedSession),
            );
          } else {
            // Progress to next card in deck
            updatedSession = updatedSession.nextCard();
            state = ReviewSessionActive(
              session: updatedSession,
              isFrontSide: true,
              isSubmitting: false,
            );
          }
        },
      );
    }
  }
}
