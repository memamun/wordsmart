import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/learning/entities/learning_card.dart';
import '../../../../core/learning/usecases/submit_learning_result.dart';

class SubmitPracticeAnswerParams {
  final LearningCard card;
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
  final SubmitLearningResultUseCase submitLearningResultUseCase;

  SubmitPracticeAnswerUseCase({required this.submitLearningResultUseCase});

  Future<Either<Failure, void>> call(SubmitPracticeAnswerParams params) async {
    return submitLearningResultUseCase(
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
