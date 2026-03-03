# PV-Calculator Autarq Redesign

**Date:** 2026-02-28
**Approach:** Full CSS Rewrite
**Theme:** Light (White/LightGray base, Navy text, Yellow accents)

## Decisions

- Helles Theme (Weiß `#fff` Sidebar, `#ebece6` Cards)
- Autarq-Logo im Sidebar-Header
- Drawing Toolbar im hellen Autarq-Stil (nicht Glassmorphism)
- Vollständiges CSS-Rewrite aller 10 CSS-Dateien

## Color Tokens

```css
:root {
  --color-yellow: #fff365;
  --color-yellow-hover: #f9f399;
  --color-yellow-active: #feda3b;
  --color-navy: #101920;
  --color-white: #ffffff;
  --color-light-gray: #ebece6;
  --color-border: #36393f99;
  --color-text: #101920;
  --color-text-muted: #101920b3;
  --color-subtle-hover: #6666661a;
  --color-subtle-active: #66666633;
  --color-success-bg: #79df7b;
  --color-success-text: #155616;
  --color-error-bg: #e5c7c7;
  --color-error-text: #A5272E;
  --color-gradient-warm: linear-gradient(45deg, #fbacb3 0%, #f9f399 100%);
}
```

## Typography

- Font: `'TT Firs Neue', Helvetica, system-ui, sans-serif`
- Body: 15px, weight 400, line-height 140%
- Headings: weight 600 (never 700), letter-spacing -0.02em to -0.03em
- Section titles: 13px, weight 600, uppercase, 0.05em letter-spacing
- Font sizes: 12/14/15/18/20/28/36/76px scale

## Components

### Sidebar
- Background: white
- Header: Autarq SVG logo + "PV-Rechner" subtitle (13px)
- Dividers: 1px solid var(--color-border)
- Scrollbar: 6px, #ebece6 thumb, 999px radius
- Width: 380px (unchanged)

### Buttons
- "Berechnen": Pill 999px radius, yellow bg, navy text, 44px height, 15px/500
- Hover: #f9f399, Active: #feda3b
- Disabled: opacity 0.4
- No gradients - flat colors only
- Focus: 2px solid var(--color-navy), offset -4px

### Result Cards
- Background: var(--color-light-gray)
- No border (clean)
- Border-radius: 8px
- Highlight card (Jahresertrag): navy bg, yellow value text
- Standard cards: navy text on light-gray

### Inputs
- Address input: bg #ebece6, border 1px #36393f99, radius 8px, height 48px
- Focus: border-color navy, box-shadow 0 0 0 2px navy
- Range slider: accent-color #fff365
- Dropdown: white bg, border, radius 8px, light shadow

### Drawing Toolbar
- Background: white with shadow 0 4px 24px rgba(0,0,0,0.08)
- Border: 1px solid var(--color-border)
- Border-radius: 999px (pill)
- Standard buttons: tertiary outline style
- Primary button: yellow pill
- Danger: #A5272E text, #e5c7c7 bg

### Chart & Table
- Container: white bg, 1px border, 8px radius
- Bars: yellow #fff365 (not blue)
- Tooltip: navy bg, white text, 8px radius
- Table: white bg, navy text, #ebece6 row borders

### Error Alert
- Background: #e5c7c7
- Text: #A5272E
- Radius: 8px
- Icon: navy circle, white "!"

### Loading Spinner
- Border: 3px solid #ebece6
- Border-top: var(--color-yellow)
- Same animation

## Files to Modify

### CSS (full rewrite):
1. `src/index.css` - Global tokens, font, reset
2. `src/App.css` - Layout
3. `src/components/Sidebar/Sidebar.css` - Sidebar container, header
4. `src/components/Sidebar/AddressSearch.css` - Input, dropdown
5. `src/components/Sidebar/PVParametersForm.css` - Sliders, button
6. `src/components/Sidebar/ResultsPanel.css` - Cards, chart, table
7. `src/components/CesiumMap/CesiumMap.css` - Map container
8. `src/components/CesiumMap/DrawingToolbar.css` - Toolbar
9. `src/components/common/ErrorAlert.css` - Error alert
10. `src/components/common/LoadingSpinner.css` - Spinner

### TSX (minimal changes):
11. `src/components/Sidebar/Sidebar.tsx` - Add Autarq SVG logo
12. `src/components/Sidebar/ResultsPanel.tsx` - Chart bar color from blue to yellow

### Map Polygon colors:
13. `src/components/CesiumMap/CesiumMap.tsx` - Polygon fill/stroke from blue to yellow/navy
