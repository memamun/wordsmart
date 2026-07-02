import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/study_session.dart';
import '../repositories/review_repository.dart';

class FinishReviewSessionUseCase {
  final ReviewRepository repository;

  FinishReviewSessionUseCase(this.repository);

  Future<Either<Failure, void>> call(StudySession session) async {
    return repository.logStudySession(session);
  }
}
