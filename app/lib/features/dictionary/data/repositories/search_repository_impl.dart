import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/word.dart';
import '../../domain/repositories/search_repository.dart';
import '../datasources/word_local_data_source.dart';

class SearchRepositoryImpl implements SearchRepository {
  final WordLocalDataSource localDataSource;

  SearchRepositoryImpl({required this.localDataSource});

  @override
  Future<Either<Failure, List<Word>>> searchWords(String query) async {
    try {
      final wordModels = await localDataSource.searchWords(query);
      final wordEntities = wordModels.map((model) => model.toEntity()).toList();
      return Right(wordEntities);
    } catch (e) {
      return const Left(DatabaseFailure(
        'Unable to process search. Please try again.',
      ));
    }
  }

  @override
  Future<Either<Failure, List<String>>> getSearchSuggestions(String query) async {
    try {
      final suggestions = await localDataSource.getSearchSuggestions(query);
      return Right(suggestions);
    } catch (e) {
      return const Left(DatabaseFailure(
        'Unable to load search suggestions.',
      ));
    }
  }
}
