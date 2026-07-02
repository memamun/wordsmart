import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/navigation/app_navigator.dart';
import '../providers/providers.dart';
import '../providers/progress_state.dart';
import '../widgets/dashboard/activity_timeline.dart';
import '../widgets/dashboard/daily_goal_card.dart';
import '../widgets/dashboard/learning_metrics_card.dart';
import '../widgets/dashboard/next_action_card.dart';
import '../widgets/dashboard/progress_summary_card.dart';

class ProgressDashboardPage extends ConsumerStatefulWidget {
  const ProgressDashboardPage({Key? key}) : super(key: key);

  @override
  ConsumerState<ProgressDashboardPage> createState() => _ProgressDashboardPageState();
}

class _ProgressDashboardPageState extends ConsumerState<ProgressDashboardPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(progressProvider.notifier).loadMetrics(now: DateTime.now());
    });
  }

  @override
  Widget build(BuildContext context) {
    final progressState = ref.watch(progressProvider);
    final notifier = ref.read(progressProvider.notifier);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        title: const Text(
          "Progress & Analytics",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await notifier.loadMetrics(now: DateTime.now());
        },
        color: Colors.indigoAccent,
        backgroundColor: Colors.grey[900],
        child: _buildBody(progressState, notifier),
      ),
    );
  }

  Widget _buildBody(ProgressState state, ProgressNotifier notifier) {
    if (state is ProgressInitial || state is ProgressLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.indigoAccent),
      );
    }

    if (state is ProgressFailure) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.redAccent, size: 64),
              const SizedBox(height: 16),
              const Text(
                "Failed to Load Progress Stats",
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
                onPressed: () => notifier.loadMetrics(now: DateTime.now()),
                child: const Text("Retry"),
              ),
            ],
          ),
        ),
      );
    }

    if (state is ProgressLoaded) {
      final metrics = state.metrics;

      return ListView(
        padding: const EdgeInsets.all(20.0),
        children: [
          ProgressSummaryCard(metrics: metrics),
          const SizedBox(height: 20),
          NextActionCard(
            dueCount: metrics.dueToday,
            onActionPressed: () {
              AppNavigator.pushReviewSession(context).then((_) {
                // Refresh dashboard stats on return from review
                notifier.loadMetrics(now: DateTime.now());
              });
            },
          ),
          const SizedBox(height: 20),
          DailyGoalCard(
            completed: metrics.sessions.length,
            target: 2, // Default daily sessions target
          ),
          const SizedBox(height: 20),
          LearningMetricsCard(metrics: metrics),
          const SizedBox(height: 20),
          const ActivityTimeline(),
        ],
      );
    }

    return const SizedBox.shrink();
  }
}
