import os
import re

PROJECT_ROOT = "/home/mamun/wordsmart"
APP_LIB = os.path.join(PROJECT_ROOT, "app", "lib")
APP_TEST = os.path.join(PROJECT_ROOT, "app", "test")

# Reorganization mapping: (old_relative_path, new_relative_path)
move_map = [
    # Exceptions
    ("domain/exceptions/exceptions.dart", "core/error/exceptions.dart"),
    
    # Dictionary Feature
    ("domain/entities/word.dart", "features/dictionary/domain/entities/word.dart"),
    ("domain/entities/word_derivative.dart", "features/dictionary/domain/entities/word_derivative.dart"),
    ("domain/entities/word_example.dart", "features/dictionary/domain/entities/word_example.dart"),
    ("domain/entities/word_root.dart", "features/dictionary/domain/entities/word_root.dart"),
    ("domain/repositories/word_repository.dart", "features/dictionary/domain/repositories/word_repository.dart"),
    ("domain/repositories/search_repository.dart", "features/dictionary/domain/repositories/search_repository.dart"),
    ("domain/usecases/search_words.dart", "features/dictionary/domain/usecases/search_words.dart"),
    ("data/models/word_model.dart", "features/dictionary/data/models/word_model.dart"),
    ("data/models/word_example_model.dart", "features/dictionary/data/models/word_example_model.dart"),
    ("data/models/word_derivative_model.dart", "features/dictionary/data/models/word_derivative_model.dart"),
    ("data/models/word_root_model.dart", "features/dictionary/data/models/word_root_model.dart"),
    ("data/mappers/word_mapper.dart", "features/dictionary/data/mappers/word_mapper.dart"),
    ("data/datasources/word_local_data_source.dart", "features/dictionary/data/datasources/word_local_data_source.dart"),
    ("data/repositories/word_repository_impl.dart", "features/dictionary/data/repositories/word_repository_impl.dart"),
    ("presentation/providers/search_state.dart", "features/dictionary/presentation/providers/search_state.dart"),

    # Profile Feature
    ("domain/entities/word_progress.dart", "features/profile/domain/entities/word_progress.dart"),
    ("domain/entities/learning_status.dart", "features/profile/domain/entities/learning_status.dart"),
    ("domain/repositories/bookmark_repository.dart", "features/profile/domain/repositories/bookmark_repository.dart"),
    ("domain/repositories/progress_repository.dart", "features/profile/domain/repositories/progress_repository.dart"),
    ("data/models/word_progress_model.dart", "features/profile/data/models/word_progress_model.dart"),
    ("data/mappers/word_progress_mapper.dart", "features/profile/data/mappers/word_progress_mapper.dart"),
    ("data/datasources/bookmark_local_data_source.dart", "features/profile/data/datasources/bookmark_local_data_source.dart"),
    ("data/datasources/progress_local_data_source.dart", "features/profile/data/datasources/progress_local_data_source.dart"),
]

def update_imports(file_path, old_rel, new_rel):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the depth of the file from APP_LIB to compute new relative import paths
    # or let's use a simpler import path replacement if imports are relative.
    # Relative imports in the codebase use patterns like:
    # '../../core/error/failures.dart'
    # '../entities/word.dart'
    # 'package:dartz/dartz.dart'
    #
    # Since imports are relative, when we move a file, its relative imports to unchanged files (like failures.dart or other entities)
    # might break, and other files importing this moved file might break too.
    # To solve this cleanly, let's parse the package imports or convert all internal imports to package-level imports if package name is known.
    # Wait, let's look at the imports in main.dart:
    # `import 'core/di/injection.dart' as di;`
    # `import 'app.dart';`
    # This indicates imports starting without 'package:wordsmart/' are project-relative from `lib/`!
    # Yes! In Flutter, if you don't prefix with `package:`, it can be relative to the file or project root.
    # Let's see: `import '../../core/error/failures.dart';` has leading `../../`.
    # Let's write a robust python script to:
    # 1. Map all old relative paths to new relative paths.
    # 2. For each file, read it, and resolve all relative imports to absolute-from-lib paths.
    # 3. Update the imports to reflect their new relative paths based on their new locations.
    pass

# Let's implement the absolute-from-lib import resolver.
# In Dart, we can write all imports as relative to the file's new location.
# Let's calculate the absolute path from `lib/` for any import.
# For example, in `lib/data/repositories/word_repository_impl.dart` (which is at `data/repositories/word_repository_impl.dart`),
# the import `import '../../core/error/failures.dart';` resolves to `core/error/failures.dart`.
# The import `import '../../domain/entities/word.dart';` resolves to `domain/entities/word.dart`.
#
# Once we have the absolute-from-lib path of the imported file, we check if the imported file is also being moved.
# If it is being moved, we look up its new absolute-from-lib path in `move_map`.
# Then, we calculate the new relative path from the new location of the importing file to the new location of the imported file!
# This is mathematically 100% correct and works for any file move!

# Let's map old absolute-from-lib path -> new absolute-from-lib path
mapping = {old: new for old, new in move_map}

