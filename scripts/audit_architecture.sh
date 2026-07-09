#!/usr/bin/env bash
# Architecture Compliance Audit Script
# Run before every release: bash scripts/audit_architecture.sh
set -uo pipefail

APP_DIR="app/lib"
TEST_DIR="app/test"
PASS=0
FAIL=0
WARN=0

pass() { echo "  ✅ $1"; ((PASS++)); }
fail() { echo "  ❌ $1"; ((FAIL++)); }
warn() { echo "  ⚠️  $1"; ((WARN++)); }

echo "╔══════════════════════════════════════════╗"
echo "║   Architecture Compliance Audit          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ─── 1. Dependency Rules ───────────────────────────────────────────────
echo "── 1. Dependency Rules ──"

# core/ must not import features/ (except DI and Navigation which legitimately wire everything)
VIOLATIONS=$(grep -r "import.*features/" "$APP_DIR/core/" 2>/dev/null | grep -v "^Binary" | grep -v "di/injection.dart" | grep -v "navigation/app_navigator.dart" | grep -v "navigation/home_page.dart" || true)
if [ -z "$VIOLATIONS" ]; then
  pass "core/ has no imports from features/ (DI and Navigation are exempt)"
else
  fail "core/ imports from features/:"
  echo "$VIOLATIONS" | head -5
fi

# domain/ must not import flutter
VIOLATIONS=$(grep -r "import.*flutter/" "$APP_DIR/" 2>/dev/null | grep "/domain/" | grep -v "^Binary" || true)
if [ -z "$VIOLATIONS" ]; then
  pass "domain/ has no Flutter imports"
else
  fail "domain/ imports Flutter:"
  echo "$VIOLATIONS" | head -5
fi

# domain/ must not import sqflite
VIOLATIONS=$(grep -r "import.*sqflite" "$APP_DIR/" 2>/dev/null | grep "/domain/" | grep -v "^Binary" || true)
if [ -z "$VIOLATIONS" ]; then
  pass "domain/ has no sqflite imports"
else
  fail "domain/ imports sqflite:"
  echo "$VIOLATIONS" | head -5
fi

echo ""

# ─── 2. Learning Engine ────────────────────────────────────────────────
echo "── 2. Learning Engine (ADR-005, ADR-013) ──"

# core/learning/ must not import features/
VIOLATIONS=$(grep -r "import.*features/" "$APP_DIR/core/learning/" 2>/dev/null | grep -v "^Binary" || true)
if [ -z "$VIOLATIONS" ]; then
  pass "core/learning/ has no feature imports"
else
  fail "core/learning/ imports features:"
  echo "$VIOLATIONS" | head -5
fi

# No duplicate SM-2 implementations (exclude tests, imports, and re-exports)
SM2_COUNT=$(find "$APP_DIR" -name "*sm2*" -o -name "*SM2*" 2>/dev/null | grep -v test | while read f; do
  # Count only files that contain actual SM-2 calculation logic (not just re-exports)
  if grep -q "calculateNextReview\|easinessFactor\|intervalDays" "$f" 2>/dev/null; then
    echo "$f"
  fi
done | wc -l || true)
if [ "$SM2_COUNT" -le 1 ]; then
  pass "Single SM-2 implementation ($SM2_COUNT file with logic)"
else
  fail "Multiple SM-2 implementations found ($SM2_COUNT)"
fi

# No DateTime.now() in core/learning domain (except Clock)
VIOLATIONS=$(grep -rn "DateTime.now()" "$APP_DIR/core/learning/" 2>/dev/null | grep -v "clock\|Clock\|SystemClock\|FakeClock" | grep -v "^Binary" || true)
if [ -z "$VIOLATIONS" ]; then
  pass "No DateTime.now() in core/learning domain"
else
  warn "DateTime.now() found in core/learning (verify Clock abstraction is used):"
  echo "$VIOLATIONS" | head -5
fi

echo ""

# ─── 3. Navigation ─────────────────────────────────────────────────────
echo "── 3. Navigation ──"

# No Navigator.push/pop outside AppNavigator (exclude AppNavigator calls themselves)
VIOLATIONS=$(grep -rn "Navigator\.\(push\|pop\)" "$APP_DIR/" 2>/dev/null | grep -v "app_navigator" | grep -v "AppNavigator" | grep -v "^Binary" || true)
if [ -z "$VIOLATIONS" ]; then
  pass "No direct Navigator.push/pop outside AppNavigator"
else
  fail "Direct Navigator usage outside AppNavigator:"
  echo "$VIOLATIONS" | head -10
fi

echo ""

# ─── 4. Database ───────────────────────────────────────────────────────
echo "── 4. Database (ADR-002, ADR-006) ──"

