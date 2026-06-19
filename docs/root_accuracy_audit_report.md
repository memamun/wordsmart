# WordSmart Root Accuracy Audit Report

## Executive Summary

An etymological audit was performed on the existing 330 root-tagged vocabulary words in `data/core_vocabulary.json` and the corresponding mappings in `data/word_roots.json`. 

Following the core product philosophy of **Quality > Quantity**, we reviewed every root mapping to eliminate:
1. **False Cognates**: Words historically unrelated to their mapped roots that happen to look similar (e.g. `VICARIOUS` mapped to `VI` for life).
2. **Germanic Prefix Overlays**: English/Germanic prefix formations mapped as Classical Latin/Greek roots (e.g. `BELIE` mapped to Latin `BE`).
3. **Superficial Prefix Mappings**: Words tagged with prefixes (like `OB-` or `SUB-`) while missing their primary root, providing low educational value.
4. **Incorrect Root Meanings**: Misdefined roots (e.g. `CAST/CHAST` defined as "cut" instead of "pure", `SUA` defined as "smooth" instead of "sweet").

A total of **32 words** were corrected, **6 new high-value classical roots** were added, and **1 invalid root** was removed entirely. The databases are now perfectly synchronized and etymologically accurate.

---

## 1. Corrected Root Meanings & Definitions

The meanings of several existing roots were updated in `data/word_roots.json` and synced across all word entries in `data/core_vocabulary.json` to ensure accuracy.

| Root | Old Meaning | New Meaning | Rationale & Examples |
| :--- | :--- | :--- | :--- |
| **`CAST/CHAST`** | cut | pure, chaste | Latin *castus* means pure/chaste. It is the root of *caste*, *castigate* (literally, to make pure), and *chastise*. It is unrelated to cutting (which is *caedere* / `CIS`). |
| **`SUAV/SUAS`** (formerly `SUA`) | smooth | sweet; to advise, to urge | Latin *suavis* (sweet/pleasant) is the root of *suave* and *assuage*. Latin *suadere* (to advise/urge) is the root of *persuade* and *dissuade*. The definition "smooth" was incorrect. |
| **`PER`** | completely, wrong | through, thoroughly, completely, wrongly | Latin prefix *per-* primarily means "through" (*pervade*, *permeate*, *perennial*) or "completely/thoroughly" (*peruse*, *peremptory*). "Wrongly" only applies to *perjury*. |
| **`PRO`** | much, for, a lot | forward, forth, before, in favor of | Latin prefix *pro-* means "forward/forth/before". Defining it as "much, for, a lot" is inaccurate and misleading for learners. |

---

## 2. Flagged and Removed False Cognates

These words were mapped to roots that are completely unrelated historically. They have been removed from these roots in both databases.

### **ANOMALY** (Mapped to `HER/HES` - to stick)
*   **Etymology:** From Greek *anomalos* (uneven, irregular), from *an-* (not) + *homalos* (even/same, from *homos* same). It has no relation to Latin *haerere* (to stick).
*   **Action:** Removed from `HER/HES`.

### **APARTHEID** (Mapped to `AB/ABS` - off, away from, and `PAR` - equal)
*   **Etymology:** Afrikaans word meaning "apart-ness", from Dutch *apart* (from Latin *ad* + *pars* part) + suffix *-heid* (equivalent to *-hood*). It is not related to `AB/ABS` (away from) nor `PAR` (equal, from Latin *par*).
*   **Action:** Removed from both `AB/ABS` and `PAR`.

### **VICARIOUS** (Mapped to `VI` - life)
*   **Etymology:** From Latin *vicarius* (substitute, deputy), from *vicis* (change, turn, stead). It has no relation to Latin *vita* / `VI` (life).
*   **Action:** Removed from `VI`.

### **QUERULOUS** (Mapped to `QUE/QUIS` - to seek)
*   **Etymology:** From Latin *querulus* (complaining), from *queri* (to complain). It is completely unrelated to Latin *quaerere* (to seek).
*   **Action:** Removed from `QUE/QUIS`.

### **INSOLENT** (Mapped to `SAL/SIL/SAULT/SULT` - to leap)
*   **Etymology:** From Latin *insolens* (unaccustomed, arrogant), from *in-* (not) + *solere* (to be accustomed). It has no relation to Latin *salire* (to leap).
*   **Action:** Removed from `SAL/SIL/SAULT/SULT`.

