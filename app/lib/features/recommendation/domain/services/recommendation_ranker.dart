import '../entities/recommendation_candidate.dart';
import 'recommendation_scorer.dart';

class RecommendationRanker {
  final RecommendationScorer scorer;

  const RecommendationRanker({required this.scorer});

  List<RecommendationCandidate> rank(List<RecommendationCandidate> candidates) {
    final scored = candidates.map((c) => (c, scorer.score(c))).toList();
    scored.sort((a, b) => b.$2.compareTo(a.$2));
    return scored.map((e) => e.$1).toList();
  }

  List<RecommendationCandidate> deduplicate(
      List<RecommendationCandidate> ranked) {
    final seen = <String>{};
    return ranked.where((c) => seen.add(c.id)).toList();
  }

  List<RecommendationCandidate> cap(List<RecommendationCandidate> ranked,
      {int max = 5}) {
    return ranked.take(max).toList();
  }

  List<RecommendationCandidate> process(
    List<RecommendationCandidate> candidates, {
    int max = 5,
  }) {
    final ranked = rank(candidates);
    final deduped = deduplicate(ranked);
    return cap(deduped, max: max);
  }
}
