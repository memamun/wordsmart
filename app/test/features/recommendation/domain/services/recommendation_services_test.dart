import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/recommendation/domain/entities/recommendation_candidate.dart';
import '../../../../../lib/features/recommendation/domain/entities/recommendation.dart';
import '../../../../../lib/features/recommendation/domain/services/recommendation_scorer.dart';
import '../../../../../lib/features/recommendation/domain/services/recommendation_ranker.dart';
import '../../../../../lib/features/recommendation/domain/services/recommendation_candidate_factory.dart';

void main() {
  group('RecommendationScorer', () {
    const scorer = RecommendationScorer();

    test('should score candidate based on weighted sum', () {
      const candidate = RecommendationCandidate(
        id: 'test-1',
        type: RecommendationType.dueReview,
        urgency: 8.0,
        importance: 7.0,
        confidence: 0.9,
        freshness: 1.0,
      );

      final score = scorer.score(candidate);
      // 8*0.4 + 7*0.3 + 0.9*0.2 + 1.0*0.1 = 3.2 + 2.1 + 0.18 + 0.1 = 5.58
      expect(score, closeTo(5.58, 0.01));
    });

    test('should give higher score to more urgent candidates', () {
      const highUrgency = RecommendationCandidate(
        id: 'high',
        type: RecommendationType.dueReview,
        urgency: 10.0,
        importance: 5.0,
        confidence: 0.8,
        freshness: 1.0,
      );

      const lowUrgency = RecommendationCandidate(
        id: 'low',
        type: RecommendationType.dueReview,
        urgency: 2.0,
        importance: 5.0,
        confidence: 0.8,
        freshness: 1.0,
      );

      expect(scorer.score(highUrgency), greaterThan(scorer.score(lowUrgency)));
    });
  });

  group('RecommendationRanker', () {
    const scorer = RecommendationScorer();
    final ranker = RecommendationRanker(scorer: scorer);

    test('should sort candidates by score descending', () {
      const candidates = [
        RecommendationCandidate(
          id: 'low',
          type: RecommendationType.practiceSession,
          urgency: 2.0,
          importance: 3.0,
          confidence: 0.5,
          freshness: 0.8,
        ),
        RecommendationCandidate(
          id: 'high',
          type: RecommendationType.dueReview,
          urgency: 9.0,
          importance: 8.0,
          confidence: 0.95,
          freshness: 1.0,
        ),
      ];

      final ranked = ranker.rank(candidates);
      expect(ranked.first.id, 'high');
      expect(ranked.last.id, 'low');
    });

    test('should deduplicate by id', () {
      const candidates = [
        RecommendationCandidate(
          id: 'review-1',
          type: RecommendationType.dueReview,
          urgency: 8.0,
          importance: 7.0,
          confidence: 0.9,
          freshness: 1.0,
        ),
        RecommendationCandidate(
          id: 'review-1',
          type: RecommendationType.dueReview,
          urgency: 9.0,
          importance: 8.0,
          confidence: 0.95,
          freshness: 1.0,
        ),
      ];

      final deduped = ranker.deduplicate(candidates);
      expect(deduped.length, 1);
    });

    test('should cap at max items', () {
      final candidates = List.generate(
        10,
        (i) => RecommendationCandidate(
          id: 'item-$i',
          type: RecommendationType.dueReview,
          urgency: i.toDouble(),
          importance: 5.0,
          confidence: 0.8,
          freshness: 1.0,
        ),
      );

      final capped = ranker.cap(candidates, max: 3);
      expect(capped.length, 3);
    });

    test('process should rank, deduplicate, and cap', () {
      final candidates = List.generate(
        8,
        (i) => RecommendationCandidate(
          id: 'item-$i',
          type: RecommendationType.values[i % RecommendationType.values.length],
          urgency: (10 - i).toDouble(),
          importance: 5.0,
          confidence: 0.8,
          freshness: 1.0,
        ),
      );

      final result = ranker.process(candidates, max: 5);
      expect(result.length, 5);
      expect(result.first.id, 'item-0');
    });
  });

  group('RecommendationCandidateFactory', () {
    const factory = RecommendationCandidateFactory();

    test('fromDailyGoal should return zero-urgency when goal met', () {
      final candidate = factory.fromDailyGoal(sessionsToday: 3, dailyTarget: 3);
      expect(candidate.urgency, 0);
      expect(candidate.importance, 0);
    });

    test('fromDailyGoal should return positive urgency when goal not met', () {
      final candidate = factory.fromDailyGoal(sessionsToday: 1, dailyTarget: 3);
      expect(candidate.urgency, 2.0);
      expect(candidate.importance, 6.0);
    });

    test('fromWeakWord should scale urgency by mastery gap', () {
      final low = factory.fromWeakWord(wordId: 1, masteryScore: 10.0, incorrectCount: 5);
      final mid = factory.fromWeakWord(wordId: 2, masteryScore: 30.0, incorrectCount: 5);
      expect(low.urgency, greaterThan(mid.urgency));
    });
  });
}