# SQL only in datasources (exclude database_initializer and analytics logger which are data layer)
VIOLATIONS=$(grep -rn "db\.execute\|rawQuery\|rawInsert\|rawDelete" "$APP_DIR/" 2>/dev/null | grep -v "datasource" | grep -v "migration" | grep -v "database_initializer" | grep -v "sqlite_learning_event" | grep -v "^Binary" || true)
if [ -z "$VIOLATIONS" ]; then
  pass "SQL execution only in data layer"
else
  warn "SQL found outside datasources (verify correctness):"
  echo "$VIOLATIONS" | head -5
fi

echo ""

# ─── 5. Design System ─────────────────────────────────────────────────
echo "── 5. Design System (ADR-007) ──"

# Design system must not import features
VIOLATIONS=$(grep -r "import.*features/" "$APP_DIR/core/design_system/" 2>/dev/null | grep -v "^Binary" || true)
if [ -z "$VIOLATIONS" ]; then
  pass "Design System has no feature imports"
else
  fail "Design System imports features:"
  echo "$VIOLATIONS" | head -5
fi

# Check for deprecated withOpacity
DEPRECATED=$(grep -rn "\.withOpacity(" "$APP_DIR/" 2>/dev/null | grep -v "^Binary" || true)
if [ -z "$DEPRECATED" ]; then
  pass "No deprecated withOpacity() calls"
else
  warn "withOpacity() found ($(echo "$DEPRECATED" | wc -l) occurrences):"
  echo "$DEPRECATED" | head -3
fi

echo ""

# ─── 6. Feature Isolation ──────────────────────────────────────────────
echo "── 6. Feature Isolation ──"

# Stories must not import review
VIOLATIONS=$(grep -r "import.*features/review/" "$APP_DIR/features/stories/" 2>/dev/null | grep -v "^Binary" || true)
if [ -z "$VIOLATIONS" ]; then
  pass "stories/ does not import review/"
else
  fail "stories/ imports review/:"
  echo "$VIOLATIONS" | head -5
fi

# Recommendation must not import other features' data/domain
VIOLATIONS=$(grep -r "import.*features/.*/data/\|import.*features/.*/domain/" "$APP_DIR/features/recommendation/" 2>/dev/null | grep -v "^Binary" || true)
if [ -z "$VIOLATIONS" ]; then
  pass "recommendation/ has no cross-feature data/domain imports"
else
  fail "recommendation/ imports other features:"
  echo "$VIOLATIONS" | head -5
fi

echo ""

# ─── 7. Testing ────────────────────────────────────────────────────────
echo "── 7. Testing ──"

# Count tests
TEST_COUNT=$(grep -r "test(" "$TEST_DIR/" 2>/dev/null | grep -c ".dart" || true)
echo "  📊 Test count: $TEST_COUNT"

# Check flutter analyze
ANALYZE_OUTPUT=$(cd app && flutter analyze 2>&1 || true)
ERROR_COUNT=$(echo "$ANALYZE_OUTPUT" | grep -c "error •" || true)
WARNING_COUNT=$(echo "$ANALYZE_OUTPUT" | grep -c "warning •" || true)

if [ "$ERROR_COUNT" -eq 0 ]; then
  pass "Flutter analyze: 0 errors"
else
  fail "Flutter analyze: $ERROR_COUNT errors"
fi

if [ "$WARNING_COUNT" -eq 0 ]; then
  pass "Flutter analyze: 0 warnings"
else
  warn "Flutter analyze: $WARNING_COUNT warnings"
fi

echo ""

# ─── 8. File Counts ────────────────────────────────────────────────────
echo "── 8. Project Stats ──"

SRC_COUNT=$(find "$APP_DIR" -name "*.dart" -type f 2>/dev/null | wc -l)
TEST_COUNT=$(find "$TEST_DIR" -name "*.dart" -type f 2>/dev/null | wc -l)
ADR_COUNT=$(find docs/architecture/ADR -name "ADR-*.md" 2>/dev/null | wc -l)

echo "  📁 Source files: $SRC_COUNT"
echo "  🧪 Test files: $TEST_COUNT"
echo "  📋 ADRs: $ADR_COUNT"

echo ""

# ─── Summary ───────────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════╗"
echo "║   Summary                                ║"
echo "╠══════════════════════════════════════════╣"
printf "║  ✅ Passed: %-3d                          ║\n" "$PASS"
printf "║  ❌ Failed: %-3d                          ║\n" "$FAIL"
printf "║  ⚠️  Warnings: %-3d                       ║\n" "$WARN"
echo "╚══════════════════════════════════════════╝"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "❌ AUDIT FAILED — Fix violations before release."
  exit 1
else
  echo ""
  echo "✅ AUDIT PASSED — Architecture is compliant."
  exit 0
fi
