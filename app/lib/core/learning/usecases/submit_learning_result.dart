import 'package:dartz/dartz.dart';
import '../../../core/error/failures.dart';
import '../entities/learning_card.dart';
import '../repositories/learning_repository.dart';
import '../engine/learning_signal_analyzer.dart';
import '../engine/sm2_engine.dart';

class SubmitLearningResultUseCase {
  final LearningRepository repository;
  final LearningSignalAnalyzer signalAnalyzer;
  final SM2Engine sm2Engine;

  SubmitLearningResultUseCase({
    required this.repository,
    required this.signalAnalyzer,
    required this.sm2Engine,
  });

  Future<Either<Failure, void>> call({
    required LearningCard card,
    required bool isCorrect,
    required Duration responseTime,
    required bool hintUsed,
    required DateTime now,
    required String sessionId,
    required String sessionMode,
  }) async {
    // 1. Resolve ReviewRating from user learning signals
    final rating = signalAnalyzer.analyze(
      isCorrect: isCorrect,
      responseTime: responseTime,
      hintUsed: hintUsed,
    );

    // 2. Recalculate SM-2 scheduling parameters
    final result = sm2Engine.calculateNextReview(
      card: card,
      rating: rating,
      reviewDate: now,
    );

    // 3. Persist progress, logs, and events atomically via repository transaction
    return repository.saveReviewResult(
      wordId: card.word.id,
      score: rating.score,
      durationMs: responseTime.inMilliseconds,
      easinessFactor: result.easinessFactor,
      intervalDays: result.intervalDays,
      repetitionCount: result.repetitionCount,
      learningState: result.learningState.toString().split('.').last,
      masteryScore: result.masteryScore,
      now: now,
      sessionId: sessionId,
      sessionMode: sessionMode,
    );
  }
}
