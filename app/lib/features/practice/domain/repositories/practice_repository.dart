import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../features/dictionary/domain/entities/word.dart';
import '../../../../core/learning/entities/learning_card.dart';

abstract class PracticeRepository {
  Future<Either<Failure, List<LearningCard>>> loadPracticeCards({
    required int limit,
    required DateTime now,
  });

  Future<Either<Failure, List<Word>>> loadDictionaryPool();
}
