# Giggs Design System - Core Guidelines & Tokens

> **CRITICAL SYSTEM INSTRUCTION FOR CLAUDE (AI AGENT):**
> You **MUST** read this entire document prior to generating, updating, or modifying any Angular UI templates or components. This is the definitive Single Source of Truth for our UI/UX for the Giggs project. All layout, typography, coloring, and spacing must strictly derive from the tokens and configurations documented below.

## 1. Design System Philosophy

Giggs is an AI-Native Design System built to provide a cohesive, accessible, and premium UI experience tailored for high-performance B2B engineering workflows. The brand personality is **premium, effortless, and precise**, evoking the focused atmosphere of professional macOS and iPadOS creative tools.

The design style is **Ultra-Minimalist / Modern Corporate**, characterized by:
- **Spatial Clarity:** Generous whitespace and a strict 2-column layout to reduce cognitive load.
- **Subtle Depth:** Tonal layering and soft borders rather than heavy shadows.
- **Functional Elegance:** Every element serves a specific workflow purpose.

---

## 2. Exported Giggs Tokens & Tailwind Configuration

To maintain consistency, these tokens are integrated into the Tailwind CSS configuration (`tailwind.config.js`) and defined as CSS custom properties globally.

### Color Palettes
We utilize the **Cupertino Dark** aesthetic to prioritize high legibility and reduced eye strain:

| Custom Property | Tailwind Class | Value | Usage |
| :--- | :--- | :--- | :--- |
| `--ag-color-background` | `bg-background` | `#131315` | Main app background |
| `--ag-color-surface` | `bg-surface` | `#2C2C2E` | Base card background |
| `--ag-color-surface-dim` | `bg-surface-dim` | `#131315` | Low-emphasis surface areas |
| `--ag-color-surface-low` | `bg-surface-container-low` | `#1B1B1D` | Sidenav / low elevated container |
| `--ag-color-surface-high` | `bg-surface-container-high` | `#2A2A2C` | High-emphasis headers / panels |
| `--ag-color-surface-highest` | `bg-surface-container-highest` | `#353437` | Highly elevated active containers |
| `--ag-color-accent` | `bg-apple-blue` / `text-apple-blue` | `#0A84FF` | Primary actions, links, active states |
| `--ag-color-success` | `bg-emerald-winner` / `text-emerald-winner` | `#30D158` | "Winner" cards, status indicators |
| `--ag-color-error` | `bg-error` / `text-error` | `#FF453A` | Error states, warning indicators |
| `--ag-color-border` | `border-border` | `#38383A` | Outer container lines |

### Typography
We rely on **Inter** for standard UI elements and **JetBrains Mono** for data, badges, and code components:

- **Display Headings (`ag-text-h1` / `font-display-lg`):** Inter, 28px, Semibold, Line Height 34px, Letter Spacing -0.02em.
- **Section Headings (`ag-text-h2` / `font-headline-md`):** Inter, 20px, Semibold, Line Height 28px, Letter Spacing -0.01em.
- **Card Headings (`ag-text-h3` / `font-headline-sm`):** Inter, 16px, Semibold, Line Height 24px.
- **Body Text (`ag-text-body` / `font-body-md`):** Inter, 14px, Regular, Line Height 20px.
- **Monospace Labels (`ag-text-mono` / `font-label-mono`):** JetBrains Mono, 12px, Medium, Line Height 16px, Letter Spacing 0.05em.
- **Captions (`ag-text-caption` / `font-caption`):** Inter, 12px, Regular, Line Height 16px.

### Spacing & Layout
An 8px linear scale governs the application grid and element relationships:
- `stack-sm` / `ag-space-sm`: 8px (Inner elements margin/padding)
- `stack-md` / `ag-space-md`: 16px (Standard cards/content gap)
- `stack-lg` / `ag-space-lg`: 24px (Structural section spacing)
- `gutter` / `ag-space-gutter`: 24px (Main layout columns separation)
- `margin-page` / `ag-space-page`: 40px (Window edge padding)

### Shape & Corner Radii
- **Base Cards & Outer Blocks:** `12px` (`rounded-xl` / `rounded-lg` depending on config).
- **Controls & Buttons:** `8px` (Slightly sharper to stand out as interactive).
- **Status Badges & Pills:** Fully rounded / pill shape (`rounded-full`).

---

## 3. Component & Layout Mappings

Standard interactive HTML elements map directly to Giggs custom components and directives:

| Standard HTML | Giggs Component | styling & Structure |
| :--- | :--- | :--- |
| `<button>` | `ag-button` or `[agButton]` | 8px radius, accent blue background or ghost borders. |
| `<input>` / `<textarea>` | `ag-input` or `[agInput]` | Inset border, background matching container level, focus ring. |
| Card Container | `ag-card` | 12px radius, surface container background, 1px border (#38383A). |
| Toggle Control | `ag-segmented-toggle` | Multi-item slider bar with transition highlight. |

---

## 4. Diagramming & Connections (`ng-diagram`)

All live topologies, flows, and relationships must be rendered using the **`ng-diagram`** component. Custom/raw interactive SVG drawing is prohibited.

- **Initialization:** Initialize diagram models using the reactive computed pattern:
  ```typescript
  model = computed(() => initializeModel(this.diagramData(), this.injector));
  ```
- **Customization:** Apply Giggs theme variables directly to the `ng-diagram` host classes in the style sheet:
  ```scss
  ng-diagram-base-edge.default-edge {
    --edge-stroke: var(--ag-color-border);
    --edge-stroke-width: 2;
    --edge-stroke-transition: stroke 0.2s ease;
  }
  ng-diagram-base-edge.default-edge.selected {
    --edge-stroke: var(--ag-color-accent);
  }
  ```

---

## 5. Accessibility (A11Y) Enforcement

All templates must pass WCAG AA/AAA compliance:
- Semantic tags (`<main>`, `<nav>`, `<aside>`, `<article>`, `<header>`) are mandatory.
- ARIA properties (`aria-expanded`, `aria-label`, `aria-hidden`) must be used correctly on custom interactive elements.
- Ensure all interactive areas have focus rings driven by Giggs tokens.
