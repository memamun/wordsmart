import '../entities/recommendation.dart';

class RecommendationPolicy {
  final int maxPerType;
  final int dailyCap;
  final Duration cooldown;

  const RecommendationPolicy({
    this.maxPerType = 1,
    this.dailyCap = 5,
    this.cooldown = const Duration(hours: 4),
  });

  bool isWithinCooldown(
      Recommendation recommendation, DateTime lastDismissedAt, DateTime now) {
    return now.difference(lastDismissedAt) < cooldown;
  }

  bool isWithinDailyCap(int dismissedToday) {
    return dismissedToday < dailyCap;
  }
}
