import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/recommendation.dart';
import '../entities/recommendation_candidate.dart';
import '../repositories/recommendation_repository.dart';
import '../services/recommendation_ranker.dart';

class GetRecommendationsUseCase {
  final RecommendationRepository repository;
  final RecommendationRanker ranker;

  const GetRecommendationsUseCase({
    required this.repository,
    required this.ranker,
  });

  Future<Either<Failure, List<Recommendation>>> call({int max = 5}) async {
    final candidatesResult = await repository.getCandidates();
    return candidatesResult.fold(
      (failure) => Left(failure),
      (candidates) {
        final ranked = ranker.process(candidates, max: max);
        final recommendations = ranked.map(_toRecommendation).toList();
        return Right(recommendations);
      },
    );
  }

  Recommendation _toRecommendation(RecommendationCandidate candidate) {
    return Recommendation(
      id: candidate.id,
      type: candidate.type,
      title: _titleFor(candidate),
      subtitle: _subtitleFor(candidate),
      reason: _reasonFor(candidate),
      actionLabel: _actionLabelFor(candidate),
      priority: candidate.urgency.round(),
      metadata: candidate.metadata,
    );
  }

  String _titleFor(RecommendationCandidate c) {
    switch (c.type) {
      case RecommendationType.dueReview:
        return 'Review overdue words';
      case RecommendationType.continueStory:
        return 'Continue reading';
      case RecommendationType.weakWord:
        return 'Strengthen weak words';
      case RecommendationType.practiceSession:
        return 'Practice session';
      case RecommendationType.dailyGoal:
        return 'Daily goal';
    }
  }

  String _subtitleFor(RecommendationCandidate c) {
    switch (c.type) {
      case RecommendationType.dueReview:
        final days = c.metadata['overdueDays'] ?? 0;
        return '$days day${days == 1 ? '' : 's'} overdue';
      case RecommendationType.continueStory:
        final pct = c.metadata['percentComplete'] ?? 0;
        return '${(pct as double).round()}% complete';
      case RecommendationType.weakWord:
        final mastery = c.metadata['masteryScore'] ?? 0;
        return 'Mastery: ${(mastery as double).round()}%';
      case RecommendationType.practiceSession:
        final count = c.metadata['incorrectCount'] ?? 0;
        return '$count wrong answers to review';
      case RecommendationType.dailyGoal:
        final today = c.metadata['sessionsToday'] ?? 0;
        final target = c.metadata['dailyTarget'] ?? 3;
        return '$today of $target sessions done';
    }
  }

  String _reasonFor(RecommendationCandidate c) {
    switch (c.type) {
      case RecommendationType.dueReview:
        return 'Spaced repetition schedule';
      case RecommendationType.continueStory:
        return 'Incomplete reading session';
      case RecommendationType.weakWord:
        return 'Low mastery detected';
      case RecommendationType.practiceSession:
        return 'Recent errors identified';
      case RecommendationType.dailyGoal:
        return 'Daily study target';
    }
  }

  String _actionLabelFor(RecommendationCandidate c) {
    switch (c.type) {
      case RecommendationType.dueReview:
        return 'Review';
      case RecommendationType.continueStory:
        return 'Read';
      case RecommendationType.weakWord:
        return 'Practice';
      case RecommendationType.practiceSession:
        return 'Start';
      case RecommendationType.dailyGoal:
        return 'Continue';
    }
  }
}
