import 'package:flutter/material';

class McqOptionTile extends StatelessWidget {
  final String optionText;
  final bool isSelected;
  final bool isCorrect;
  final bool isFeedbackMode;
  final VoidCallback onTap;

  const McqOptionTile({
    super.key,
    required this.optionText,
    required this.isSelected,
    required this.isCorrect,
    required this.isFeedbackMode,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color cardColor = Colors.white;
    Color borderColor = Colors.grey[300]!;
    Widget? trailing;

    if (isFeedbackMode) {
      if (isCorrect) {
        cardColor = Colors.green[50]!;
        borderColor = Colors.green;
        trailing = const Icon(Icons.check_circle, color: Colors.green);
      } else if (isSelected) {
        cardColor = Colors.red[50]!;
        borderColor = Colors.red;
        trailing = const Icon(Icons.cancel, color: Colors.red);
      }
    } else if (isSelected) {
      cardColor = Theme.of(context).primaryColor.withOpacity(0.05);
      borderColor = Theme.of(context).primaryColor;
    }

    return InkWell(
      onTap: isFeedbackMode ? null : onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        constraints: const BoxConstraints(minHeight: 56),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: cardColor,
          border: Border.all(color: borderColor, width: 2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                optionText,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
            ),
            if (trailing != null) trailing,
          ],
        ),
      ),
    );
  }
}
