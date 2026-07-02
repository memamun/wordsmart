import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/learning/entities/learning_value_objects.dart';
import '../../../review/domain/entities/study_session.dart';
import '../../../review/domain/usecases/finish_review_session.dart';
import '../entities/practice_session.dart';

class FinishPracticeSessionParams {
  final PracticeSession session;
  final DateTime finishedAt;

  FinishPracticeSessionParams({
    required this.session,
    required this.finishedAt,
  });
}

class FinishPracticeSessionUseCase {
  final FinishReviewSessionUseCase finishReviewSessionUseCase;

  FinishPracticeSessionUseCase({required this.finishReviewSessionUseCase});

  Future<Either<Failure, void>> call(FinishPracticeSessionParams params) async {
    final durationSeconds =
        params.finishedAt.difference(params.session.startedAt).inSeconds;

    final studySession = StudySession(
      id: params.session.id,
      mode: ReviewMode.review,
      startedAt: params.session.startedAt,
      finishedAt: params.finishedAt,
      reviewedCards: params.session.questions.length,
      correctAnswers: params.session.correctAnswersCount,
      incorrectAnswers: params.session.incorrectAnswersCount,
      duration: StudyDuration(Duration(seconds: durationSeconds)),
    );

    return finishReviewSessionUseCase(studySession);
  }
}
