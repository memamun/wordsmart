import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/injection.dart';
import '../../domain/usecases/finish_practice_session.dart';
import '../../domain/usecases/get_practice_session.dart';
import '../../domain/usecases/submit_practice_answer.dart';
import 'practice_session_notifier.dart';
import 'practice_session_state.dart';

final practiceSessionNotifierProvider = StateNotifierProvider.autoDispose<PracticeSessionNotifier, PracticeSessionState>((ref) {
  return PracticeSessionNotifier(
    getPracticeSessionUseCase: sl<GetPracticeSessionUseCase>(),
    submitPracticeAnswerUseCase: sl<SubmitPracticeAnswerUseCase>(),
    finishPracticeSessionUseCase: sl<FinishPracticeSessionUseCase>(),
  );
});
