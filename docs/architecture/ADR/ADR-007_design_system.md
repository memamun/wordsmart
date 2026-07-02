# ADR-007: Reusable Design System Widgets Hierarchy

## Context
A major contributor to technical debt in mobile applications is layout code duplication. Widgets like custom search bars, list items, buttons, and loading skeletons are often written inline or inside individual screens. This creates design inconsistency and makes styling updates extremely tedious.

## Decision
We enforce a strict **Reusable Design System Widgets Hierarchy** under `lib/core/design_system/`:
- **Tokens**: Abstract visual properties (colors, typography styles, motion curves).
- **Core Widgets**: Universal, presentation-agnostic components categorized into:
  - `buttons/`: Generic action buttons (`PrimaryButton`, `BookmarkButton`, `AudioButton`).
  - `inputs/`: Word search inputs, checkboxes, text fields (`WordSearchBar`).
  - `states/`: General application states (`EmptyState`, `LoadingSkeleton`).
  - `typography/`: Generic title labels (`SectionHeader`).
- **Feature Widgets**: Custom layout components that couple domain logic with layout (e.g. `FeaturedWordCard` or `WordListTile`) remain inside their respective `features/<name>/presentation/widgets/` directories.

## Rules for Widget Creation:
1. Reusable core widgets must not import any feature domain entities or providers.
2. They must rely solely on standard Dart types (`String`, `bool`, callbacks) to remain modular and reusable.
3. If a layout component requires business logic injection, it belongs inside `features/<name>/presentation/widgets/`.

## Consequences
- **Design Consistency**: Every screen inherits identical components matching our style guidelines.
- **Fast Development**: Reusing core buttons, states, and inputs accelerates building Home and Study screens in subsequent slices.
- **Maintainability**: Global styling adjustments (e.g., color tint or spacing adjustments) require editing a single file in `core/design_system/`.
