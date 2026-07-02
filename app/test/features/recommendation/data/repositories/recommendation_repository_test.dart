import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:wordsmart/core/error/failures.dart';
import 'package:wordsmart/features/dictionary/domain/entities/word.dart';
import 'package:wordsmart/features/recommendation/data/repositories/recommendation_repository_impl.dart';
import 'package:wordsmart/features/recommendation/domain/entities/recommendation.dart';
import 'package:wordsmart/features/recommendation/domain/services/recommendation_candidate_factory.dart';
import 'package:wordsmart/features/review/domain/entities/learning_metrics.dart';
import 'package:wordsmart/features/review/domain/entities/review_card.dart';
import 'package:wordsmart/features/review/domain/entities/review_queue.dart';
import 'package:wordsmart/features/review/domain/usecases/get_daily_queue.dart';
import 'package:wordsmart/features/review/domain/usecases/get_learning_metrics.dart';
import 'package:wordsmart/features/review/domain/usecases/get_progress_summary.dart';
import 'package:wordsmart/features/stories/domain/entities/story.dart';
import 'package:wordsmart/features/stories/domain/entities/story_paragraph.dart';
import 'package:wordsmart/features/stories/domain/entities/story_progress.dart';
import 'package:wordsmart/features/stories/domain/entities/reading_position.dart';
import 'package:wordsmart/features/stories/domain/repositories/story_repository.dart';
import 'package:wordsmart/features/review/domain/repositories/review_repository.dart';
import 'package:wordsmart/core/learning/entities/learning_card.dart';
import 'package:wordsmart/core/learning/entities/learning_value_objects.dart';

class StubGetDailyQueueUseCase implements GetDailyQueueUseCase {
  @override
  ReviewRepository get repository => throw UnimplementedError();
  Either<Failure, ReviewQueue>? _result;
  void stubResult(Either<Failure, ReviewQueue> result) => _result = result;
  @override
  Future<Either<Failure, ReviewQueue>> call(
          {required int limit, required DateTime now}) async =>
      _result!;
}

class StubGetLearningMetricsUseCase implements GetLearningMetricsUseCase {
  @override
  ReviewRepository get repository => throw UnimplementedError();
  Either<Failure, LearningMetrics>? _result;
  void stubResult(Either<Failure, LearningMetrics> result) => _result = result;
  @override
  Future<Either<Failure, LearningMetrics>> call(
          {required DateTime now}) async =>
      _result!;
}

class StubStoryRepository implements StoryRepository {
  Either<Failure, List<Story>>? _storiesResult;
  Either<Failure, StoryProgress?>? _progressResult;

  void stubStories(Either<Failure, List<Story>> result) =>
      _storiesResult = result;
  void stubProgress(int storyId, Either<Failure, StoryProgress?> result) =>
      _progressResult = result;

  @override
  Future<Either<Failure, List<Story>>> getStories() async => _storiesResult!;
  @override
  Future<Either<Failure, Story>> getStory(int id) async =>
      throw UnimplementedError();
  @override
  Future<Either<Failure, StoryProgress?>> getProgress(int storyId) async =>
      _progressResult!;
  @override
  Future<Either<Failure, void>> saveReadingPosition(
          {required int storyId,
          required ReadingPosition position,
          required DateTime now}) async =>
      const Right(null);
  @override
  Future<Either<Failure, int?>> findWordId(String word) async =>
      throw UnimplementedError();
}

class MockGetProgressSummaryUseCase extends Mock
    implements GetProgressSummaryUseCase {}

Word _testWord(int id) => Word(id: id, word: 'WORD$id');

LearningCard _testCard(int wordId, {double ef = 2.5}) {
  return LearningCard(
    word: _testWord(wordId),
    learningState: LearningState.learning,
    isDue: true,
    priority: ReviewPriority.high,
    easinessFactor: ef,
    intervalDays: 1,
    repetitionCount: 1,
    mode: ReviewMode.review,
  );
}

