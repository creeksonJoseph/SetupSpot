# DESIGN.md — SetupSpot

> Extracted directly from the **SetupSpot** codebase ([setupspot.com](https://setupspot.com)). SetupSpot is a light-mode community platform for desk setup enthusiasts, tech creators, and productivity aficionados to share, discover, tag equipment, create collections, and save favorites. Built with React, Tailwind CSS, FastAPI, and a clean light design token system centered on **SetupSpot Brand Royal Blue `#0066ff`**, crisp white card surfaces (`#ffffff`), light background canvas (`#f7f9fb`), deep slate typography (`#0F172A`), and hairline borders (`#E2E8F0`).

---

## Design Tokens

### Color — Brand Primaries

| Token                | Hex / RGBA               | Usage                                                         |
| -------------------- | ------------------------ | ------------------------------------------------------------- |
| `primary`            | `#0066ff`                | **SetupSpot Brand Royal Blue** — primary buttons & CTAs       |
| `primary-hover`      | `#0050cb`                | Hover state for primary buttons & interactive links           |
| `primary-active-bg`  | `rgba(0,102,255,0.08)`   | Active tab background highlight & active nav item background  |
| `primary-soft-bg`    | `#e6f0ff`                | Light blue badge & soft button background surface             |
| `canvas`             | `#f7f9fb`                | **App Page Canvas** — main light mode page background         |
| `surface`            | `#ffffff`                | **Pure White Card Surface** — cards, forms, modals & sidebar  |
| `text-dark`          | `#0F172A`                | **Deep Slate Heading** — page titles, main headings, labels   |
| `text-body`          | `#475569`                | **Slate Body Text** — paragraphs, descriptions, subtitles     |
| `text-muted`         | `#727687`                | **Cool Gray Muted Text** — captions, metadata, inactive icons  |
| `border-default`     | `#E2E8F0`                | **Light Hairline Border** — card borders, dividers, inputs    |
| `border-subtle`      | `#F1F5F9`                | Subtle internal dividers & item separators                    |
| `logo-accent`        | `linear-gradient(...)`   | Purple/Magenta brand icon gradient                            |

---

### Color — Brand Blue (Signature Ramp)

| Token        | Hex       | Usage                                                        |
| ------------ | --------- | ------------------------------------------------------------ |
| `blue-25`    | `#f2f7ff` | Faintest light blue background tint                          |
| `blue-50`    | `#e6f0ff` | Light blue tab fill & active state background                |
| `blue-100`   | `#cce1ff` | Soft blue border & chip background                           |
| `blue-200`   | `#99c3ff` | Soft blue accent                                             |
| `blue-300`   | `#66a4ff` | Mid blue                                                     |
| `blue-400`   | `#3386ff` | Bright blue link                                             |
| `blue-500`   | `#0066ff` | **Brand Blue Base** — main action color & active tab text    |
| `blue-600`   | `#0050cb` | Hover state blue                                             |
| `blue-700`   | `#003e99` | Pressed state blue                                           |
| `blue-800`   | `#002a66` | Deep royal blue                                              |
| `blue-900`   | `#001533` | Deepest navy                                                 |

---

### Color — Neutrals (Clean Slate & White)

| Token        | Hex       | Usage                                                        |
| ------------ | --------- | ------------------------------------------------------------ |
| `white`      | `#ffffff` | Card containers, sidebar, input fields, modals               |
| `canvas`     | `#f7f9fb` | Page background canvas                                       |
| `slate-50`   | `#f8fafc` | Subtle input background & table row hover                    |
| `slate-100`  | `#f1f5f9` | Tag pills & light divider lines                              |
| `slate-200`  | `#e2e8f0` | Standard hairline border color                               |
| `slate-400`  | `#94a3b8` | Disabled text & secondary icons                              |
| `slate-500`  | `#727687` | Muted metadata, captions & inactive nav items                |
| `slate-600`  | `#475569` | Secondary text & body paragraphs                             |
| `dark`       | `#0f172a` | Primary text, titles, headings & high-contrast buttons       |

---

## Typography

### Font Families

```css
/* Primary Display & Body Font Stack */
font-family: 'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

/* Monospace (Gear specs, prices & code snippets): */
font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
```

SetupSpot uses **Manrope** for headings and UI text, delivering crisp legibility and modern structure across all screen densities.

---

### Type Scale

| Class / Level | Size (px / rem) | Weight   | Color     | Usage                                        |
| ------------- | --------------- | -------- | --------- | -------------------------------------------- |
| `h1`          | 30px (`1.875rem`)| 900/800  | `#0F172A` | Page title (e.g. "Account Settings", "Explore")|
| `h2`          | 24px (`1.5rem`) | 700      | `#0F172A` | Card section titles & modal headings         |
| `h3`          | 18px (`1.125rem`)| 700/600  | `#0F172A` | Card titles, item names                     |
| `body`        | 16px (`1rem`)   | 400/500  | `#475569` | Main body copy & form field values           |
| `small`       | 14px (`0.875rem`)| 400/500  | `#475569` | Captions, descriptions & subtext             |
| `micro`       | 12px (`0.75rem`)| 600      | `#727687` | Labels, badges, tab titles & timestamps      |

---

## Layout & Header Architecture

### Top Navigation Header Layout (Landing / Main Header)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO] SetupSpot                Explore                         [Log In]  [ Sign Up ]             │
│ (Top-Left Logo)              (Center Action)                   (Top-Right Auth Controls)          │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Top-Left**: **SetupSpot Logo**
   - Purple/Magenta brand icon mark + `SetupSpot` typography (`#0F172A` bold text).
   - Clickable link returning to home (`/`).
2. **Center**: **Explore Button**
   - Centered navigation item (`Explore`) linking directly to the main feed (`/explore`).
   - Active state features `rgba(0,102,255,0.08)` light blue background pill and `#0066ff` text.
3. **Top-Right**: **Auth Action Controls**
   - `Log In`: Text/Ghost button with hover effect for existing users.
   - `Sign Up`: High-visibility **Brand Blue Pill Button** (`#0066ff`) to invite new creators to join.

---

### App Layout (Authenticated Dashboard / App Shell)

- **Left Sidebar**: Fixed sidebar (`w-20`) with white background (`#ffffff`), border right (`#E2E8F0`), housing vertical icon nav (Explore, Favorites, Collections, Create, Account).
- **Main Content Canvas**: Clean light background (`#f7f9fb`), max-width 1280px (`max-w-7xl`), padded for responsive views.

---

## Components

### Buttons

#### Primary — Brand Blue Button (`Save Profile Changes`, `Sign Up`)

```css
background-color: #0066ff;             /* --primary */
color:            #ffffff;
border-radius:    0.75rem;             /* 12px or rounded-xl */
padding:          0.625rem 1.25rem;
font-family:      'Manrope', sans-serif;
font-weight:      600;
font-size:        0.875rem;
transition:       all 0.15s ease-in-out;

/* Hover */
background-color: #0050cb;             /* --blue-600 */

/* Active / Focus */
box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.2);
```

#### Active Tab / Nav Pill (`Edit Profile`, `Password & Security`, Active Nav)

```css
background-color: rgba(0, 102, 255, 0.08);
color:            #0066ff;
border-radius:    0.75rem;             /* 12px */
padding:          0.5rem 1rem;
font-weight:      600;
font-size:        0.75rem;            /* 12px micro */
```

#### Secondary / Back Button (`Back`)

```css
background-color: #ffffff;
color:            #0F172A;
border:           1px solid #E2E8F0;
border-radius:    0.75rem;             /* 12px */
padding:          0.375rem 0.75rem;
font-size:        0.75rem;
font-weight:      600;

/* Hover */
background-color: #f8fafc;
```

---

### Cards & Form Containers

```css
background-color: #ffffff;
border:           1px solid #E2E8F0;
border-radius:    1rem;                /* 16px or rounded-2xl */
padding:          1.5rem;
box-shadow:       0 1px 3px 0 rgba(0, 0, 0, 0.02);
```

---

### Form Input Fields

```css
background-color: #ffffff;
color:            #0F172A;
border:           1px solid #E2E8F0;
border-radius:    0.75rem;             /* 12px */
padding:          0.625rem 0.875rem;
font-size:        0.875rem;

/* Focus state */
border-color:     #0066ff;
box-shadow:       0 0 0 3px rgba(0, 102, 255, 0.15);
```

---

## Visual Tone & Aesthetics

1. **Clean & Modern Light UI**: Pure white surfaces (`#ffffff`) over soft canvas background (`#f7f9fb`).
2. **SetupSpot Brand Blue Anchor**: `#0066ff` brings signature energy to CTAs, active tab highlights, and interactive states.
3. **Deep Slate Contrast**: `#0F172A` headings ensure high legibility and an institutional, premium look.
4. **Refined Hairlines**: Subtle `#E2E8F0` borders anchor inputs, cards, and navigation panels cleanly without clutter.
