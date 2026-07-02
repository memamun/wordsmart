import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/recommendation_candidate.dart';

abstract class RecommendationRepository {
  Future<Either<Failure, List<RecommendationCandidate>>> getCandidates();
  Future<Either<Failure, void>> dismissRecommendation(String id);
  Future<Either<Failure, void>> completeRecommendation(String id);
}
