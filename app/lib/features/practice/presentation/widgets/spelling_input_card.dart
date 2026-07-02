import 'package:flutter/material.dart';
import '../../../../core/design_system/tokens/app_colors.dart';

class SpellingInputCard extends StatefulWidget {
  final bool isSubmitting;
  final bool isFeedbackMode;
  final bool? isCorrect;
  final String correctAnswer;
  final ValueChanged<String> onChanged;
  final VoidCallback onSubmit;

  const SpellingInputCard({
    super.key,
    required this.isSubmitting,
    required this.isFeedbackMode,
    required this.isCorrect,
    required this.correctAnswer,
    required this.onChanged,
    required this.onSubmit,
  });

  @override
  State<SpellingInputCard> createState() => _SpellingInputCardState();
}

class _SpellingInputCardState extends State<SpellingInputCard> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Color borderColor = AppColors.divider;
    Color fillColor = AppColors.surface;

    if (widget.isFeedbackMode) {
      if (widget.isCorrect == true) {
        borderColor = AppColors.success;
        fillColor = AppColors.success.withValues(alpha: 0.12);
      } else {
        borderColor = AppColors.error;
        fillColor = AppColors.error.withValues(alpha: 0.12);
      }
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: fillColor,
        border: Border.all(color: borderColor, width: 2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: _controller,
            enabled: !widget.isSubmitting && !widget.isFeedbackMode,
            autofocus: true,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
              color: AppColors.textPrimary,
            ),
            decoration: const InputDecoration(
              hintText: 'Type spelling...',
              border: InputBorder.none,
              hintStyle: TextStyle(color: AppColors.textMuted),
            ),
            onChanged: widget.onChanged,
            onSubmitted: (_) => widget.onSubmit(),
          ),
          if (widget.isFeedbackMode && widget.isCorrect == false) ...[
            const SizedBox(height: 12),
            const Divider(color: AppColors.divider),
            const SizedBox(height: 8),
            Row(
              children: [
                const Text(
                  'Correct Spelling: ',
                  style: TextStyle(fontWeight: FontWeight.w500, color: AppColors.textSecondary),
                ),
                Text(
                  widget.correctAnswer.toUpperCase(),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.success,
                    fontSize: 16,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
          ]
        ],
      ),
    );
  }
}
