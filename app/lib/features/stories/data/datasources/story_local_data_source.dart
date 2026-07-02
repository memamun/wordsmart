import '../models/story_model.dart';
import '../models/story_progress_model.dart';

abstract class StoryLocalDataSource {
  Future<List<StoryModel>> getStories();
  Future<StoryModel> getStory(int id);
  Future<StoryProgressModel?> getProgress(int storyId);
  Future<void> saveReadingPosition({
    required int storyId,
    required int chapter,
    required int paragraph,
    required int offset,
    required String lastStudiedAt,
  });
  Future<int?> findWordId(String word);
}
