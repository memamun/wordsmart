import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../domain/entities/story_paragraph.dart';

class StoryParagraphBlock extends StatelessWidget {
  final StoryParagraph paragraph;
  final ValueChanged<String> onWordTap;

  const StoryParagraphBlock({
    super.key,
    required this.paragraph,
    required this.onWordTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text.rich(
            TextSpan(children: _buildSpans(paragraph.englishText)),
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 18,
              color: AppColors.textPrimary,
              height: 1.55,
            ),
          ),
          if (paragraph.bengaliText.isNotEmpty) ...[
            const SizedBox(height: 18),
            const Divider(color: AppColors.divider),
            const SizedBox(height: 12),
            Text(
              paragraph.bengaliText.replaceAll('**', ''),
              style: const TextStyle(
                fontFamily: 'Hind Siliguri',
                fontSize: 16,
                color: AppColors.textSecondary,
                height: 1.55,
              ),
            ),
          ],
        ],
      ),
    );
  }

  List<InlineSpan> _buildSpans(String text) {
    final spans = <InlineSpan>[];
    final regex = RegExp(r'\*\*(.*?)\*\*');
    int cursor = 0;

    for (final match in regex.allMatches(text)) {
      if (match.start > cursor) {
        spans.add(TextSpan(text: text.substring(cursor, match.start)));
      }
      final word = match.group(1) ?? '';
      spans.add(TextSpan(
        text: word,
        style: const TextStyle(
          color: AppColors.amber,
          fontWeight: FontWeight.w700,
          decoration: TextDecoration.underline,
          decorationColor: AppColors.amber,
        ),
        recognizer: TapGestureRecognizer()..onTap = () => onWordTap(word),
      ));
      cursor = match.end;
    }

    if (cursor < text.length) {
      spans.add(TextSpan(text: text.substring(cursor)));
    }
    return spans;
  }
}
