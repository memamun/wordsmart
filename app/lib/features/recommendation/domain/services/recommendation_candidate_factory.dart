import '../../../../core/learning/entities/learning_card.dart';
import '../../../../core/learning/entities/learning_value_objects.dart';
import '../../domain/entities/recommendation.dart';
import '../../domain/entities/recommendation_candidate.dart';

class RecommendationCandidateFactory {
  const RecommendationCandidateFactory();

  RecommendationCandidate fromDueReviewCard(LearningCard card, {required int overdueDays}) {
    return RecommendationCandidate(
      id: 'review-${card.word.id}',
      type: RecommendationType.dueReview,
      urgency: overdueDays.toDouble().clamp(0, 10),
      importance: _masteryToImportance(card.easinessFactor),
      confidence: 0.9,
      freshness: 1.0,
      metadata: {
        'wordId': card.word.id,
        'overdueDays': overdueDays,
        'easinessFactor': card.easinessFactor,
      },
    );
  }

  RecommendationCandidate fromStoryProgress({
    required int storyId,
    required double percentComplete,
  }) {
    return RecommendationCandidate(
      id: 'story-$storyId',
      type: RecommendationType.continueStory,
      urgency: percentComplete > 0 ? 6.0 : 2.0,
      importance: 5.0,
      confidence: 0.85,
      freshness: 1.0,
      metadata: {
        'storyId': storyId,
        'percentComplete': percentComplete,
      },
    );
  }

  RecommendationCandidate fromWeakWord({
    required int wordId,
    required double masteryScore,
    required int incorrectCount,
  }) {
    return RecommendationCandidate(
      id: 'weak-$wordId',
      type: RecommendationType.weakWord,
      urgency: (40.0 - masteryScore).clamp(0, 40) / 4.0,
      importance: 7.0,
      confidence: 0.8,
      freshness: 1.0,
      metadata: {
        'wordId': wordId,
        'masteryScore': masteryScore,
        'incorrectCount': incorrectCount,
      },
    );
  }

  RecommendationCandidate fromPracticeGap({
    required int incorrectCount,
    required int totalAttempted,
  }) {
    final errorRate = totalAttempted > 0 ? incorrectCount / totalAttempted : 0.0;
    return RecommendationCandidate(
      id: 'practice-gap-$incorrectCount',
      type: RecommendationType.practiceSession,
      urgency: (errorRate * 8.0).clamp(0, 8),
      importance: 5.0,
      confidence: 0.75,
      freshness: 1.0,
      metadata: {
        'incorrectCount': incorrectCount,
        'totalAttempted': totalAttempted,
      },
    );
  }

  RecommendationCandidate fromDailyGoal({
    required int sessionsToday,
    required int dailyTarget,
  }) {
    if (sessionsToday >= dailyTarget) {
      return RecommendationCandidate(
        id: 'daily-goal-complete',
        type: RecommendationType.dailyGoal,
        urgency: 0,
        importance: 0,
        confidence: 1.0,
        freshness: 1.0,
        metadata: {
          'sessionsToday': sessionsToday,
          'dailyTarget': dailyTarget,
        },
      );
    }
    return RecommendationCandidate(
      id: 'daily-goal-$sessionsToday',
      type: RecommendationType.dailyGoal,
      urgency: (dailyTarget - sessionsToday).toDouble(),
      importance: 6.0,
      confidence: 1.0,
      freshness: 1.0,
      metadata: {
        'sessionsToday': sessionsToday,
        'dailyTarget': dailyTarget,
      },
    );
  }

  double _masteryToImportance(double easinessFactor) {
    if (easinessFactor < 1.5) return 9.0;
    if (easinessFactor < 1.8) return 7.0;
    if (easinessFactor < 2.2) return 5.0;
    if (easinessFactor < 2.5) return 3.0;
    return 1.0;
  }
}
