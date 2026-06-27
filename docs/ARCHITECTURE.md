# SYSTEM ARCHITECTURE

This document describes the structural architecture of the WordSmart data platform, separation of concerns, and system boundaries.

---

## 🏛️ System Design Overview

WordSmart splits system boundaries into a **Static Data Management Layer** (this repository) and a **Client-Side Mobile Application** (the Flutter mobile application).

```
 ┌─────────────────────────────────────────────────────────┐
 │               STATIC DATA MANAGEMENT LAYER              │
 │                     (This Repository)                   │
 ├───────────────────┬───────────────────┬─────────────────┤
 │    Data Source    │    Enrichments    │    Database     │
 │  (JSON Files in   │ (API Call Scripts │  (sqlite3 db in │
 │   data/source)    │    in scripts/)   │ data/database)  │
 └───────────────────┴─────────┬─────────┴────────┬────────┘
                               │                  │
                               │ Bundled Assets   │ Bundled Assets
                               ▼                  ▼
 ┌─────────────────────────────────────────────────────────┐
 │               MOBILE APP CLIENT-SIDE LAYER              │
 │                     (Flutter Client)                    │
 ├─────────────────────────────────────────────────────────┤
 │   SQLite Local Provider  ◄───►  Local User DB (State)   │
 │   (offline dictionary)           (bookmarks, progress)  │
 └─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architectural Layers

### 1. Source of Truth Layer (Data Layer)
*   **Location:** `data/source/`
*   **Format:** Structural JSON.
*   **Behavior:** Completely stateless. Stores dictionaries, quiz matching structures, hit parades, and contextual stories. No platform-specific constraints.

### 2. Enrichment & Validation Layer (Logic Layer)
*   **Location:** `scripts/`
*   **Engine:** Python 3.
*   **Behavior:** Fetches data, maps relationships, runs AI integrations, and validates data patterns:
    *   **Enrichment:** Calls LLM APIs (Gemini/Groq) using `.env` key configs.
    *   **Validation:** Runs pre-commit or manual validation checks verifying schemas, keys, translations, and collocations.

### 3. Compilation Layer (Distribution Layer)
*   **Location:** `data/database/`
*   **Engine:** sqlite3 database engine.
*   **Behavior:** Rebuilds `wordsmart.db` programmatically, translating the JSON trees into a normalized, indexed relational structure suitable for mobile devices.

### 4. Client Presentation Layer (Flutter Client)
*   **Engine:** Flutter framework.
*   **Behavior:** Bundles `wordsmart.db` and audio MP3 files in assets, copies them to the device storage on first start, and serves as an offline-first dictionary and learning platform.

---

## ⚖️ Design Principles

1.  **Single Source of Truth (SSOT):** The JSON files in `data/source/` are the absolute source of truth. If any database corrupts or gets deleted, it can be fully rebuilt using only the JSON sources.
2.  **Stateless Cache Layer:** AI generation caches are separated into `archive/cache/` to ensure the main data directories remain free of developer-specific temp files.
3.  **Strict Validation Gates:** Pre-commit Hooks run database audits to prevent invalid formatting or broken foreign keys from reaching production.
