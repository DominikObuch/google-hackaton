# Antigravity Design System - Core Guidelines & Tokens

> **CRITICAL SYSTEM INSTRUCTION FOR CLAUDE (AI AGENT):**
> You **MUST** read this entire document prior to generating, updating, or modifying any Angular UI templates or components. This is the definitive Single Source of Truth for our UI/UX. Do not use raw CSS, inline styles, or external utility classes (like Tailwind or Bootstrap) under any circumstances.

## 1. Design System Philosophy

Antigravity is an AI-Native Design System built to provide a cohesive, accessible, and premium UI experience. All layout, typography, coloring, and spacing must strictly derive from the tokens and blueprints documented below.

## 2. Exported Antigravity Tokens

### Typography

_(Team: Document typography tokens here. e.g., headings, body text, weights)_

- `ag-text-h1` - Main Page Headings
- `ag-text-body` - Standard paragraph text
- `ag-text-caption` - Small informational text

### Color Palettes

_(Team: Document strict color hexes and CSS custom properties here)_

- `ag-color-primary` - Primary brand color
- `ag-color-background` - Base layout background
- `ag-color-surface` - Card and modal backgrounds
- `ag-color-text-main` - High-contrast main text

### Spacing & Layout

_(Team: Document spacing increments and grid tokens here)_

- `ag-space-sm` - Small padding/margin (8px)
- `ag-space-md` - Standard padding/margin (16px)
- `ag-space-lg` - Large structural padding/margin (32px)

## 3. Component Mappings

_(Team: Map standard HTML/Angular elements to Antigravity components)_

| Standard Element | Antigravity Component | Notes                                             |
| ---------------- | --------------------- | ------------------------------------------------- |
| `<button>`       | `<ag-button>`         | Use `variant="primary"` for main actions.         |
| `<input>`        | `<ag-input>`          | Always include associated `<label>`.              |
| Card Container   | `<ag-card>`           | Enforces `ag-color-surface` and standard shadows. |

## 4. Layout Blueprints

_(Team: Provide standard layout blueprints for common screens e.g., Dashboards, Forms)_

- **Dashboard Blueprint:** Standard side navigation (`<ag-sidenav>`) with a top app bar (`<ag-app-bar>`) and a scrollable main content area (`<ag-main-container>`).
- **Form Blueprint:** Centered `<ag-card>` utilizing grid layouts (`ag-grid-2-col`) for responsive field arrangements.

## 5. Accessibility (A11Y) Enforcement

All templates built using this design system must pass WCAG AA/AAA compliance:

- Semantic tags (`<main>`, `<nav>`, `<aside>`, `<article>`) are mandatory.
- ARIA properties (`aria-expanded`, `aria-label`, `aria-hidden`) must be used correctly on custom interactive elements.
- Ensure all interactive areas have focus rings driven by Antigravity tokens.
