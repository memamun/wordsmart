import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/word.dart';
import '../../domain/entities/word_derivative.dart';
import '../../domain/entities/word_example.dart';
import '../../domain/entities/word_root.dart';
import '../../../../core/error/exceptions.dart';
import '../../domain/repositories/word_repository.dart';
import '../datasources/word_local_data_source.dart';
import '../mappers/word_mapper.dart';
import '../models/word_derivative_model.dart';
import '../models/word_example_model.dart';
import '../models/word_model.dart';
import '../models/word_root_model.dart';

class WordRepositoryImpl implements WordRepository {
  final WordLocalDataSource localDataSource;

  WordRepositoryImpl({required this.localDataSource});

  @override
  Future<Either<Failure, Word>> getWordDetails(int id) async {
    try {
      // 1. Load data from source
      final wordModel = await localDataSource.getWordById(id);
      final relations = await _loadRelations(id);

      // 2. Hydrate storage models into domain entities
      final wordEntity = _hydrateWord(wordModel, relations);

      return Right(wordEntity);
    } on DomainException catch (e) {
      // Catch business invariant violations (corrupted data) and wrap in ValidationFailure
      return Left(ValidationFailure(e.message));
    } on Exception catch (e) {
      // Catch any low-level database/driver exceptions, log internally (e),
      // and return a safe, user-friendly Failure to the UI (preventing exception leaking).
      return const Left(DatabaseFailure(
        'Unable to load word details. Please try again.',
      ));
    }
  }

  @override
  Future<Either<Failure, Word>> getRandomCoreWord() {
    // Unimplemented for Sprint 1
    throw UnimplementedError();
  }

  /// Loads all lazy-loaded relationships in parallel, avoiding positional coupling.
  Future<_WordRelations> _loadRelations(int wordId) async {
    // Storing futures in named variables prevents index-based positional coupling bugs
    final synonymsFuture = localDataSource.getSynonymsForWord(wordId);
    final antonymsFuture = localDataSource.getAntonymsForWord(wordId);
    final collocationsFuture = localDataSource.getCollocationsForWord(wordId);
    final examplesFuture = localDataSource.getExamplesForWord(wordId);
    final translationsFuture = localDataSource.getExampleTranslationsForWord(wordId);
    final derivativesFuture = localDataSource.getDerivativesForWord(wordId);
    final rootsFuture = localDataSource.getRootsForWord(wordId);

    // Run all queries in parallel
    await Future.wait([
      synonymsFuture,
      antonymsFuture,
      collocationsFuture,
      examplesFuture,
      translationsFuture,
      derivativesFuture,
      rootsFuture,
    ]);

    return _WordRelations(
      synonyms: await synonymsFuture,
      antonyms: await antonymsFuture,
      collocations: await collocationsFuture,
      examples: await examplesFuture,
      translations: await translationsFuture,
      derivatives: await derivativesFuture,
      roots: await rootsFuture,
    );
  }

  /// Hydrates the Word domain entity from model representations.
  Word _hydrateWord(WordModel wordModel, _WordRelations relations) {
    final examples = relations.examples.map((e) {
      final translation = relations.translations[e.id];
      return e.toEntity(translation: translation);
    }).toList();

    final derivatives = relations.derivatives.map((d) => d.toEntity()).toList();
    final roots = relations.roots.map((r) => r.toEntity()).toList();

    return wordModel.toEntity(
      synonyms: relations.synonyms,
      antonyms: relations.antonyms,
      collocations: relations.collocations,
      examples: examples,
      derivatives: derivatives,
      roots: roots,
    );
  }
}

/// Helper class to bundle lazy-loaded relations data
class _WordRelations {
  final List<String> synonyms;
  final List<String> antonyms;
  final List<String> collocations;
  final List<WordExampleModel> examples;
  final Map<int, String> translations;
  final List<WordDerivativeModel> derivatives;
  final List<WordRootModel> roots;

  const _WordRelations({
    required this.synonyms,
    required this.antonyms,
    required this.collocations,
    required this.examples,
    required this.translations,
    required this.derivatives,
    required this.roots,
  });
}
