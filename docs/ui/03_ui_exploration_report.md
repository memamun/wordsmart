# WordSmart UI/UX Exploration & Variants Report

This document contains the executive summary, design system markdown configurations, and screen prompts for the three visual variants generated in Stitch for the **Home / Search** screen of WordSmart.

---

## 📊 Executive Summary Comparison

| Visual Style | Option A: Minimal / Editorial | Option B: Material 3 Expressive | Option C: Premium Glassmorphism |
| :--- | :--- | :--- | :--- |
| **Theme Mode** | Light Mode (Clean Off-White) | Light Mode (Cool Gray Background) | Dark Mode (Deep Charcoal Canvas) |
| **Contrast Accent** | Pure Black / Charcoal (`#000000`) | Bold Primary Blue (`#0A56CE`) | Soft Amber Glow (`#FFB900`) |
| **Shape Language** | Structured, flat (4px corners) | Dynamic, friendly (16px corners) | Sophisticated glass (8px corners) |
| **Separators** | Thin 1px borders, no shadows | Standard M3 card elevation/shadows | Translucent layers, drop shadow glows |
| **Core Feeling** | Distraction-free, academic | High-performance, energetic | Immersive Focus Sanctuary |
| **Inspiration** | Notion, Apple Dictionary | Duolingo, Elevate, SaaS Dashboards | Readwise Reader, Apple Dark Mode |

---

## 🖼️ Screen Variants & Screenshots

