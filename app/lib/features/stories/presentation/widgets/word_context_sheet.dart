import 'package:flutter/material.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../domain/entities/highlighted_word.dart';

class WordContextSheet extends StatelessWidget {
  final HighlightedWord word;
  final VoidCallback onClose;

  const WordContextSheet({
    super.key,
    required this.word,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  word.word.toUpperCase(),
                  style: const TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.amber,
                  ),
                ),
              ),
              IconButton(
                onPressed: onClose,
                icon: const Icon(Icons.close_rounded,
                    color: AppColors.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            word.definition,
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 15,
              color: AppColors.textPrimary,
              height: 1.45,
            ),
          ),
          if (word.bengaliMeaning.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              word.bengaliMeaning,
              style: const TextStyle(
                fontFamily: 'Hind Siliguri',
                fontSize: 16,
                color: AppColors.teal,
                height: 1.45,
              ),
            ),
          ],
          const SizedBox(height: 18),
          OutlinedButton.icon(
            onPressed: onClose,
            icon: const Icon(Icons.menu_book_rounded),
            label: const Text('Continue Reading'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.textPrimary,
              side: const BorderSide(color: AppColors.teal),
            ),
          ),
        ],
      ),
    );
  }
}