void main() {
  late RecommendationRepositoryImpl repository;
  late StubGetDailyQueueUseCase stubQueue;
  late StubGetLearningMetricsUseCase stubMetrics;
  late MockGetProgressSummaryUseCase mockProgress;
  late StubStoryRepository stubStories;
  final factory = const RecommendationCandidateFactory();

  setUp(() {
    stubQueue = StubGetDailyQueueUseCase();
    stubMetrics = StubGetLearningMetricsUseCase();
    mockProgress = MockGetProgressSummaryUseCase();
    stubStories = StubStoryRepository();
    repository = RecommendationRepositoryImpl(
      getDailyQueueUseCase: stubQueue,
      getLearningMetricsUseCase: stubMetrics,
      getProgressSummaryUseCase: mockProgress,
      storyRepository: stubStories,
      candidateFactory: factory,
    );
  });

  group('getCandidates', () {
    test('should return candidates from all available sources', () async {
      stubQueue.stubResult(Right(
        ReviewQueue(
          id: 'q1',
          createdAt: DateTime.now(),
          cards: [_testCard(1), _testCard(2)],
        ),
      ));
      stubMetrics.stubResult(Right(
        LearningMetrics(
          streak: StudyStreak(current: 5, longest: 10),
          masteredWords: 50,
          learningWords: 30,
          reviewingWords: 20,
          dueToday: 10,
          studyMinutesToday: 15,
          sessionsToday: 1,
          accuracy: Accuracy(85.0),
          retentionRate: RetentionRate(85.0),
        ),
      ));
      stubStories.stubStories(const Right([]));

      final result = await repository.getCandidates();

      expect(result.isRight(), true);
      result.fold(
        (_) => fail('Should not fail'),
        (candidates) {
          expect(candidates, isNotEmpty);
          expect(candidates.any((c) => c.type == RecommendationType.dueReview),
              true);
        },
      );
    });

    test('should continue when one source fails', () async {
      stubQueue.stubResult(Left(
        const DatabaseFailure('Review source failed'),
      ));
      stubMetrics.stubResult(Right(
        LearningMetrics(
          streak: StudyStreak(current: 5, longest: 10),
          masteredWords: 50,
          learningWords: 30,
          reviewingWords: 20,
          dueToday: 10,
          studyMinutesToday: 15,
          sessionsToday: 1,
          accuracy: Accuracy(85.0),
          retentionRate: RetentionRate(85.0),
        ),
      ));
      stubStories.stubStories(const Right([]));

      final result = await repository.getCandidates();

      expect(result.isRight(), true);
      result.fold(
        (_) => fail('Should not fail'),
        (candidates) {
          expect(candidates.any((c) => c.type == RecommendationType.dailyGoal),
              true);
        },
      );
    });

    test('should fail only when every source fails', () async {
      stubQueue.stubResult(Left(
        const DatabaseFailure('Review failed'),
      ));
      stubMetrics.stubResult(Left(
        const DatabaseFailure('Metrics failed'),
      ));
      stubStories.stubStories(Left(
        const DatabaseFailure('Stories failed'),
      ));

      final result = await repository.getCandidates();

      expect(result.isLeft(), true);
    });

    test('should map review cards to candidates', () async {
      stubQueue.stubResult(Right(
        ReviewQueue(
          id: 'q1',
          createdAt: DateTime.now(),
          cards: [_testCard(10)],
        ),
      ));
      stubMetrics.stubResult(Left(
        const DatabaseFailure('skip'),
      ));
      stubStories.stubStories(const Right([]));

      final result = await repository.getCandidates();

      result.fold(
        (_) => fail('Should not fail'),
        (candidates) {
          final review = candidates
              .where((c) => c.type == RecommendationType.dueReview)
              .toList();
          expect(review.length, 1);
          expect(review.first.id, 'review-10');
        },
      );
    });

    test('should map incomplete stories to candidates', () async {
      stubQueue.stubResult(Left(
        const DatabaseFailure('skip'),
      ));
      stubMetrics.stubResult(Left(
        const DatabaseFailure('skip'),
      ));
      stubStories.stubStories(Right([
        Story(
          id: 1,
          title: 'Test Story',
          wordsCovered: ['WORD1'],
          paragraphs: List.generate(
              10,
              (i) => StoryParagraph(
                  index: i, englishText: 'Text', bengaliText: 'Text')),
          highlightedWords: [],
        ),
      ]));
      stubStories.stubProgress(
          1,
          Right(
            StoryProgress(
              id: 'story-1',
              storyId: 1,
              position: const ReadingPosition(paragraph: 3),
              lastStudiedAt: DateTime.now(),
            ),
          ));

      final result = await repository.getCandidates();

      result.fold(
        (_) => fail('Should not fail'),
        (candidates) {
          final stories = candidates
              .where((c) => c.type == RecommendationType.continueStory)
              .toList();
          expect(stories.length, 1);
          expect(stories.first.id, 'story-1');
          expect(stories.first.metadata['percentComplete'], 30.0);
        },
      );
    });
  });
}
