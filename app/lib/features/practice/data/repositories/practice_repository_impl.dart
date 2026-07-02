import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../features/dictionary/domain/entities/word.dart';
import '../../../review/data/mappers/review_card_mapper.dart';
import '../../../review/domain/entities/review_card.dart';
import '../../domain/repositories/practice_repository.dart';
import '../datasources/practice_local_data_source.dart';

class PracticeRepositoryImpl implements PracticeRepository {
  final PracticeLocalDataSource localDataSource;

  PracticeRepositoryImpl({required this.localDataSource});

  @override
  Future<Either<Failure, List<ReviewCard>>> loadPracticeCards({
    required int limit,
    required DateTime now,
  }) async {
    try {
      final models = await localDataSource.getPracticeCards();
      final cards = models.map((m) => ReviewCardMapper.toEntity(m, now)).toList();
      
      // Take only cards matching active study criteria up to requested limit
      final activePracticeCards = cards.take(limit).toList();

      return Right(activePracticeCards);
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Word>>> loadDictionaryPool() async {
    try {
      final rawPool = await localDataSource.getDictionaryPool();
      
      final words = rawPool.map((map) => Word(
        id: map['word_id'] as int,
        word: map['word'] as String,
        definition: map['definition'] as String?,
        bengaliMeaning: map['bengali_meaning'] as String?,
        pronunciation: map['pronunciation'] as String?,
        partOfSpeech: map['part_of_speech'] as String?,
        level: map['level'] as String?,
        audioPath: map['audio_path'] as String?,
        mnemonic: map['mnemonic'] as String?,
      )).toList();

      return Right(words);
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }
}
