import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/learning/entities/learning_card.dart';
import '../../../../features/dictionary/domain/entities/word.dart';
import '../../domain/repositories/practice_repository.dart';
import '../datasources/practice_local_data_source.dart';

class PracticeRepositoryImpl implements PracticeRepository {
  final PracticeLocalDataSource localDataSource;

  PracticeRepositoryImpl({required this.localDataSource});

  @override
  Future<Either<Failure, List<LearningCard>>> loadPracticeCards({
    required int limit,
    required DateTime now,
  }) async {
    try {
      final cards = await localDataSource.getPracticeCards();
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

      final words = rawPool
          .map((map) => Word(
                id: map['word_id'] as int,
                word: map['word'] as String,
                definition: map['definition'] as String?,
                bengaliMeaning: map['bengali_meaning'] as String?,
                pronunciation: map['pronunciation'] as String?,
                partOfSpeech: map['part_of_speech'] as String?,
                level: map['level'] as String?,
                audioPath: map['audio_path'] as String?,
                mnemonic: map['mnemonic'] as String?,
              ))
          .toList();

      return Right(words);
    } catch (e) {
      return Left(DatabaseFailure(e.toString()));
    }
  }
}
