import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/navigation/app_navigator.dart';
import '../providers/providers.dart';
import '../providers/review_session_state.dart';
import '../widgets/review_completion_summary.dart';
import '../../../../core/design_system/states/empty_state.dart';
import '../widgets/review_flashcard.dart';
import '../widgets/review_loading_skeleton.dart';
import '../widgets/review_progress_header.dart';
import '../widgets/review_rating_bar.dart';

class ReviewSessionPage extends ConsumerStatefulWidget {
  const ReviewSessionPage({Key? key}) : super(key: key);

  @override
  ConsumerState<ReviewSessionPage> createState() => _ReviewSessionPageState();
}

class _ReviewSessionPageState extends ConsumerState<ReviewSessionPage> {
  final DateTime _sessionStartTime = DateTime.now();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(reviewSessionProvider.notifier).startSession(
            sessionId: 'session-${DateTime.now().millisecondsSinceEpoch}',
            limit: 20,
            now: DateTime.now(),
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final sessionState = ref.watch(reviewSessionProvider);
    final notifier = ref.read(reviewSessionProvider.notifier);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => AppNavigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: _buildBody(sessionState, notifier),
      ),
    );
  }

  Widget _buildBody(ReviewSessionState state, ReviewSessionNotifier notifier) {
    if (state is ReviewSessionInitial || state is ReviewSessionLoading) {
      return const ReviewLoadingSkeleton();
    }

    if (state is ReviewSessionFailure) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.redAccent, size: 64),
              const SizedBox(height: 16),
              const Text(
                "Failed to Load Queue",
                style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                state.failure.message,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[400], fontSize: 14),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  notifier.startSession(
                    sessionId: 'session-${DateTime.now().millisecondsSinceEpoch}',
                    limit: 20,
                    now: DateTime.now(),
                  );
                },
                child: const Text("Retry"),
              ),
            ],
          ),
        ),
      );
    }

    if (state is ReviewSessionCompleted) {
      return ReviewCompletionSummary(
        session: state.session,
        onContinue: () => AppNavigator.pop(context),
      );
    }

    if (state is ReviewSessionActive) {
      final session = state.session;
      if (session.queue.cards.isEmpty) {
        return EmptyState(
          icon: Icons.check_circle_outline,
          title: "All Caught Up!",
          description: "You have completed all scheduled card reviews for today. Check back tomorrow or search for new words to learn!",
          actionLabel: "Back to Home",
          onActionPressed: () => AppNavigator.pop(context),
        );
      }

      final currentCard = state.currentCard;

      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ReviewProgressHeader(
              currentIndex: state.currentIndex + 1,
              totalCount: session.queue.cards.length,
            ),
            const SizedBox(height: 36),
            Expanded(
              child: ReviewFlashcard(
                card: currentCard,
                isFront: state.isFrontSide,
                onTap: () => notifier.flipCard(),
              ),
            ),
            const SizedBox(height: 36),
            if (state.isFrontSide) ...[
              ElevatedButton(
                onPressed: () => notifier.flipCard(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey[900],
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.grey[850]!),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  "Tap Card to Reveal Definition",
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ),
            ] else ...[
              ReviewRatingBar(
                isSubmitting: state.isSubmitting,
                onRatingSelected: (isCorrect) {
                  // Simply map to correct/incorrect based on button selections
                  notifier.submitReview(
                    isCorrect: isCorrect,
                    responseTime: DateTime.now().difference(_sessionStartTime),
                    hintUsed: false,
                    now: DateTime.now(),
                  );
                },
              ),
            ],
            const SizedBox(height: 16),
          ],
        ),
      );
    }

    return const SizedBox.shrink();
  }
}
