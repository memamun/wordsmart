import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:wordsmart/core/di/injection.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../data/datasources/practice_local_data_source.dart';
import 'quiz_player_page.dart';

enum QuizCategory { mcq, quickMatch, advanced, finalExam }

class QuizListItem {
  final int id;
  final String title;
  final QuizCategory category;

  const QuizListItem({
    required this.id,
    required this.title,
    required this.category,
  });
}

class QuizListPage extends StatefulWidget {
  final QuizCategory category;

  const QuizListPage({super.key, required this.category});

  @override
  State<QuizListPage> createState() => _QuizListPageState();
}

class _QuizListPageState extends State<QuizListPage> {
  List<QuizListItem> _items = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadQuizzes();
  }

  Future<void> _loadQuizzes() async {
    try {
      final ds = sl<PracticeLocalDataSource>();
      List<QuizListItem> items = [];
      switch (widget.category) {
        case QuizCategory.mcq:
          final quizzes = await ds.getMcqQuizzes();
          items = quizzes
              .map((q) => QuizListItem(
                    id: q.quizId,
                    title: q.quizTitle,
                    category: QuizCategory.mcq,
                  ))
              .toList();
          break;
        case QuizCategory.quickMatch:
          final quizzes = await ds.getQuickQuizzes();
          items = quizzes
              .map((q) => QuizListItem(
                    id: q.quizId,
                    title: q.quizTitle,
                    category: QuizCategory.quickMatch,
                  ))
              .toList();
          break;
        case QuizCategory.advanced:
          final quizzes = await ds.getAdvancedQuizzes();
          items = quizzes
              .map((q) => QuizListItem(
                    id: q.quizId,
                    title: q.quizTitle,
                    category: QuizCategory.advanced,
                  ))
              .toList();
          break;
        case QuizCategory.finalExam:
          final exams = await ds.getFinalExams();
          items = exams
              .map((e) => QuizListItem(
                    id: e.drillNumber,
                    title: e.drillTitle,
                    category: QuizCategory.finalExam,
                  ))
              .toList();
          break;
      }
      setState(() {
        _items = items;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  String get _title {
    switch (widget.category) {
      case QuizCategory.mcq:
        return 'MCQ Quizzes';
      case QuizCategory.quickMatch:
        return 'Quick Match';
      case QuizCategory.advanced:
        return 'Advanced SAT/GRE';
      case QuizCategory.finalExam:
        return 'Final Exams';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.sm,
                AppSpacing.sm,
                AppSpacing.lg,
                AppSpacing.sm,
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.arrow_back_rounded,
                      color: AppColors.textPrimary,
                    ),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    _title,
                    style: const TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(child: _buildBody()),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: AppColors.error, size: 48),
              const SizedBox(height: AppSpacing.md),
              Text(
                'Failed to load quizzes',
                style: const TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_items.isEmpty) {
      return const Center(
        child: Text(
          'No quizzes available',
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 16,
            color: AppColors.textMuted,
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      itemCount: _items.length,
      itemBuilder: (context, index) {
        final item = _items[index];
        return _QuizTile(
          item: item,
          onTap: () {
            HapticFeedback.lightImpact().catchError((_) {});
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => QuizPlayerPage(quizItem: item),
              ),
            );
          },
        );
      },
    );
  }
}

class _QuizTile extends StatelessWidget {
  final QuizListItem item;
  final VoidCallback onTap;

  const _QuizTile({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          child: Ink(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
              border: Border.all(color: AppColors.divider),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  ),
                  child: const Icon(
                    Icons.quiz_rounded,
                    color: AppColors.primary,
                    size: 22,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    item.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.textMuted,
                  size: 24,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
