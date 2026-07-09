import 'package:flutter/material.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../../../core/design_system/states/empty_state.dart';
import '../../../../core/design_system/states/loading_skeleton.dart';
import '../../../../core/design_system/buttons/primary_button.dart';
import '../../../../core/navigation/app_navigator.dart';
import '../../data/datasources/word_local_data_source.dart';
import '../../data/models/hit_parade_model.dart';
import '../../../../core/di/injection.dart';

class HitParadesPage extends StatefulWidget {
  const HitParadesPage({super.key});

  @override
  State<HitParadesPage> createState() => _HitParadesPageState();
}

class _HitParadesPageState extends State<HitParadesPage> {
  final ds = sl<WordLocalDataSource>();
  late Future<List<HitParadeModel>> _future;

  @override
  void initState() {
    super.initState();
    _future = ds.getHitParades();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = ds.getHitParades();
    });
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: const Text(
          'SAT/GRE Word Lists',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w600),
        ),
        backgroundColor: AppColors.canvas,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SafeArea(
        child: FutureBuilder<List<HitParadeModel>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return _buildLoading();
            }
            if (snapshot.hasError) {
              return _buildError(snapshot.error.toString());
            }
            final parades = snapshot.data ?? [];
            if (parades.isEmpty) {
              return const EmptyState(
                icon: Icons.list_alt_rounded,
                title: 'No Word Lists',
                description: 'No SAT/GRE word lists are available yet.',
              );
            }
            return _buildList(parades);
          },
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: 8,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const LoadingSkeleton(width: 200, height: 16),
              const SizedBox(height: AppSpacing.sm),
              ...List.generate(
                3,
                (_) => const Padding(
                  padding: EdgeInsets.only(bottom: AppSpacing.sm),
                  child: LoadingSkeleton(
                    width: double.infinity,
                    height: 20,
                    borderRadius: AppSpacing.radiusSm,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildError(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, size: 64, color: Colors.white10),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Something went wrong',
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            PrimaryButton(
              text: 'Retry',
              onPressed: () {
                setState(() {
                  _future = ds.getHitParades();
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildList(List<HitParadeModel> parades) {
    final grouped = <String, List<HitParadeModel>>{};
    for (final p in parades) {
      grouped.putIfAbsent(p.listName, () => []).add(p);
    }

    return RefreshIndicator(
      onRefresh: _refresh,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        itemCount: grouped.length,
        itemBuilder: (context, index) {
          final listName = grouped.keys.elementAt(index);
          final items = grouped[listName]!;
          return _buildGroup(listName, items);
        },
      ),
    );
  }

  Widget _buildGroup(String listName, List<HitParadeModel> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: AppSpacing.md, bottom: AppSpacing.sm),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, Color(0xFF00897B)],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          child: Text(
            listName,
            style: const TextStyle(
              fontFamily: 'Outfit',
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
          ),
        ),
        ...items.map(
          (item) => ListTile(
            dense: true,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
            ),
            leading: Text(
              '${item.rank}.',
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                color: AppColors.textMuted,
                fontWeight: FontWeight.w500,
              ),
            ),
            title: Text(
              item.word,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 16,
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w400,
              ),
            ),
            trailing: const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.textMuted,
              size: 20,
            ),
            onTap: () => AppNavigator.pushWordDetails(context, item.wordId),
          ),
        ),
      ],
    );
  }
}
