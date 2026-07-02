import 'package:flutter/material.dart';
import '../../domain/entities/practice_question.dart';
import '../widgets/mcq_option_tile.dart';
import '../widgets/spelling_input_card.dart';

class QuestionRenderer extends StatelessWidget {
  final PracticeQuestion question;
  final String? selectedAnswer;
  final bool? isAnswerCorrect;
  final bool isFeedbackMode;
  final bool isSubmitting;
  final ValueChanged<String> onSelectOption;
  final ValueChanged<String> onSpellingChanged;
  final VoidCallback onSpellingSubmit;

  const QuestionRenderer({
    super.key,
    required this.question,
    required this.selectedAnswer,
    required this.isAnswerCorrect,
    required this.isFeedbackMode,
    required this.isSubmitting,
    required this.onSelectOption,
    required this.onSpellingChanged,
    required this.onSpellingSubmit,
  });

  @override
  Widget build(BuildContext context) {
    switch (question.type) {
      case QuestionType.spelling:
        return SpellingInputCard(
          isSubmitting: isSubmitting,
          isFeedbackMode: isFeedbackMode,
          isCorrect: isAnswerCorrect,
          correctAnswer: question.correctAnswer,
          onChanged: onSpellingChanged,
          onSubmit: onSpellingSubmit,
        );
      case QuestionType.definitionMCQ:
      case QuestionType.synonymMCQ:
      case QuestionType.antonymMCQ:
      case QuestionType.sentenceCompletion:
        return _buildMcqOptions();
    }
  }

  Widget _buildMcqOptions() {
    return Column(
      children: question.options.map((option) {
        final isSelected = selectedAnswer == option;
        final isCorrectOption = option.toLowerCase().trim() ==
            question.correctAnswer.toLowerCase().trim();

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: McqOptionTile(
            optionText: option,
            isSelected: isSelected,
            isCorrect: isCorrectOption,
            isFeedbackMode: isFeedbackMode,
            onTap: () => onSelectOption(option),
          ),
        );
      }).toList(),
    );
  }
}
