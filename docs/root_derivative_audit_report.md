# WordSmart Root & Derivative Audit Report

## Executive Summary

This report evaluates the enrichment coverage of the 822 core vocabulary words in `data/core_vocabulary.json` focusing on:
1. **Root-Tagged Words**: Words mapped to their etymological roots (via `root_tags` field).
2. **Derivative-Complete Words**: Words that list their inflected/derived forms (via `derivatives` field).

---

## Enrichment Coverage Metrics

| Metric | Word Count | Percentage |
| :--- | :---: | :---: |
| **Total Vocabulary Size** | 822 | 100.00% |
| **Root-Tagged Words** | 327 | 39.78% |
| **Derivative-Complete Words** | 694 | 84.43% |

### Intersection Breakdown

| Category | Word Count | Percentage |
| :--- | :---: | :---: |
| **Both Root-Tagged & Derivative-Complete** | 262 | 31.87% |
| **Only Root-Tagged** | 65 | 7.91% |
| **Only Derivative-Complete** | 432 | 52.55% |
| **Neither (Pending Enrichment)** | 63 | 7.66% |

---

## Detailed Sample Lists

### 1. Both Root-Tagged & Derivative-Complete (262 Words)
Words that have successfully been enriched with both their root etymologies and derivative verb/noun/adjective forms.
*   **ABDICATE**
    *   *Roots*: `AB/ABS` (off, away from, apart, down), `DIC/DICT/DIT` (to say, to tell, to use words)
    *   *Derivatives*: `{"abdicated": "v"}`
*   **ABHOR**
    *   *Roots*: `AB/ABS` (off, away from, apart, down)
    *   *Derivatives*: `{"abhorrent": "adj", "abhorrence": "n"}`
*   **ABJECT**
    *   *Roots*: `JECT` (to throw, to throw down)
    *   *Derivatives*: `{"abjectly": "adv", "abjection": "n"}`
*   **ABRIDGE**
    *   *Roots*: `BRI/BREV` (brief, short)
    *   *Derivatives*: `{"abridged": "v", "abridgment": "n"}`
*   **ABSTINENT**
    *   *Roots*: `AB/ABS` (off, away from, apart, down)
    *   *Derivatives*: `{"abstinence": "n", "abstain": "v"}`
*   **ABSTRACT**
    *   *Roots*: `AB/ABS` (off, away from, apart, down), `TRACT` (to drag, to pull, to draw)
    *   *Derivatives*: `{"abstraction": "n", "abstractly": "adv"}`
*   **ABSTRUSE**
    *   *Roots*: `AB/ABS` (off, away from, apart, down)
    *   *Derivatives*: `{"abstruseness": "n", "abstrusely": "adv"}`
*   **ACERBIC**
    *   *Roots*: `AC/ACR` (sharp, bitter)
    *   *Derivatives*: `{"acerbity": "n"}`
*   **ACQUIESCE**
    *   *Roots*: `QUI` (quiet)
    *   *Derivatives*: `{"acquiescence": "n", "acquiesced": "v"}`
*   **ACRID**
    *   *Roots*: `AC/ACR` (sharp, bitter)
    *   *Derivatives*: `{"acridity": "n", "acridly": "adv"}`
*   *... and 252 more words.*

### 2. Only Root-Tagged (65 Words)
Words mapped to roots but missing inflected derivatives.
*   **ACUMEN**
    *   *Roots*: `AC/ACR` (sharp, bitter)
*   **AFFINITY**
    *   *Roots*: `FIN` (end, limit)
*   **AGENDA**
    *   *Roots*: `ACT/AG` (to do, to drive, to force, to lead)
*   **ANIMOSITY**
    *   *Roots*: `ANIM` (life, mind, soul, spirit)
*   **ANTECEDENT**
    *   *Roots*: `ANTE` (before), `CED/CEED/CESS` (to go, to yield, to stop)
*   **APOCRYPHAL**
    *   *Roots*: `APO` (away), `CRYP` (hidden)
*   **APOTHEOSIS**
    *   *Roots*: `APO` (away), `THEO` (god)
*   **APPROBATION**
    *   *Roots*: `PROB` (to prove, to test)
*   **APTITUDE**
    *   *Roots*: `APT/EPT` (skill, fitness, ability)
*   **ARTIFICE**
    *   *Roots*: `ART` (skill, craft)
*   *... and 55 more words.*

### 3. Only Derivative-Complete (432 Words)
Words that have inflected derivative forms listed but no root tags.
*   **ABASH**
    *   *Derivatives*: `{"abashment": "n"}`
*   **ABATE**
    *   *Derivatives*: `{"abated": "v"}`
*   **ABERRATION**
    *   *Derivatives*: `{"aberrant": "adj"}`
*   **ABNEGATE**
    *   *Derivatives*: `{"abnegated": "v", "abnegation": "n"}`
*   **ABORTIVE**
    *   *Derivatives*: `{"aborted": "v", "abortion": "n"}`
*   **ABSOLUTE**
    *   *Derivatives*: `{"absolutely": "adv", "absolutism": "n"}`
*   **ABSOLVE**
    *   *Derivatives*: `{"absolving": "v", "absolved": "v"}`
*   **ABYSMAL**
    *   *Derivatives*: `{"abysmally": "adv"}`
*   **ADAMANT**
    *   *Derivatives*: `{"adamancy": "n"}`
*   **ADROIT**
    *   *Derivatives*: `{"adroitly": "adv", "adroitness": "n"}`
*   *... and 422 more words.*

### 4. Neither (63 Words)
Words that currently lack both etymological roots and derivative forms.
*   **ACCOLADE**
*   **ACCOST**
*   **AMENITY**
*   **AMNESTY**
*   **APARTHEID**
*   **AVUNCULAR**
*   **AWRY**
*   **BASTION**
*   **BOVINE**
*   **BROACH**
*   *... and 53 more words.*

---

## Recommendations for Future Enrichment
*   **Map Remaining Roots**: Focus on the 413 'Only Derivative-Complete' words to link them to their appropriate Greek/Latin roots.
*   **Complete the Backlog**: Address the 98 remaining 'Neither' words to add both root tags and derivatives, pushing coverage to 100%.
