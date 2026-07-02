import '../../domain/entities/study_session.dart';
import '../../../../core/learning/entities/learning_value_objects.dart';
import '../models/study_session_model.dart';

class StudySessionMapper {
  static StudySession toEntity(StudySessionModel model) {
    final mode = ReviewMode.values.firstWhere(
      (e) => e.toString().split('.').last == model.mode,
      orElse: () => ReviewMode.review,
    );

    return StudySession(
      id: model.id,
      mode: mode,
      startedAt: DateTime.parse(model.startedAt),
      finishedAt: DateTime.parse(model.finishedAt),
      reviewedCards: model.reviewedCards,
      correctAnswers: model.correctAnswers,
      incorrectAnswers: model.incorrectAnswers,
      duration: StudyDuration(Duration(seconds: model.durationSeconds)),
    );
  }

  static StudySessionModel toModel(StudySession entity) {
    return StudySessionModel(
      id: entity.id,
      mode: entity.mode.toString().split('.').last,
      startedAt: entity.startedAt.toIso8601String(),
      finishedAt: entity.finishedAt.toIso8601String(),
      reviewedCards: entity.reviewedCards,
      correctAnswers: entity.correctAnswers,
      incorrectAnswers: entity.incorrectAnswers,
      durationSeconds: entity.duration.value.inSeconds,
    );
  }
}
