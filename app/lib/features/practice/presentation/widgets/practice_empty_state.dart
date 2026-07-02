import 'package:flutter/material';

class PracticeEmptyState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const PracticeEmptyState({
    super.key,
    required this.message,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              message,
              style: const TextStyle(fontSize: 16, color: Colors.grey, fontWeight: FontWeight.w500),
              textAlign: Center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: onRetry,
              child: const Text('Back to Home'),
            ),
          ],
        ),
      ),
    );
  }
}
