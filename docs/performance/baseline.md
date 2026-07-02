# Performance Baseline

Recorded: 2026-07-02
Platform: Android (Pixel 7 / equivalent)
Flutter: 3.x
Database: SQLite (wordsmart.db, ~4500 words)

## Targets

| Metric                    | Target   | Actual  | Notes                           |
| ------------------------- | -------- | ------- | ------------------------------- |
| App cold start            | < 2 s    | TBD     | Time to interactive             |
| Search latency            | < 100 ms | TBD     | Query to results displayed      |
| Recommendation generation | < 50 ms  | TBD     | getCandidates + score + rank    |
| Review queue build        | < 30 ms  | TBD     | getDailyQueue call              |
| Story open                | < 150 ms | TBD     | Story tap to first paragraph    |
| Dashboard render          | < 200 ms | TBD     | Metrics load to paint           |
| SQLite open               | < 50 ms  | TBD     | Database file open              |
| Memory after launch       | baseline | TBD     | RSS after 5s idle               |

## Measurement Methodology

### App Cold Start
```bash
flutter run --profile
# Record time from tap to first frame rendered
```

### Search Latency
```dart
final sw = Stopwatch()..start();
final results = await searchUseCase(query);
sw.stop();
print('Search: ${sw.elapsedMilliseconds}ms');
```

### Recommendation Generation
```dart
final sw = Stopwatch()..start();
final candidates = await repository.getCandidates();
final ranked = ranker.process(candidates);
sw.stop();
print('Recommendations: ${sw.elapsedMilliseconds}ms');
```

### Memory
```bash
flutter run --profile
# adb shell dumpsys meminfo <pid>
```

## SQLite Performance

| Query                     | Target   | Notes                           |
| ------------------------- | -------- | ------------------------------- |
| Word search (LIKE)        | < 50 ms  | Indexed, 4500 rows              |
| Progress upsert           | < 10 ms  | Single row, indexed             |
| Learning events insert    | < 5 ms   | Append-only                     |
| Daily queue build         | < 30 ms  | JOIN progress + words           |
| Story query               | < 20 ms  | Small table (~10 rows)          |
| Recommendation candidates | < 40 ms  | Multiple queries, parallel      |

## Animation Performance

| Animation                 | Target       | Notes                           |
| ------------------------- | ------------ | ------------------------------- |
| Flashcard flip            | 60 FPS       | 3D perspective transform        |
| Page transitions          | 60 FPS       | MaterialPageRoute              |
| Loading skeletons         | 60 FPS       | Shimmer effect                  |
| Progress bar              | 60 FPS       | Linear interpolation            |

## Optimization Notes

1. **Recommendations cached** — Scorer runs once per refresh, not per rebuild
2. **IndexedStack** — Home screen tabs preserve state without rebuild
3. **Lazy singletons** — DI registrations are lazy, not eager
4. **Future.microtask** — Story loading deferred to avoid build-phase async
5. **Parallel fetching** — Recommendation repository uses Future.wait

## Regression Checklist

Before each release:
- [ ] Cold start < 2s
- [ ] Search < 100ms
- [ ] No jank in flashcard animation
- [ ] SQLite queries < 50ms
- [ ] Memory stable after 60s idle
