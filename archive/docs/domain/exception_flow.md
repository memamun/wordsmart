# Exception and Failure Flow Specification

This document describes how errors and domain validation exceptions flow through the layers of WordSmart.

## Architectural Goal

* **Strict Boundary Separation:** Domain-specific exceptions must not leak directly into the Presentation (UI) layer.
* **UI Safety:** The UI should only react to localized, structured, and predictable `Failure` objects (or UI states), not raw runtime stack traces.

---

## 🔄 Exception Flow Diagram

```
  ┌───────────────────────────────────────────────────────────┐
  │                    SQLite / Data Source                   │
  └─────────────────────────────┬─────────────────────────────┘
                                │ (Returns raw columns/rows)
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │                 WordModel (Data Mapper/DTO)               │
  └─────────────────────────────┬─────────────────────────────┘
                                │ (Converts DB fields to Entity)
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │           Word Entity (Throws DomainException)            │
  │     e.g., throws InvalidWordException(received: ...)      │
  └─────────────────────────────┬─────────────────────────────┘
                                │ (Exception Bubbles Up)
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │          Repository Implementation (Data Layer)           │
  │   - Catches InvalidWordException & SQLite exceptions      │
  │   - Catches other system/parsing errors                   │
  │   - Converts them to Failure objects                      │
  └─────────────────────────────┬─────────────────────────────┘
                                │ (Returns Either<Failure, Word>)
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │                      UseCase Layer                        │
  │   - Executes business rules & handles failure pathways   │
  └─────────────────────────────┬─────────────────────────────┘
                                │ (Propagates Failure or Entity)
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │                     Presentation (UI)                     │
  │   - Never sees InvalidWordException                      │
  │   - Inspects the Failure object to show user-friendly messages│
  └───────────────────────────────────────────────────────────┘
```

---

## 💼 Domain Failures vs Exceptions

### 1. Domain Exceptions (Thrown)
Domain exceptions represent violations of class invariants during construction (meaning the data is corrupted/invalid).
* **Location:** `lib/domain/exceptions/exceptions.dart`
* **Flow:** Thrown by entities/models; caught by repository implementations.
* **Examples:**
  * `InvalidWordException`
  * `InvalidWordExampleException`

### 2. Failure Objects (Returned)
Failures represent expected operational errors (e.g. database read errors, search misses, corrupted files). They are returned as values (typically using functional types like `Either<Failure, T>`), not thrown.
* **Location:** `lib/core/error/failures.dart`
* **Flow:** Returned by Repositories and Use Cases to the Presentation layer.
* **Examples:**
  * `DatabaseFailure` (SQLite read/write errors)
  * `EntityValidationFailure` (caught `DomainException` during mapper transformation)
  * `WordNotFoundFailure` (lookup miss)

---

## 🛡️ Key Code Implementation Pattern

Inside the **Repository Implementation** (Data Layer):

```dart
@override
Future<Either<Failure, Word>> getWordById(int id) async {
  try {
    final wordModel = await localDataSource.getWordById(id);
    
    // Mapping model to entity triggers factory constructor validation
    final wordEntity = wordModel.toEntity(); 
    
    return Right(wordEntity);
  } on DomainException catch (e) {
    // Catch invariant violations and convert to a clean Failure object
    return Left(EntityValidationFailure(message: e.message));
  } on DatabaseException catch (dbError) {
    // Catch lower-level driver errors
    return Left(DatabaseFailure(message: dbError.toString()));
  }
}
```
