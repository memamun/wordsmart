import '../../../review/data/models/review_card_model.dart';

abstract class PracticeLocalDataSource {
  Future<List<ReviewCardModel>> getPracticeCards();
  Future<List<Map<String, dynamic>>> getDictionaryPool();
}
