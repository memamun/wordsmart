import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/learning_metrics.dart';
import '../../domain/entities/queue_policy.dart';
import '../../domain/entities/review_queue.dart';
import '../../domain/entities/study_session.dart';
import '../../domain/entities/value_objects.dart';
import '../../domain/repositories/review_repository.dart';
import '../../domain/services/review_queue_builder.dart';
import '../datasources/review_local_data_source.dart';
import '../mappers/review_card_mapper.dart';
import '../mappers/study_session_mapper.dart';
import '../models/study_session_model.dart';

class ReviewRepositoryImpl implements ReviewRepository {
  final ReviewLocalDataSource localDataSource;
  final ReviewQueueBuilder queueBuilder;

  ReviewRepositoryImpl({
    required this.localDataSource,
    required this.queueBuilder,
  });

  @override
  Future<Either<Failure, ReviewQueue>> getDailyQueue({
    required int limit,
    required DateTime now,
  }) async {
    try {
      final cardModels = await localDataSource.getAllCardsWithProgress();
      final cards = cardModels.map((m) => ReviewCardMapper.toEntity(m, now)).toList();

      final queue = queueBuilder.build(
        cards: cards,
        policy: DailyReviewPolicy(maxCards: limit),
        now: now,
      );

      return Right(queue);
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> saveReviewResult({
    required int wordId,
    required int score,
    required int durationMs,
    required double easinessFactor,
    required int intervalDays,
    required int repetitionCount,
    required String learningState,
    required int masteryScore,
    required DateTime now,
    required String sessionId,
    required String sessionMode,
  }) async {
    try {
      final sessionModel = StudySessionModel(
        id: sessionId,
        mode: sessionMode,
        startedAt: now.subtract(Duration(milliseconds: durationMs)).toIso8601String(),
        finishedAt: now.toIso8601String(),
        reviewedCards: 1,
        correctAnswers: score >= 3 ? 1 : 0,
        incorrectAnswers: score < 3 ? 1 : 0,
        durationSeconds: (durationMs / 1000).round(),
      );

      await localDataSource.saveReviewProgress(
        wordId: wordId,
        easeFactor: easinessFactor,
        intervalDays: intervalDays,
        repetitionCount: repetitionCount,
        learningState: learningState,
        masteryScore: masteryScore,
        nextReviewAt: now.add(Duration(days: intervalDays)).toIso8601String(),
        lastReviewedAt: now.toIso8601String(),
        session: sessionModel,
      );

      return const Right(null);
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, LearningMetrics>> getLearningMetrics({
    required DateTime now,
  }) async {
    try {
      final sessionModels = await localDataSource.getStudySessions();
      final sessions = sessionModels.map((m) => StudySessionMapper.toEntity(m)).toList();

      // Retrieve all cards to dynamically calculate counts
      final cardModels = await localDataSource.getAllCardsWithProgress();
      final cards = cardModels.map((m) => ReviewCardMapper.toEntity(m, now)).toList();

      int masteredCount = 0;
      int learningCount = 0;
      int reviewingCount = 0;
      int dueCount = 0;

      for (final card in cards) {
        if (card.learningState == LearningState.mastered) masteredCount++;
        if (card.learningState == LearningState.learning) learningCount++;
        if (card.learningState == LearningState.reviewing) reviewingCount++;
        if (card.isDue) dueCount++;
      }

      // Simple mock/stub streak calculation from completed sessions (actual logic done dynamically)
      final streak = StudyStreak(current: 0, longest: 0);

      final metrics = LearningMetrics.calculate(
        streak: streak,
        sessions: sessions,
        masteredWords: masteredCount,
        learningWords: learningCount,
        reviewingWords: reviewingCount,
        dueToday: dueCount,
        today: now,
      );

      return Right(metrics);
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> logStudySession(StudySession session) async {
    try {
      // Stub: Repository can implement standalone session logging if needed
      return const Right(null);
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }
}
