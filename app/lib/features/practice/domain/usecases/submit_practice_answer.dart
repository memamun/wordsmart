import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../review/domain/entities/review_card.dart';
import '../../../review/domain/usecases/submit_card_review.dart';

class SubmitPracticeAnswerParams {
  final ReviewCard card;
  final bool isCorrect;
  final Duration responseTime;
  final DateTime now;
  final String sessionId;

  SubmitPracticeAnswerParams({
    required this.card,
    required this.isCorrect,
    required this.responseTime,
    required this.now,
    required this.sessionId,
  });
}

class SubmitPracticeAnswerUseCase {
  final SubmitCardReviewUseCase submitCardReviewUseCase;

  SubmitPracticeAnswerUseCase({required this.submitCardReviewUseCase});

  Future<Either<Failure, void>> call(SubmitPracticeAnswerParams params) async {
    return submitCardReviewUseCase(
      card: params.card,
      isCorrect: params.isCorrect,
      responseTime: params.responseTime,
      hintUsed: false,
      now: params.now,
      sessionId: params.sessionId,
      sessionMode: 'practice',
    );
  }
}
