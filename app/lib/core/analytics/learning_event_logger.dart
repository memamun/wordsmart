abstract class LearningEventLogger {
  Future<void> logEvent({
    required String wordId,
    required String eventType,
    required DateTime timestamp,
    String? referenceId,
    String? referenceType,
  });
}
