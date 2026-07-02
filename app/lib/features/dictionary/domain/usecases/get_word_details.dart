import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/word.dart';
import '../repositories/word_repository.dart';

class GetWordDetailsUseCase {
  final WordRepository repository;

  GetWordDetailsUseCase(this.repository);

  Future<Either<Failure, Word>> call(int id) async {
    return await repository.getWordDetails(id);
  }
}
