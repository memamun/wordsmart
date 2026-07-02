import 'recommendation.dart';

class RecommendationCandidate {
  final String id;
  final RecommendationType type;
  final double urgency;
  final double importance;
  final double confidence;
  final double freshness;
  final Map<String, dynamic> metadata;

  const RecommendationCandidate({
    required this.id,
    required this.type,
    required this.urgency,
    required this.importance,
    required this.confidence,
    required this.freshness,
    this.metadata = const {},
  });
}
