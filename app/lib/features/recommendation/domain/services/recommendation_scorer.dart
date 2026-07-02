import '../entities/recommendation_candidate.dart';

class RecommendationScorer {
  final double urgencyWeight;
  final double importanceWeight;
  final double confidenceWeight;
  final double freshnessWeight;

  const RecommendationScorer({
    this.urgencyWeight = 0.4,
    this.importanceWeight = 0.3,
    this.confidenceWeight = 0.2,
    this.freshnessWeight = 0.1,
  });

  double score(RecommendationCandidate candidate) {
    return (candidate.urgency * urgencyWeight) +
        (candidate.importance * importanceWeight) +
        (candidate.confidence * confidenceWeight) +
        (candidate.freshness * freshnessWeight);
  }
}
