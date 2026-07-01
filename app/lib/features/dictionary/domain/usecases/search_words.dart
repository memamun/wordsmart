import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/word.dart';
import '../repositories/search_repository.dart';

class SearchWordsUseCase {
  final SearchRepository repository;

  SearchWordsUseCase(this.repository);

  Future<Either<Failure, List<Word>>> call(String query) async {
    return await repository.searchWords(query);
  }
}
