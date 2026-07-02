import 'package:flutter/material.dart';

class ReviewProgressHeader extends StatelessWidget {
  final int currentIndex;
  final int totalCount;

  const ReviewProgressHeader({
    Key? key,
    required this.currentIndex,
    required this.totalCount,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double percentage = totalCount > 0 ? (currentIndex / totalCount) : 0.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "Review Session",
              style: TextStyle(
                color: Colors.grey[400],
                fontSize: 14,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
            Text(
              "$currentIndex / $totalCount",
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Progress Track Bar
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: Container(
            height: 6,
            color: Colors.grey[850],
            child: Align(
              alignment: Alignment.centerLeft,
              child: FractionallySizedBox(
                widthFactor: percentage,
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.indigoAccent, Colors.purpleAccent],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
