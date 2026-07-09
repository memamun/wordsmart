import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/dictionary/presentation/screens/hit_parades_page.dart';
import '../../features/dictionary/presentation/screens/search_page.dart';
import '../../features/dictionary/presentation/screens/specialized_vocab_page.dart';
import '../../features/dictionary/presentation/screens/word_list_page.dart';
import '../../features/practice/presentation/screens/quizzes_list_page.dart';
import '../../features/review/presentation/screens/progress_dashboard_page.dart';
import '../../features/review/presentation/screens/review_session_page.dart';
import '../../features/practice/presentation/screens/practice_session_page.dart';
import '../../features/stories/presentation/screens/story_reader_page.dart';
import '../../features/recommendation/presentation/providers/providers.dart';
import '../../features/recommendation/presentation/widgets/recommendation_list.dart';
import '../design_system/tokens/app_colors.dart';
import '../design_system/tokens/app_spacing.dart';
import 'app_navigator.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(recommendationProvider.notifier).load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: IndexedStack(
        index: _currentIndex,
        children: [
          const _HomeDashboard(),
          const StoryReaderPage(),
          const ReviewSessionPage(),
          const PracticeSessionPage(),
          const ProgressDashboardPage(),
        ],
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
      indicatorColor: AppColors.primary.withValues(alpha: 0.2),
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.home_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.home, color: AppColors.primary),
          label: 'Home',
        ),
        NavigationDestination(
          icon: Icon(Icons.auto_stories_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.auto_stories, color: AppColors.primary),
          label: 'Stories',
        ),
        NavigationDestination(
          icon: Icon(Icons.psychology_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.psychology, color: AppColors.primary),
          label: 'Review',
        ),
        NavigationDestination(
          icon: Icon(Icons.fitness_center_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.fitness_center, color: AppColors.primary),
          label: 'Practice',
        ),
        NavigationDestination(
          icon: Icon(Icons.dashboard_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.dashboard, color: AppColors.primary),
          label: 'Progress',
        ),
      ],
    );
  }
}

// ─── Home Dashboard ─────────────────────────────────────────────

class _HomeDashboard extends ConsumerWidget {
  const _HomeDashboard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hour = DateTime.now().hour;
    final greeting = hour < 12
        ? 'Good Morning'
        : hour < 17
            ? 'Good Afternoon'
            : 'Good Evening';

    return SafeArea(
      child: CustomScrollView(
        slivers: [
          // ── Header ──────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.sm),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    greeting,
                    style: const TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Ready to expand your vocabulary?',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Search Bar (tappable, navigates to SearchPage) ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
              child: GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact().catchError((_) {});
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const SearchPage()),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md, vertical: 14),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius:
                        BorderRadius.circular(AppSpacing.radiusFull),
                    border: Border.all(color: AppColors.divider, width: 1.2),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.search_rounded,
                          color: AppColors.textMuted, size: 22),
                      SizedBox(width: 12),
                      Text(
                        'Search GRE / SAT vocabulary...',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 15,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // ── Quick Actions ───────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.xs),
              child: Text(
                'QUICK ACTIONS',
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 148,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding:
                    const EdgeInsets.symmetric(horizontal: AppSpacing.lg - 6),
                children: [
                  _QuickActionCard(
                    icon: Icons.psychology_rounded,
                    label: 'Review',
                    subtitle: 'Spaced repetition',
                    gradient: const LinearGradient(
                      colors: [Color(0xFF26A69A), Color(0xFF00796B)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const ReviewSessionPage()),
                    ),
                  ),
                  _QuickActionCard(
                    icon: Icons.fitness_center_rounded,
                    label: 'Practice',
                    subtitle: 'Quiz yourself',
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFFB900), Color(0xFFE69500)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const PracticeSessionPage()),
                    ),
                  ),
                  _QuickActionCard(
                    icon: Icons.auto_stories_rounded,
                    label: 'Stories',
                    subtitle: 'Learn in context',
                    gradient: const LinearGradient(
                      colors: [Color(0xFF7C4DFF), Color(0xFF5C35CC)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const StoryReaderPage()),
                    ),
                  ),
                  _QuickActionCard(
                    icon: Icons.dashboard_rounded,
                    label: 'Progress',
                    subtitle: 'Your stats',
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFF8A80), Color(0xFFD32F2F)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const ProgressDashboardPage()),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Recommendations ─────────────────────────────────
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.only(top: AppSpacing.sm),
              child: RecommendationList(),
            ),
          ),

          // ── More Resources ──────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.lg,
                0,
              ),
              child: Text(
                'More Resources',
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 120,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding:
                    const EdgeInsets.symmetric(horizontal: AppSpacing.lg - 6),
                children: [
                  _ResourceCard(
                    icon: Icons.menu_book_rounded,
                    label: 'Word List',
                    subtitle: 'Browse all words',
                    color: const Color(0xFFE91E63),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const WordListPage()),
                    ),
                  ),
                  _ResourceCard(
                    icon: Icons.quiz_rounded,
                    label: 'Quizzes',
                    subtitle: 'MCQ, Match & More',
                    color: const Color(0xFF7C4DFF),
                    onTap: () =>
                        AppNavigator.pushQuizzesList(context),
                  ),
                  _ResourceCard(
                    icon: Icons.library_books_rounded,
                    label: 'SAT/GRE Lists',
                    subtitle: 'Hit parades',
                    color: const Color(0xFF26A69A),
                    onTap: () =>
                        AppNavigator.pushHitParades(context),
                  ),
                  _ResourceCard(
                    icon: Icons.auto_stories_rounded,
                    label: 'Thematic Vocab',
                    subtitle: 'By chapter',
                    color: const Color(0xFFFFB900),
                    onTap: () =>
                        AppNavigator.pushSpecializedVocab(context),
                  ),
                ],
              ),
            ),
          ),

          // ── Bottom padding ──────────────────────────────────
          const SliverToBoxAdapter(
            child: SizedBox(height: AppSpacing.lg),
          ),
        ],
      ),
    );
  }
}

// ─── Resource Card ──────────────────────────────────────────────

class _ResourceCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _ResourceCard({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact().catchError((_) {});
            onTap();
          },
          borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
          child: Ink(
            width: 140,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color, color.withValues(alpha: 0.7)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
              boxShadow: [
                BoxShadow(
                  color: color.withValues(alpha: 0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius:
                          BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                    child: Icon(icon, color: Colors.white, size: 18),
                  ),
                  const SizedBox(height: 4),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontFamily: 'Outfit',
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          subtitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 10,
                            color: Colors.white.withValues(alpha: 0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Quick Action Card ──────────────────────────────────────────

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final LinearGradient gradient;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 5),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact().catchError((_) {});
            onTap();
          },
          borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
          child: Ink(
            width: 155,
            decoration: BoxDecoration(
              gradient: gradient,
              borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
              boxShadow: [
                BoxShadow(
                  color: gradient.colors.first.withValues(alpha: 0.4),
                  blurRadius: 16,
                  spreadRadius: 1,
                  offset: const Offset(0, 6),
                ),
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius:
                          BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                    child: Icon(icon, color: Colors.white, size: 24),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontFamily: 'Outfit',
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          subtitle,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            height: 1.3,
                            color: Colors.white.withValues(alpha: 0.85),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
