import '../../../../core/learning/entities/learning_card.dart';
import '../models/advanced_quiz_model.dart';
import '../models/final_exam_model.dart';
import '../models/mcq_quiz_model.dart';
import '../models/quick_quiz_model.dart';
import '../models/vocab_drill_model.dart';

abstract class PracticeLocalDataSource {
  Future<List<LearningCard>> getPracticeCards();
  Future<List<Map<String, dynamic>>> getDictionaryPool();

  /// Fetches pre-built vocabulary drill (MCQ questions) for a word.
  Future<VocabDrillModel?> getVocabDrill(int wordId);

  /// Fetches all MCQ quizzes (contextual stories quizzes).
  Future<List<McqQuizModel>> getMcqQuizzes();

  /// Fetches all quick matching quizzes.
  Future<List<QuickQuizModel>> getQuickQuizzes();

  /// Fetches all advanced SAT/GRE quizzes.
  Future<List<AdvancedQuizModel>> getAdvancedQuizzes();

  /// Fetches all final exam drills.
  Future<List<FinalExamModel>> getFinalExams();
}
