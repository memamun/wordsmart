# Pull Request Template

## What does this PR do?

<!-- Brief description of the change -->

## Architecture Review

- [ ] Dependency direction maintained (core ← features, not reverse)
- [ ] No business logic added to presentation layer
- [ ] No SQL executed outside data layer
- [ ] No Flutter imports in domain layer
- [ ] No direct Navigator.push/pop (use AppNavigator)
- [ ] Design tokens used for colors/spacing/animations
- [ ] New code follows existing patterns

## ADR Compliance

<!-- Check all that apply -->

- [ ] ADR-001: Feature-first structure maintained
- [ ] ADR-003: Riverpod used for state management
- [ ] ADR-005: SM-2 logic only in core/learning
- [ ] ADR-007: Design system widgets reused
- [ ] ADR-008: Dependencies registered in injection.dart
- [ ] ADR-013: core/learning has zero feature imports
- [ ] ADR-014: stories does not import review
- [ ] ADR-015: recommendation is orchestration only

## Testing

- [ ] Tests added/updated
- [ ] `flutter analyze` passes (0 errors, 0 warnings)
- [ ] `flutter test` passes

## Checklist

- [ ] Code compiles without errors
- [ ] No new `TODO` comments left in code
- [ ] Documentation updated if needed
- [ ] No secrets or keys committed
