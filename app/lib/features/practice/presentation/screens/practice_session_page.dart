import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/navigation/app_navigator.dart';
import '../../domain/entities/practice_question.dart';
import '../providers/practice_session_state.dart';
import '../providers/providers.dart';
import '../widgets/answer_feedback_card.dart';
import '../../../../core/design_system/states/empty_state.dart';
import '../widgets/practice_loading_skeleton.dart';
import '../widgets/practice_progress_header.dart';
import '../widgets/question_card.dart';
import '../widgets/question_renderer.dart';
import '../widgets/session_footer.dart';
import 'practice_summary_page.dart';

class PracticeSessionPage extends ConsumerWidget {
  const PracticeSessionPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(practiceSessionNotifierProvider);
    final notifier = ref.read(practiceSessionNotifierProvider.notifier);

    if (state is PracticeSessionLoading) {
      return const Scaffold(body: PracticeLoadingSkeleton());
    }

    if (state is PracticeSessionFailure) {
      return Scaffold(
        body: EmptyState(
          icon: Icons.error_outline,
          title: 'Error loading session',
          description: state.failure.toString(),
          actionLabel: 'Back to Home',
          onActionPressed: () => AppNavigator.pop(context),
        ),
      );
    }

    if (state is PracticeSessionCompleted) {
      return PracticeSummaryPage(summary: state.summary);
    }

    if (state is! PracticeSessionActive) {
      return const Scaffold(body: PracticeLoadingSkeleton());
    }

    final question = state.currentQuestion;
    final isFeedbackMode = state.isAnswerCorrect != null;
    final isSpelling = question.type == QuestionType.spelling;

    String questionTypeLabel;
    switch (question.type) {
      case QuestionType.definitionMCQ:
        questionTypeLabel = 'DEFINITION';
        break;
      case QuestionType.synonymMCQ:
        questionTypeLabel = 'SYNONYM';
        break;
      case QuestionType.antonymMCQ:
        questionTypeLabel = 'ANTONYM';
        break;
      case QuestionType.spelling:
        questionTypeLabel = 'SPELLING';
        break;
      case QuestionType.sentenceCompletion:
        questionTypeLabel = 'SENTENCE COMPLETION';
        break;
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Progress header
            PracticeProgressHeader(
              currentIndex: state.currentIndex,
              totalQuestions: state.session.questions.length,
              onClose: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Exit Practice?'),
                    content: const Text('Your progress in this session will be lost.'),
                    actions: [
                      TextButton(onPressed: () => AppNavigator.pop(ctx), child: const Text('Cancel')),
                      TextButton(
                        onPressed: () {
                          AppNavigator.pop(ctx);
                          AppNavigator.pop(context);
                        },
                        child: const Text('Exit', style: TextStyle(color: Colors.red)),
                      ),
                    ],
                  ),
                );
              },
            ),

            // Scrollable body
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Question card
                    QuestionCard(
                      title: question.prompt,
                      subtitle: questionTypeLabel,
                    ),
                    const SizedBox(height: 24),

                    // Answer area (MCQ or Spelling)
                    QuestionRenderer(
                      question: question,
                      selectedAnswer: state.selectedAnswer,
                      isAnswerCorrect: state.isAnswerCorrect,
                      isFeedbackMode: isFeedbackMode,
                      isSubmitting: state.isSubmitting,
                      onSelectOption: (option) => notifier.selectAnswer(option),
                      onSpellingChanged: (input) => notifier.updateSpellingInput(input),
                      onSpellingSubmit: () => notifier.submitAnswer(DateTime.now()),
                    ),
                    const SizedBox(height: 16),

                    // Feedback card
                    if (isFeedbackMode)
                      AnswerFeedbackCard(
                        isCorrect: state.isAnswerCorrect!,
                        correctAnswer: question.correctAnswer,
                      ),
                  ],
                ),
              ),
            ),

            // Footer action button
            SessionFooter(
              buttonText: isFeedbackMode ? 'Next' : (isSpelling ? 'Check Spelling' : 'Submit'),
              isButtonEnabled: isFeedbackMode || state.selectedAnswer != null || (isSpelling && (state.spellingInput ?? '').isNotEmpty),
              isSubmitting: state.isSubmitting,
              onPressed: () {
                if (isFeedbackMode) {
                  notifier.nextQuestion(DateTime.now());
                } else {
                  notifier.submitAnswer(DateTime.now());
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
