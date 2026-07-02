import 'package:flutter/material.dart';

class ReviewRatingBar extends StatelessWidget {
  final Function(bool isCorrect) onRatingSelected;
  final bool isSubmitting;

  const ReviewRatingBar({
    Key? key,
    required this.onRatingSelected,
    required this.isSubmitting,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildRatingButton(
          label: "Again",
          color: Colors.redAccent,
          onTap: () => onRatingSelected(false),
        ),
        _buildRatingButton(
          label: "Hard",
          color: Colors.orangeAccent,
          onTap: () => onRatingSelected(true),
        ),
        _buildRatingButton(
          label: "Good",
          color: Colors.indigoAccent,
          onTap: () => onRatingSelected(true),
        ),
        _buildRatingButton(
          label: "Easy",
          color: Colors.greenAccent,
          onTap: () => onRatingSelected(true),
        ),
      ],
    );
  }

  Widget _buildRatingButton({
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4.0),
        child: Opacity(
          opacity: isSubmitting ? 0.6 : 1.0,
          child: ElevatedButton(
            onPressed: isSubmitting ? null : onTap,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.grey[900],
              foregroundColor: color,
              padding: const EdgeInsets.symmetric(vertical: 16),
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side:
                    BorderSide(color: color.withValues(alpha: 0.3), width: 1.5),
              ),
            ),
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