def get_absolute_lib_path(importing_file_rel, imported_path):
    # If it is a package import, return it as is
    if imported_path.startswith("package:") or imported_path.startswith("dart:"):
        return imported_path
    
    # Resolve relative path
    dir_name = os.path.dirname(importing_file_rel)
    combined = os.path.normpath(os.path.join(dir_name, imported_path))
    # Replace backslashes if on Windows (normpath might use them)
    combined = combined.replace("\\", "/")
    return combined

def calculate_relative_path(from_file_rel, to_file_rel):
    # Compute relative path from directory of from_file to to_file
    from_dir = os.path.dirname(from_file_rel)
    rel = os.path.relpath(to_file_rel, from_dir)
    rel = rel.replace("\\", "/")
    if not rel.startswith("."):
        rel = "./" + rel
    return rel

def process_file_content(file_rel, content, is_test=False):
    # Regular expression to match imports: import '...';
    pattern = re.compile(r"import\s+['\"]([^'\"]+)['\"](\s+as\s+\w+)?\s*;")
    
    def replace_import(match):
        imported_path = match.group(1)
        as_suffix = match.group(2) or ""
        
        if imported_path.startswith("package:") or imported_path.startswith("dart:"):
            # It's an external package import
            return match.group(0)
        
        # Resolve to absolute lib path
        if is_test:
            # Tests have imports starting with `../../../lib/...` or similar
            # Let's resolve relative to test directory
            abs_path = get_absolute_lib_path(file_rel, imported_path)
            # If it points inside lib, it will have `lib/` prefix
            if abs_path.startswith("lib/"):
                lib_part = abs_path[4:]
                # Check if this lib file was moved
                new_lib_part = mapping.get(lib_part, lib_part)
                # Re-calculate relative path from test file's new location to new lib file
                # The test files are not moved, so new_test_rel = file_rel
                # The target lib file is at `app/lib/new_lib_part`
                # So the relative import from `app/test/...` to `app/lib/new_lib_part` is:
                # `../` * (depth of test file) + `lib/` + new_lib_part
                depth = len(file_rel.split("/")) - 1
                new_import = "../" * depth + "lib/" + new_lib_part
                return f"import '{new_import}'{as_suffix};"
            return match.group(0)
        else:
            abs_imported = get_absolute_lib_path(file_rel, imported_path)
            # Check if this imported file is in our move map
            new_abs_imported = mapping.get(abs_imported, abs_imported)
            # Calculate new relative path from the new location of the importing file
            new_importing_rel = mapping.get(file_rel, file_rel)
            new_relative = calculate_relative_path(new_importing_rel, new_abs_imported)
            return f"import '{new_relative}'{as_suffix};"
            
    return pattern.sub(replace_import, content)

def main():
    print("🔄 Starting Codebase Reorganization...")
    
    # Read and process all files, storing their new contents
    new_files = {}
    
    # 1. Process files in move_map
    for old_rel, new_rel in move_map:
        old_path = os.path.join(APP_LIB, old_rel)
        if not os.path.exists(old_path):
            print(f"⚠️ Source file not found: {old_rel}")
            continue
            
        with open(old_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        new_content = process_file_content(old_rel, content, is_test=False)
        new_files[new_rel] = new_content

    # 2. Process other unchanged files in lib (like main.dart, app.dart, failures.dart, injection.dart)
    unchanged_files = [
        "main.dart",
        "app.dart",
        "core/error/failures.dart",
        "core/di/injection.dart"
    ]
    for rel in unchanged_files:
        path = os.path.join(APP_LIB, rel)
        if not os.path.exists(path):
            continue
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        new_content = process_file_content(rel, content, is_test=False)
        new_files[rel] = new_content

    # 3. Process test files in test/
    test_files = [
        "data/repositories/word_repository_impl_test.dart"
    ]
    new_test_files = {}
    for rel in test_files:
        path = os.path.join(APP_TEST, rel)
        if not os.path.exists(path):
            continue
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        new_content = process_file_content(rel, content, is_test=True)
        new_test_files[rel] = new_content

    # 4. Remove old directories and files inside app/lib/
    # We will do this carefully by deleting the old files first
    for old_rel, _ in move_map:
        old_path = os.path.join(APP_LIB, old_rel)
        if os.path.exists(old_path):
            os.remove(old_path)
            
    # Clean up empty directories under APP_LIB
    for root, dirs, files in os.walk(APP_LIB, topdown=False):
        for name in dirs:
            dir_path = os.path.join(root, name)
            if not os.listdir(dir_path):
                os.rmdir(dir_path)

    # 5. Write new files to their new locations
    for rel, content in new_files.items():
        dest_path = os.path.join(APP_LIB, rel)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        with open(dest_path, "w", encoding="utf-8") as f:
            f.write(content)
            
    # Write test files
    for rel, content in new_test_files.items():
        dest_path = os.path.join(APP_TEST, rel)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        with open(dest_path, "w", encoding="utf-8") as f:
            f.write(content)

    print("✅ Codebase Reorganization completed successfully!")

if __name__ == "__main__":
    main()
