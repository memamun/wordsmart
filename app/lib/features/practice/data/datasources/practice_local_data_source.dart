import '../../../../core/learning/entities/learning_card.dart';

abstract class PracticeLocalDataSource {
  Future<List<LearningCard>> getPracticeCards();
  Future<List<Map<String, dynamic>>> getDictionaryPool();
}
