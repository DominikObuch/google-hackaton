/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/frontend/src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--ag-color-background)",
        surface: "var(--ag-color-surface)",
        "surface-dim": "var(--ag-color-surface-dim)",
        "surface-container-low": "var(--ag-color-surface-low)",
        "surface-container-high": "var(--ag-color-surface-high)",
        "surface-container-highest": "var(--ag-color-surface-highest)",
        "apple-blue": "var(--ag-color-accent)",
        "emerald-winner": "var(--ag-color-success)",
        "error": "var(--ag-color-error)",
        "text-primary": "var(--ag-color-text-main)",
        "text-secondary": "var(--ag-color-text-secondary)",
        "text-muted": "var(--ag-color-text-muted)",
        border: "var(--ag-color-border)",
      },
      borderRadius: {
        DEFAULT: "var(--ag-radius-sm)",
        lg: "var(--ag-radius-md)",
        xl: "var(--ag-radius-lg)",
        full: "var(--ag-radius-full)",
      },
      spacing: {
        "stack-sm": "var(--ag-space-sm)",
        "stack-md": "var(--ag-space-md)",
        "stack-lg": "var(--ag-space-lg)",
        gutter: "var(--ag-space-gutter)",
        "margin-page": "var(--ag-space-page)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