### **REMONSTRATE** & **ADMONISH** (Mapped to `MAN` - hand)
*   **Etymology:** *Remonstrate* is from Medieval Latin *remonstrare*, from *re-* + *monstrare* (to show). *Admonish* is from Latin *admonere*, from *ad-* + *monere* (to warn). Neither has any relation to Latin *manus* / `MAN` (hand).
*   **Action:** Removed from `MAN`. Mapped `ADMONISH` to new root `MON/MONIT` (to warn) and `REMONSTRATE` to `MONSTR` (to show).

---

## 3. Removed Germanic Prefixes

The prefix `BE-` is a native Germanic prefix and does not belong in a database of Greek and Latin classical roots.

*   **Words Affected:** `BELIE`, `BELITTLE`, `BESET`.
*   **Action:** Removed root `BE` entirely from `word_roots.json` and from the words' `root_tags` in `core_vocabulary.json`.

---

## 4. Removed Superficial Prefix-Only Matches

Prefix-only tags were removed where they provided low educational value or were misleading without their primary roots.

### **COVERT** (Mapped to `VERS/VERT` - to turn)
*   **Etymology:** From Old French *covert*, past participle of *covrir* (to cover), from Latin *cooperire* (from *co-* + *operire* to cover). Unrelated to *vertere* (to turn).
*   **Action:** Removed from `VERS/VERT`.

### **DEMAGOGUE** (Mapped to `ACT/AG` - to do, to drive)
*   **Etymology:** From Greek *demagogos*, *demos* (people) + *agogos* (leading), from *agein* (to lead). While *agein* is cognate with Latin *agere* (to do/drive), mapping it to the Latin verbal root `ACT/AG` is confusing.
*   **Action:** Removed from `ACT/AG`.

### **MATRICULATE** (Mapped to `MATER/MATR` - mother)
*   **Etymology:** From Late Latin *matricula* (a public register/list), diminutive of *matrix* (register, originally womb/source, from *mater*). The connection is highly indirect and historically remote.
*   **Action:** Removed from `MATER/MATR`.

### **OBFUSCATE**, **OBLIQUE**, **OBSCURE**, **OBTUSE** (Mapped to `OB/OC/OF/OP` - toward/against)
*   **Etymology:** These words contain the prefix *ob-*, but mapping only the prefix and omitting the primary root (e.g., *fuscus* for obfuscate, *tundere* for obtuse) provides no educational value.
*   **Action:** Removed from `OB/OC/OF/OP`.

### **SUBLIME** & **SUBTLE** (Mapped to `SUB/SUP` - below)
*   **Etymology:** *Sublime* is from *sublimis* (uplifted, high), from *sub* (up to) + *limen* (threshold). *Subtle* is from *subtilis* (fine, thin), from *sub* (under) + *tela* (web). Mapping to the root meaning "below" is incorrect or highly misleading.
*   **Action:** Removed from `SUB/SUP`.

### **STEADFAST** (Mapped to `STA/STI` - to stand)
*   **Etymology:** Of Germanic origin, from Old English *stede* (place) + *fæst* (firm). While *stede* is cognate with Proto-Indo-European *sta-* (to stand), mapping it to classical Latin/Greek root `STA/STI` is historically inaccurate and misleading.
*   **Action:** Removed from `STA/STI`.

---

## 5. Added High-Value Classical Roots

To replace the incorrect mappings, we added **6 new high-value classical roots** and mapped the corrected words to them.

1.  **`HOMO`** (same, alike)
    *   **Words:** `homogeneous` (also `homonym`, `homosexual`, `homeostasis` in the roots database)
2.  **`HETERO`** (other, different)
    *   **Words:** `heterogeneous` (also `heterosexual`, `heterodox` in the roots database)
3.  **`MON/MONIT`** (to warn, to advise, to remind)
    *   **Words:** `admonish`
4.  **`MONSTR`** (to show)
    *   **Words:** `remonstrate`
5.  **`GEN`** (birth, class, kin)
    *   **Words:** `homogeneous`, `heterogeneous`, `indigenous`
6.  **`SAP/SIP`** (to taste, to be wise)
    *   **Words:** `insipid`

---

## Conclusion & Verification

All database updates have been applied successfully and cross-validated. 

*   **Database integrity check:** Executed `python3 scripts/validate_databases.py` which reported:
    `Total: 0 errors, 0 warnings`
*   **Verification report:** Written to `docs/report.md`.

WordSmart's etymological database is now clean, accurate, and provides high-value, academically sound learning metrics to our users.
