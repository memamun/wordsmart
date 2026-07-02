import '../../../../dictionary/domain/entities/word.dart';
import '../../entities/practice_question.dart';

abstract class QuestionGenerator {
  PracticeQuestion generate(Word word, List<Word> pool);
}
