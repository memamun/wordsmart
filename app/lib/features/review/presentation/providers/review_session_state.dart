import '../../../../core/error/failures.dart';
import '../../../../core/learning/entities/learning_card.dart';
import '../../domain/entities/review_session.dart';

abstract class ReviewSessionState {
  const ReviewSessionState();
}

class ReviewSessionInitial extends ReviewSessionState {
  const ReviewSessionInitial();
}

class ReviewSessionLoading extends ReviewSessionState {
  const ReviewSessionLoading();
}

class ReviewSessionActive extends ReviewSessionState {
  final ReviewSession session;
  final bool isFrontSide;
  final bool isSubmitting;

  const ReviewSessionActive({
    required this.session,
    this.isFrontSide = true,
    this.isSubmitting = false,
  });

  LearningCard get currentCard => session.currentCard;
  int get currentIndex => session.currentIndex;
  int get remainingCards => session.queue.cards.length - session.currentIndex;

  ReviewSessionActive copyWith({
    ReviewSession? session,
    bool? isFrontSide,
    bool? isSubmitting,
  }) {
    return ReviewSessionActive(
      session: session ?? this.session,
      isFrontSide: isFrontSide ?? this.isFrontSide,
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }
}

class ReviewSessionCompleted extends ReviewSessionState {
  final ReviewSession session;
  const ReviewSessionCompleted(this.session);
}

class ReviewSessionFailure extends ReviewSessionState {
  final Failure failure;
  const ReviewSessionFailure(this.failure);
}
