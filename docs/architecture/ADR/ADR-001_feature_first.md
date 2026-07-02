# ADR-001: Feature-First Clean Architecture

## Context
As the WordSmart Vocabulary application grows, it will encompass separate modules: Dictionary, Spaced Repetition Study, bilingual stories, bookmarks, and user progress profile analytics. A Layer-First Clean Architecture (e.g. standard `lib/data/`, `lib/domain/`, `lib/presentation/` layout) causes developer friction because working on a single feature requires jumping between directories, increasing positional coupling.

## Decision
We adopt a **Feature-First Clean Architecture** packaging strategy. All classes related to a single domain context are placed inside `lib/features/<feature_name>/` containing:
- `data/`: Models, mappers, datasources, and repository implementations.
- `domain/`: Business entities, repository interfaces, and usecase interactors.
- `presentation/`: Riverpod states, controllers, screen layouts, and widgets.

Core shared files (such as base DB connections, shared failure classes, and global design system tokens/widgets) remain in `lib/core/`.

## Consequences
- **High Cohesion**: Changes to the search logic or word details screens are fully contained within the `dictionary/` feature folder.
- **Low Coupling**: Features are isolated, facilitating parallel development by multiple engineers without package conflicts.
- **Scalability**: New features like bilingual stories or spaced repetition review drills can be added as fresh root folders inside `lib/features/` without disturbing existing code.