````carousel
Option A: Minimal / Editorial
![Option A Screenshot](https://lh3.googleusercontent.com/aida/AP1WRLsLO8HsSCHQzhn8fNVzMyk8NGJ55uss0Q7pJbI32B6VJhkPJX_t4rDGTMFcsnkkhiTkEeFQdt8VuknqNef0ieQ1YJv9eDZhe2yK5CuATMT_Q9AEpPftfrz3myD5mA8VsskogAvJOYyRjDNOaV1nFlYOrBVPETNdmtn5SL0AjOCeyoUtrxq8x-8hs6aHhDchehLCJ2NwE8xkRvQRupwjER8gsgAKfiURUVqZ6rV_FNgH_bJ_qrbeNskdsrU)
<!-- slide -->
Option B: Material 3 Expressive
![Option B Screenshot](https://lh3.googleusercontent.com/aida/AP1WRLtDXDlRDhaog59Q1V1ro1uwGJacB7Q2CL1Dc6lex4P3bdsVIO0hiIkJ1OzjyvCYaY9JJrW0Djd-O-h5urtuXlIKO0kPz9LRNrEA1fcGUpJRITUccvJJXBEhfK8SuR7DqAhXT0soJ9qmBTa-cXJclIJC8aEqKUWxTJa_Z0YI1YbdS2zS-IDCjSnCvCxDSeTEmndkae2E0jQEjfoR31ZZn4uxIxH8V09OBV4OYNBpDMe5g3fYqa-53VAoOliv)
<!-- slide -->
Option C: Premium Glassmorphism
![Option C Screenshot](https://lh3.googleusercontent.com/aida/AP1WRLu0MKhy1KY-l4fPYT8VBxp0YBiD6_IgXeHheBNDofr1F7NvyimggEgSBpSPY3kiwqZ37F1NvExuhjSgsMF28X280Lr_8BasSMeHQMsW4oDb0QCpCuw2GqBMS8hSWsFCfPjyRD63avNwzY7752bAvDN1KO4rWMvRHg-off19HXk5nZ9QwTHUErTuPwGRfkbOWj48k8AomgKgbqn9injg-8T_1R9nvECcecytGVIGR79ECGZrsbqX6pS-qder)
````

---

## 🛠️ Variant Configurations & Prompts

### 1. Option A: Minimal / Editorial
*   **Screen Resource ID:** `projects/16593413986421184387/screens/738b94dcc6e44d229398f93cbc23a9a9`
*   **Generation Prompt:**
    ```text
    Create a mobile home screen titled 'Home / Search - Option A (Minimal/Editorial)'. 
    Style: Minimal / Editorial. 
    Layout:
    1. TopAppBar: Title 'WordSmart' in Outfit bold, profile avatar trailing.
    2. Search: A simple pill-shaped input with a thin 1px border, placeholder 'Search 1900+ vocabulary words...'.
    3. Word of the Day: A flat card with a thin border. Large bold 'ABATE' (Outfit), phonetic 'uh BAYT', definition 'to subside; to reduce' in charcoal. Minimalist outline play/audio icon.
    4. Learning Progress: Simple text row: '12 Days' streak and '15 Review Due'. A thin black progress bar below it at 72% width.
    5. Quick Actions: A row of four text-only or minimalist icon+text buttons: 'Quiz', 'Flashcards', 'Story', 'Bookmarks'.
    6. Hit Parade: A list section with 'HIT PARADE' header. List items showing rank numbers (1, 2, 3), bold words (ABASH, ABDICATE, ABERRATION), short definitions, and thin divider lines between rows.
    7. BottomNavBar: Standard navigation.
    Ensure the background is #FAFAFA and there are no shadows anywhere. Use high-contrast black for headers.
    ```
*   **Design System MD (`designMd`):**
    ```yaml
    name: Editorial Minimalist
    colors:
      background: '#FAFAFA'
      surface: '#FFFFFF'
      on-surface: '#000000'
      on-surface-variant: '#333333'
      outline: '#E0E0E0'
      primary: '#000000'
      primary-container: '#FFB900'
    typography:
      display-lg:
        fontFamily: Outfit
        fontSize: 48px
        fontWeight: '700'
        lineHeight: '1.1'
        letterSpacing: -0.02em
      body-lg:
        fontFamily: Inter
        fontSize: 18px
        fontWeight: '400'
        lineHeight: '1.6'
    rounded:
      sm: 4px
      DEFAULT: 4px
    spacing:
      base: 8px
      stack-lg: 48px
    ```

---

### 2. Option B: Material 3 Expressive
*   **Screen Resource ID:** `projects/16593413986421184387/screens/fac77ad07a6740ae811e633174ff5cea`
*   **Generation Prompt:**
    ```text
    Create the 'Home / Search - Option B (Material 3 Expressive)' screen. 
    Background: #F4F6F8. 
    1. Use the TopAppBar component ('WordSmart' in Outfit bold, profile avatar).
    2. Pill-shaped search bar with icon and placeholder 'Search 1900+ vocabulary words...'.
    3. 'Word of the Day' card (Level 1 surface, 16px radius): Word 'ABATE' (Outfit bold), phonetic 'uh BAYT', definition 'to subside; to reduce'.
    4. 'Learning Progress' card (Level 1 surface, 16px radius): '12 Days' study streak with fire icon, '15 Review Due' count, and a Teal (#26A69A) horizontal progress bar at 72%.
    5. 'Quick Actions' grid: Circular buttons for 'Quiz', 'Flashcards', 'Story', 'Bookmarks' with expressive icons.
    6. 'Hit Parade' section: Vertical list of cards with filled containers. 
       - Card 1: '1', 'ABASH', 'v.', 'to embarrass or make ashamed'.
       - Card 2: '2', 'ABDICATE', 'v.', 'to step down from a position of power'.
       - Card 3: '3', 'ABERRATION', 'n.', 'something not typical; a deviation'.
    Use #0A56CE for primary actions and brand elements. Ensure generous spacing and high-quality Material 3 expressive styling.
    ```
*   **Design System MD (`designMd`):**
    ```yaml
    name: Academic Momentum
    colors:
      background: '#F4F6F8'
      surface: '#FFFFFF'
      primary: '#0A56CE'
      secondary: '#008080'
      on-surface: '#191C1E'
      on-surface-variant: '#424654'
    typography:
      headline-lg:
        fontFamily: Outfit
        fontSize: 32px
        fontWeight: '600'
        lineHeight: 40px
      body-lg:
        fontFamily: Inter
        fontSize: 16px
        fontWeight: '400'
        lineHeight: 24px
        letterSpacing: 0.5px
    rounded:
      DEFAULT: 16px
      xl: 24px
    spacing:
      base: 8px
      gutter: 16px
    ```

---

### 3. Option C: Premium Glassmorphism
*   **Screen Resource ID:** `projects/16593413986421184387/screens/46b6b514d977463f9965983686fd3858`
*   **Generation Prompt:**
    ```text
    Create the 'Home / Search' screen for WordSmart. 
    
    Design details:
    - Background: Dark charcoal (#121212).
    - Aesthetics: Premium Glassmorphism. Cards use Level 1 surfaces (#1E1E1E) with a subtle 8% white outline (border-white/8).
    - Typography: Use 'Outfit' for headers and 'Inter' for body/labels as per the design system.
    
    Sections to include:
    1. TopAppBar: Title 'WordSmart' in Outfit bold, trailing circular profile avatar.
    2. Search: Large pill-shaped search input bar with a search icon and placeholder 'Search 1900+ vocabulary words...'.
    3. 'Word of the Day' Card: Translucent #1E1E1E surface with a soft Amber glow (drop-shadow-[0_0_20px_rgba(255,185,0,0.15)]).
       - Display word: 'ABATE' (Outfit bold, large).
       - Phonetic: 'uh BAYT'.
       - Part of speech: 'v'.
       - Definition: 'to subside; to reduce' (Teal accent).
       - Interaction: Circular glass play audio button.
    4. 'Learning Progress' Card:
       - Study streak: '12 Days' with a fire icon.
       - '15 Review Due' words in red.
       - Progress bar: Horizontal Teal bar at 72% with label '72% Mastery'.
    5. 'Quick Actions' Section: Horizontal scroll or grid of circular glass buttons: 'Quick Quiz', 'Flashcards', 'Story', 'Bookmarks'.
    6. 'Hit Parade (SAT/GRE)' Section: Scrollable list of cards or list items for 'ABASH', 'ABDICATE', 'ABERRATION' with rank numbers (1, 2, 3) and part-of-speech tags.
    
    Ensure spacing follows the design system (element-gap: 16px, section-gap: 32px, container-padding-mobile: 24px). Use the BottomNavBar component at the bottom.
    ```
*   **Design System MD (`designMd`):**
    ```yaml
    name: WordSmart Design System
    colors:
      background: '#121212'
      surface: '#1E1E1E'
      on-surface: '#F5F5F5'
      on-surface-variant: '#B0B0B0'
      primary: '#FFB900'
      secondary: '#26A69A'
      outline: '#555555'
    typography:
      display-word:
        fontFamily: Outfit
        fontSize: 48px
        fontWeight: '700'
        lineHeight: '1.2'
        letterSpacing: -0.02em
      body-lg:
        fontFamily: Inter
        fontSize: 18px
        fontWeight: '400'
        lineHeight: '1.6'
    rounded:
      DEFAULT: 8px
      xl: 24px
    spacing:
      base: 8px
      element-gap: 16px
      section-gap: 32px
    ```
