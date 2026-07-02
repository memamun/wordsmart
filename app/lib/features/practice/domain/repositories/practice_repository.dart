import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../features/dictionary/domain/entities/word.dart';
import '../../../review/domain/entities/review_card.dart';

abstract class PracticeRepository {
  Future<Either<Failure, List<ReviewCard>>> loadPracticeCards({
    required int limit,
    required DateTime now,
  });

  Future<Either<Failure, List<Word>>> loadDictionaryPool();
}
