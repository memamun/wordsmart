import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:wordsmart/core/error/failures.dart';
import 'package:wordsmart/features/dictionary/domain/entities/word.dart';
import 'package:wordsmart/features/recommendation/data/repositories/recommendation_repository_impl.dart';
import 'package:wordsmart/features/recommendation/domain/entities/recommendation_candidate.dart';
import 'package:wordsmart/features/recommendation/domain/entities/recommendation.dart';
import 'package:wordsmart/features/recommendation/domain/services/recommendation_candidate_factory.dart';
import 'package:wordsmart/features/review/domain/entities/learning_metrics.dart';
import 'package:wordsmart/features/review/domain/entities/review_card.dart';
import 'package:wordsmart/features/review/domain/entities/review_queue.dart';
import 'package:wordsmart/features/review/domain/usecases/get_daily_queue.dart';
import 'package:wordsmart/features/review/domain/usecases/get_learning_metrics.dart';
import 'package:wordsmart/features/review/domain/usecases/get_progress_summary.dart';
import 'package:wordsmart/features/stories/domain/entities/story.dart';
import 'package:wordsmart/features/stories/domain/entities/story_progress.dart';
import 'package:wordsmart/features/stories/domain/entities/reading_position.dart';
import 'package:wordsmart/features/stories/domain/repositories/story_repository.dart';
import 'package:wordsmart/core/learning/entities/learning_card.dart';
import 'package:wordsmart/core/learning/entities/learning_value_objects.dart';

class MockGetDailyQueueUseCase extends Mock implements GetDailyQueueUseCase {}
class MockGetLearningMetricsUseCase extends Mock implements GetLearningMetricsUseCase {}
class MockGetProgressSummaryUseCase extends Mock implements GetProgressSummaryUseCase {}
class MockStoryRepository extends Mock implements StoryRepository {}

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
  late MockGetDailyQueueUseCase mockQueue;
  late MockGetLearningMetricsUseCase mockMetrics;
  late MockGetProgressSummaryUseCase mockProgress;
  late MockStoryRepository mockStories;
  final factory = const RecommendationCandidateFactory();

  setUp(() {
    mockQueue = MockGetDailyQueueUseCase();
    mockMetrics = MockGetLearningMetricsUseCase();
    mockProgress = MockGetProgressSummaryUseCase();
    mockStories = MockStoryRepository();
    repository = RecommendationRepositoryImpl(
      getDailyQueueUseCase: mockQueue,
      getLearningMetricsUseCase: mockMetrics,
      getProgressSummaryUseCase: mockProgress,
      storyRepository: mockStories,
      candidateFactory: factory,
    );
  });

  group('getCandidates', () {
    test('should return candidates from all available sources', () async {
      when(mockQueue(anyNamed: '', limit: anyNamed, now: anyNamed)).thenAnswer((_) async => Right(
        ReviewQueue(
          id: 'q1',
          createdAt: DateTime.now(),
          cards: [_testCard(1), _testCard(2)],
        ),
      ));
      when(mockMetrics(anyNamed: '', now: anyNamed)).thenAnswer((_) async => Right(
        LearningMetrics(
          streak: const StudyStreak(current: 5, best: 10),
          masteredWords: 50,
          learningWords: 30,
          reviewingWords: 20,
          dueToday: 10,
          studyMinutesToday: 15,
          accuracy: const Accuracy(85.0),
          retentionRate: const RetentionRate(85.0),
        ),
      ));
      when(mockStories.getStories()).thenAnswer((_) async => const Right([]));

      final result = await repository.getCandidates();

      expect(result.isRight(), true);
      result.fold(
        (_) => fail('Should not fail'),
        (candidates) {
          expect(candidates, isNotEmpty);
          expect(candidates.any((c) => c.type == RecommendationType.dueReview), true);
        },
      );
    });

    test('should continue when one source fails', () async {
      when(mockQueue(anyNamed: '', limit: anyNamed, now: anyNamed)).thenAnswer((_) async => Left(
        const DatabaseFailure('Review source failed'),
      ));
      when(mockMetrics(anyNamed: '', now: anyNamed)).thenAnswer((_) async => Right(
        LearningMetrics(
          streak: const StudyStreak(current: 5, best: 10),
          masteredWords: 50,
          learningWords: 30,
          reviewingWords: 20,
          dueToday: 10,
          studyMinutesToday: 15,
          accuracy: const Accuracy(85.0),
          retentionRate: const RetentionRate(85.0),
        ),
      ));
      when(mockStories.getStories()).thenAnswer((_) async => const Right([]));

      final result = await repository.getCandidates();

      expect(result.isRight(), true);
      result.fold(
        (_) => fail('Should not fail'),
        (candidates) {
          expect(candidates.any((c) => c.type == RecommendationType.dailyGoal), true);
        },
      );
    });

    test('should fail only when every source fails', () async {
      when(mockQueue(anyNamed: '', limit: anyNamed, now: anyNamed)).thenAnswer((_) async => Left(
        const DatabaseFailure('Review failed'),
      ));
      when(mockMetrics(anyNamed: '', now: anyNamed)).thenAnswer((_) async => Left(
        const DatabaseFailure('Metrics failed'),
      ));
      when(mockStories.getStories()).thenAnswer((_) async => Left(
        const DatabaseFailure('Stories failed'),
      ));

      final result = await repository.getCandidates();

      expect(result.isLeft(), true);
    });

    test('should map review cards to candidates', () async {
      when(mockQueue(anyNamed: '', limit: anyNamed, now: anyNamed)).thenAnswer((_) async => Right(
        ReviewQueue(
          id: 'q1',
          createdAt: DateTime.now(),
          cards: [_testCard(10)],
        ),
      ));
      when(mockMetrics(anyNamed: '', now: anyNamed)).thenAnswer((_) async => Left(
        const DatabaseFailure('skip'),
      ));
      when(mockStories.getStories()).thenAnswer((_) async => const Right([]));

      final result = await repository.getCandidates();

      result.fold(
        (_) => fail('Should not fail'),
        (candidates) {
          final review = candidates.where((c) => c.type == RecommendationType.dueReview).toList();
          expect(review.length, 1);
          expect(review.first.id, 'review-10');
        },
      );
    });

    test('should map incomplete stories to candidates', () async {
      when(mockQueue(anyNamed: '', limit: anyNamed, now: anyNamed)).thenAnswer((_) async => Left(
        const DatabaseFailure('skip'),
      ));
      when(mockMetrics(anyNamed: '', now: anyNamed)).thenAnswer((_) async => Left(
        const DatabaseFailure('skip'),
      ));
      when(mockStories.getStories()).thenAnswer((_) async => Right([
        Story(
          id: 1,
          title: 'Test Story',
          wordsCovered: ['WORD1'],
          paragraphs: List.generate(10, (i) => const StoryParagraph(index: i, englishText: 'Text', bengaliText: 'Text')),
          highlightedWords: [],
        ),
      ]));
      when(mockStories.getProgress(1)).thenAnswer((_) async => Right(
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
          final stories = candidates.where((c) => c.type == RecommendationType.continueStory).toList();
          expect(stories.length, 1);
          expect(stories.first.id, 'story-1');
          expect(stories.first.metadata['percentComplete'], 30.0);
        },
      );
    });
  });
}
