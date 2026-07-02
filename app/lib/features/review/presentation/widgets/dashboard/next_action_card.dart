import 'package:flutter/material.dart';

class NextActionCard extends StatelessWidget {
  final int dueCount;
  final VoidCallback onActionPressed;

  const NextActionCard({
    Key? key,
    required this.dueCount,
    required this.onActionPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bool hasDue = dueCount > 0;

    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey[850]!),
      ),
      padding: const EdgeInsets.all(20.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: (hasDue ? Colors.indigoAccent : Colors.greenAccent).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              hasDue ? Icons.alarm : Icons.done_all,
              color: hasDue ? Colors.indigoAccent : Colors.greenAccent,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  hasDue ? "Reviews Ready" : "Up to Date",
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  hasDue 
                      ? "You have $dueCount words due for review." 
                      : "Awesome! You have no pending reviews.",
                  style: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: onActionPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: hasDue ? Colors.indigoAccent : Colors.grey[850],
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              hasDue ? "Review" : "Explore",
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
