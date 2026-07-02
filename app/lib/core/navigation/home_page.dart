import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/dictionary/presentation/screens/search_page.dart';
import '../../features/review/presentation/screens/progress_dashboard_page.dart';
import '../../features/review/presentation/screens/review_session_page.dart';
import '../../features/practice/presentation/screens/practice_session_page.dart';
import '../../features/stories/presentation/screens/story_reader_page.dart';
import '../../features/recommendation/presentation/providers/providers.dart';
import '../../features/recommendation/presentation/widgets/recommendation_list.dart';
import '../design_system/tokens/app_colors.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  int _currentIndex = 0;

  final _featurePages = const [
    SearchPage(),
    StoryReaderPage(),
    ReviewSessionPage(),
    PracticeSessionPage(),
    ProgressDashboardPage(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(recommendationProvider.notifier).load();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_currentIndex == 0) {
      return _buildHomeWithRecommendations();
    }

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _featurePages,
      ),
      bottomNavigationBar: _buildNavBar(),
    );
  }

  Widget _buildHomeWithRecommendations() {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: IndexedStack(
                index: 0,
                children: [
                  Column(
                    children: [
                      const Expanded(child: SearchPage()),
                      const RecommendationList(),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildNavBar(),
    );
  }

  Widget _buildNavBar() {
    return NavigationBar(
      selectedIndex: _currentIndex,
      onDestinationSelected: (index) {
        HapticFeedback.lightImpact().catchError((_) {});
        setState(() => _currentIndex = index);
      },
      backgroundColor: AppColors.surface,
      indicatorColor: AppColors.teal.withValues(alpha: 0.2),
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.home_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.home, color: AppColors.teal),
          label: 'Home',
        ),
        NavigationDestination(
          icon: Icon(Icons.auto_stories_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.auto_stories, color: AppColors.teal),
          label: 'Stories',
        ),
        NavigationDestination(
          icon: Icon(Icons.psychology_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.psychology, color: AppColors.teal),
          label: 'Review',
        ),
        NavigationDestination(
          icon: Icon(Icons.fitness_center_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.fitness_center, color: AppColors.teal),
          label: 'Practice',
        ),
        NavigationDestination(
          icon: Icon(Icons.dashboard_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.dashboard, color: AppColors.teal),
          label: 'Progress',
        ),
      ],
    );
  }
}
