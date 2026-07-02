import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/recommendation_repository.dart';

class CompleteRecommendationUseCase {
  final RecommendationRepository repository;

  const CompleteRecommendationUseCase(this.repository);

  Future<Either<Failure, void>> call(String id) {
    return repository.completeRecommendation(id);
  }
}
