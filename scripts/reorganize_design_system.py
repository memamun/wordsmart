import os
import re

PROJECT_ROOT = "/home/mamun/wordsmart"
APP_LIB = os.path.join(PROJECT_ROOT, "app", "lib")
APP_TEST = os.path.join(PROJECT_ROOT, "app", "test")
APP_INT_TEST = os.path.join(PROJECT_ROOT, "app", "integration_test")

# Old -> New paths relative to app/lib/
moves = {
    "features/dictionary/presentation/widgets/audio_button.dart": "core/design_system/buttons/audio_button.dart",
    "features/dictionary/presentation/widgets/bookmark_button.dart": "core/design_system/buttons/bookmark_button.dart",
    "features/dictionary/presentation/widgets/primary_button.dart": "core/design_system/buttons/primary_button.dart",
    "features/dictionary/presentation/widgets/search_bar.dart": "core/design_system/inputs/word_search_bar.dart",
    "features/dictionary/presentation/widgets/loading_skeleton.dart": "core/design_system/states/loading_skeleton.dart",
    "features/dictionary/presentation/widgets/empty_state.dart": "core/design_system/states/empty_state.dart",
    "features/dictionary/presentation/widgets/section_header.dart": "core/design_system/typography/section_header.dart",
}

def get_absolute_lib_path(importing_file_rel, imported_path):
    if imported_path.startswith("package:") or imported_path.startswith("dart:"):
        return imported_path
    dir_name = os.path.dirname(importing_file_rel)
    combined = os.path.normpath(os.path.join(dir_name, imported_path))
    return combined.replace("\\", "/")

def calculate_relative_path(from_file_rel, to_file_rel):
    from_dir = os.path.dirname(from_file_rel)
    rel = os.path.relpath(to_file_rel, from_dir)
    rel = rel.replace("\\", "/")
    if not rel.startswith("."):
        rel = "./" + rel
    return rel

def main():
    print("🔄 Reorganizing Design System components...")
    
    # 1. Read files to be moved
    moved_contents = {}
    for old_rel, new_rel in moves.items():
        old_path = os.path.join(APP_LIB, old_rel)
        if not os.path.exists(old_path):
            print(f"⚠️ Warning: source file not found: {old_rel}")
            continue
        with open(old_path, "r", encoding="utf-8") as f:
            moved_contents[new_rel] = f.read()

    # 2. Re-write the moved files to their new destinations
    for new_rel, content in moved_contents.items():
        dest = os.path.join(APP_LIB, new_rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Created: {new_rel}")

    # 3. Delete old file paths
    for old_rel in moves.keys():
        old_path = os.path.join(APP_LIB, old_rel)
        if os.path.exists(old_path):
            os.remove(old_path)
            print(f"🗑️ Removed: {old_rel}")

    # 4. Scan all files in app/lib/ to update imports
    # Old absolute paths to new absolute paths mapping
    mapping = {old: new for old, new in moves.items()}

    def fix_imports_in_file(file_path, file_rel, is_test=False, is_integration=False):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Regex for imports
        pattern = re.compile(r"import\s+['\"]([^'\"]+)['\"](\s+as\s+\w+)?\s*;")
        
        def replace_import(match):
            imported_path = match.group(1)
            as_suffix = match.group(2) or ""
            
            if imported_path.startswith("package:") or imported_path.startswith("dart:"):
                # Check package imports if any refer to wordsmart package
                # E.g. package:wordsmart/features/...
                # Let's handle relative imports primarily, but we can also match package:wordsmart/
                if imported_path.startswith("package:wordsmart/"):
                    pkg_rel = imported_path[len("package:wordsmart/"):]
                    if pkg_rel in mapping:
                        new_pkg_path = "package:wordsmart/" + mapping[pkg_rel]
                        return f"import '{new_pkg_path}'{as_suffix};"
                return match.group(0)

            if is_integration:
                # Integration test files are in app/integration_test/
                # They import relative to integration_test directory (e.g. `../lib/features/...`)
                # So imported_path has `../lib/` prefix or similar
                # Resolve relative path to app root
                abs_path = os.path.normpath(os.path.join("integration_test", imported_path)).replace("\\", "/")
                if abs_path.startswith("lib/"):
                    lib_part = abs_path[4:]
                    if lib_part in mapping:
                        new_lib_part = mapping[lib_part]
                        new_import = "../lib/" + new_lib_part
                        return f"import '{new_import}'{as_suffix};"
                return match.group(0)

            # Standard relative import
            abs_imported = get_absolute_lib_path(file_rel, imported_path)
            if abs_imported in mapping:
                new_abs_imported = mapping[abs_imported]
                new_file_rel = mapping.get(file_rel, file_rel)
                new_relative = calculate_relative_path(new_file_rel, new_abs_imported)
                return f"import '{new_relative}'{as_suffix};"
            
            # Even if the imported file is not moved, the importing file might have moved!
            # So its relative path to unchanged files needs to be updated.
            if file_rel in mapping:
                new_file_rel = mapping[file_rel]
                new_relative = calculate_relative_path(new_file_rel, abs_imported)
                return f"import '{new_relative}'{as_suffix};"

            return match.group(0)

        new_content = pattern.sub(replace_import, content)
        if new_content != content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"✏️ Updated imports: {file_rel}")

    # Process all files in lib/
    for root, dirs, files in os.walk(APP_LIB):
        for name in files:
            if name.endswith(".dart"):
                full_path = os.path.join(root, name)
                file_rel = os.path.relpath(full_path, APP_LIB).replace("\\", "/")
                fix_imports_in_file(full_path, file_rel, is_test=False)

    # Process integration tests in integration_test/
    if os.path.exists(APP_INT_TEST):
        for root, dirs, files in os.walk(APP_INT_TEST):
            for name in files:
                if name.endswith(".dart"):
                    full_path = os.path.join(root, name)
                    fix_imports_in_file(full_path, name, is_integration=True)

    print("✅ Reorganization completed successfully!")

if __name__ == "__main__":
    main()
