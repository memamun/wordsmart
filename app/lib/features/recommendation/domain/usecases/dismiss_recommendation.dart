import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/recommendation_repository.dart';

class DismissRecommendationUseCase {
  final RecommendationRepository repository;

  const DismissRecommendationUseCase(this.repository);

  Future<Either<Failure, void>> call(String id) {
    return repository.dismissRecommendation(id);
  }
}
