# Architecture Overview

## System Architecture

WordSmart follows Clean Architecture with Feature-First organization.

```
lib/
├── core/                    Shared infrastructure
│   ├── database/            SQLite client, migrations
│   ├── error/               Failures, exceptions
│   ├── learning/            Shared learning engine (SM2, signals, cards)
│   ├── analytics/           Learning event logging
│   ├── navigation/          AppNavigator, AppRoutes, HomePage
│   ├── design_system/       Tokens, buttons, inputs, states
│   ├── domain/              Shared domain entities (Word, WordExample, etc.)
│   └── di/                  GetIt dependency injection
│
├── features/
│   ├── dictionary/          Word search, details, bookmarks
│   ├── review/              Spaced repetition, progress dashboard
│   ├── practice/            Quiz-based practice sessions
│   ├── stories/             Contextual reading, word exposure
│   └── recommendation/      Orchestration layer for next actions
```

## Dependency Graph

```
                    core/
    ┌────────┬──────────┬────────────┬──────────────┬────────┐
    │domain  │learning  │analytics   │navigation    │database│
    │(Word)  │(SM2,Card)│(Logger)    │(AppNavigator)│(AppDB) │
    └───┬────┴────┬─────┴─────┬──────┴──────┬───────┴───┬────┘
        │         │           │             │           │
        ▼         ▼           ▼             ▼           ▼
   ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐
   │dict.    ││review   ││practice ││stories  ││recommend│
   │(search, ││(SM-2,   ││(quizzes,││(reading,││(next    │
   │ details)││ queue)  ││ session)││ expose) ││ action) │
   └─────────┘└─────────┘└─────────┘└─────────┘└─────────┘
        │         │           │             │           │
        └─────────┴───────────┴─────────────┴───────────┘
                              │
                     Presentation Layer
                   (Providers, Widgets, Screens)
```

## Dependency Rules

1. **core/ never imports features/** — core is the foundation
2. **features/ only import core/** — features depend on shared infrastructure
3. **recommendation imports use cases** — orchestration via stable application APIs
4. **No feature imports another feature's data layer** — only through core abstractions
5. **Domain entities are immutable** — no mutable state in domain layer

## Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| practice imports review/data/models | Low | ReviewCardModel used for shared SQLite queries |
| practice imports review/domain/usecases | Low | FinishReviewSessionUseCase for session lifecycle |
| presentation uses DateTime.now() | Low | Acceptable at UI boundary, reduces testability |

## Feature Responsibilities

| Feature | Responsibility | Core Dependencies |
|---------|---------------|-------------------|
| Dictionary | Word search, details, examples | core/domain (Word) |
| Review | Spaced repetition, progress tracking | core/learning (SM2, LearningCard) |
| Practice | Quiz generation, answer validation | core/learning, dictionary (Word) |
| Stories | Reading comprehension, word exposure | core/learning, core/analytics |
| Recommendation | Orchestrate next actions | All features (via use cases) |
