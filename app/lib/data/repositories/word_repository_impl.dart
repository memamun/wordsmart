import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';
import '../../domain/entities/word.dart';
import '../../domain/entities/word_derivative.dart';
import '../../domain/entities/word_example.dart';
import '../../domain/entities/word_root.dart';
import '../../domain/exceptions/exceptions.dart';
import '../../domain/repositories/word_repository.dart';
import '../datasources/word_local_data_source.dart';
import '../mappers/word_mapper.dart';
import '../models/word_derivative_model.dart';
import '../models/word_example_model.dart';
import '../models/word_root_model.dart';

class WordRepositoryImpl implements WordRepository {
  final WordLocalDataSource localDataSource;

  WordRepositoryImpl({required this.localDataSource});

  @override
  Future<Either<Failure, Word>> getWordDetails(int id) async {
    try {
      // 1. Fetch core word storage model
      final wordModel = await localDataSource.getWordById(id);

      // 2. Fetch all lazy-loaded relationships in parallel for performance optimization
      final results = await Future.wait([
        localDataSource.getSynonymsForWord(id),
        localDataSource.getAntonymsForWord(id),
        localDataSource.getCollocationsForWord(id),
        localDataSource.getExamplesForWord(id),
        localDataSource.getExampleTranslationsForWord(id),
        localDataSource.getDerivativesForWord(id),
        localDataSource.getRootsForWord(id),
      ]);

      final synonyms = results[0] as List<String>;
      final antonyms = results[1] as List<String>;
      final collocations = results[2] as List<String>;
      final exampleModels = results[3] as List<WordExampleModel>;
      final exampleTranslations = results[4] as Map<int, String>;
      final derivativeModels = results[5] as List<WordDerivativeModel>;
      final rootModels = results[6] as List<WordRootModel>;

      // 3. Map list storage models to bilingual domain entity collections
      final examples = exampleModels.map((e) {
        final translation = exampleTranslations[e.id];
        return e.toEntity(translation: translation);
      }).toList();

      final derivatives = derivativeModels.map((d) => d.toEntity()).toList();
      final roots = rootModels.map((r) => r.toEntity()).toList();

      // 4. Map the core word model to the domain entity and hydrate the collections
      final wordEntity = wordModel.toEntity(
        synonyms: synonyms,
        antonyms: antonyms,
        collocations: collocations,
        examples: examples,
        derivatives: derivatives,
        roots: roots,
      );

      return Right(wordEntity);
    } on DomainException catch (e) {
      // Catch business invariant violations (corrupted data) and wrap in ValidationFailure
      return Left(ValidationFailure(e.message));
    } on Exception catch (e) {
      // Catch any low-level database/driver exceptions and wrap in DatabaseFailure
      return Left(DatabaseFailure('Database error: ${e.toString()}'));
    }
  }

  @override
  Future<Either<Failure, Word>> getRandomCoreWord() {
    // Unimplemented for Sprint 1
    throw UnimplementedError();
  }
}
