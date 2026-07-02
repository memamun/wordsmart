import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/practice_question.dart';
import '../entities/practice_session.dart';
import '../repositories/practice_repository.dart';
import '../services/builders/practice_session_builder.dart';

class GetPracticeSessionParams {
  final String id;
  final int limit;
  final PracticeMode mode;
  final DateTime now;

  GetPracticeSessionParams({
    required this.id,
    required this.limit,
    required this.mode,
    required this.now,
  });
}

class GetPracticeSessionUseCase {
  final PracticeRepository repository;
  final PracticeSessionBuilder builder;

  GetPracticeSessionUseCase({
    required this.repository,
    required this.builder,
  });

  Future<Either<Failure, PracticeSession>> call(
      GetPracticeSessionParams params) async {
    // 1. Load active cards for practice
    final cardsResult = await repository.loadPracticeCards(
      limit: params.limit,
      now: params.now,
    );

    return cardsResult.fold(
      (failure) => Left(failure),
      (cards) async {
        if (cards.isEmpty) {
          return const Left(DatabaseFailure('No cards found to practice.'));
        }

        // 2. Load dictionary pool for distractor candidates
        final poolResult = await repository.loadDictionaryPool();
        return poolResult.fold(
          (failure) => Left(failure),
          (pool) {
            final session = builder.build(
              id: params.id,
              reviewCards: cards,
              mode: params.mode,
              pool: pool,
              startedAt: params.now,
            );
            return Right(session);
          },
        );
      },
    );
  }
}
