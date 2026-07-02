import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../review/domain/usecases/get_daily_queue.dart';
import '../../../review/domain/usecases/get_learning_metrics.dart';
import '../../../review/domain/usecases/get_progress_summary.dart';
import '../../../stories/domain/repositories/story_repository.dart';
import '../../domain/entities/recommendation_candidate.dart';
import '../../domain/repositories/recommendation_repository.dart';
import '../../domain/services/recommendation_candidate_factory.dart';

class RecommendationRepositoryImpl implements RecommendationRepository {
  final GetDailyQueueUseCase getDailyQueueUseCase;
  final GetLearningMetricsUseCase getLearningMetricsUseCase;
  final GetProgressSummaryUseCase getProgressSummaryUseCase;
  final StoryRepository storyRepository;
  final RecommendationCandidateFactory candidateFactory;

  RecommendationRepositoryImpl({
    required this.getDailyQueueUseCase,
    required this.getLearningMetricsUseCase,
    required this.getProgressSummaryUseCase,
    required this.storyRepository,
    required this.candidateFactory,
  });

  @override
  Future<Either<Failure, List<RecommendationCandidate>>> getCandidates() async {
    final now = DateTime.now();
    final results = await Future.wait([
      _loadReviewCandidates(now),
      _loadStoryCandidates(),
      _loadGoalCandidates(now),
    ]);

    final allCandidates = <RecommendationCandidate>[];
    var allFailed = true;

    for (final result in results) {
      result.fold(
        (failure) {},
        (candidates) {
          allCandidates.addAll(candidates);
          allFailed = false;
        },
      );
    }

    if (allFailed) {
      return const Left(DatabaseFailure('All recommendation sources failed'));
    }

    return Right(allCandidates);
  }

  Future<Either<Failure, List<RecommendationCandidate>>> _loadReviewCandidates(DateTime now) async {
    final queueResult = await getDailyQueueUseCase(limit: 50, now: now);
    return queueResult.fold(
      (failure) => Left(failure),
      (queue) {
        final candidates = queue.cards.map((card) {
          final overdueDays = card.nextReviewAt != null
              ? now.difference(card.nextReviewAt!).inDays
              : 0;
          return candidateFactory.fromDueReviewCard(
            card,
            overdueDays: overdueDays > 0 ? overdueDays : 0,
          );
        }).toList();
        return Right(candidates);
      },
    );
  }

  Future<Either<Failure, List<RecommendationCandidate>>> _loadStoryCandidates() async {
    final storiesResult = await storyRepository.getStories();
    return storiesResult.fold(
      (failure) => Left(failure),
      (stories) async {
        final candidates = <RecommendationCandidate>[];
        for (final story in stories) {
          final progressResult = await storyRepository.getProgress(story.id);
          progressResult.fold(
            (_) {},
            (progress) {
              if (progress != null) {
                final totalParagraphs = story.paragraphs.length;
                final currentParagraph = progress.position.paragraph;
                final percentComplete = totalParagraphs > 0
                    ? (currentParagraph / totalParagraphs) * 100.0
                    : 0.0;
                if (percentComplete < 100) {
                  candidates.add(candidateFactory.fromStoryProgress(
                    storyId: story.id,
                    percentComplete: percentComplete,
                  ));
                }
              }
            },
          );
        }
        return Right(candidates);
      },
    );
  }

  Future<Either<Failure, List<RecommendationCandidate>>> _loadGoalCandidates(DateTime now) async {
    final metricsResult = await getLearningMetricsUseCase(now: now);
    return metricsResult.fold(
      (failure) => Left(failure),
      (metrics) {
        final candidate = candidateFactory.fromDailyGoal(
          sessionsToday: metrics.studyMinutesToday > 0 ? 1 : 0,
          dailyTarget: 3,
        );
        return Right([candidate]);
      },
    );
  }

  @override
  Future<Either<Failure, void>> dismissRecommendation(String id) async {
    // TODO: Store dismissed recommendations in SharedPreferences or SQLite
    return const Right(null);
  }

  @override
  Future<Either<Failure, void>> completeRecommendation(String id) async {
    // TODO: Store completed recommendations for analytics
    return const Right(null);
  }
}
