# SimuBuild — Interface Design System

## Direction
Authoring tool for software simulators. World: film editing suites, audio mixing desks, storyboard tables. Feel: **dense precision** — like a professional NLE editor. Cold, technical, focused.

## Depth Strategy
**Borders-only** (dark mode). Shadows only for node selection glow. No surface drop-shadows. Accent glow used sparingly for CTA hover state.

```css
border-subtle:  rgba(255,255,255,0.04)   /* softest divider */
border:         rgba(255,255,255,0.08)   /* default boundaries */
border-strong:  rgba(255,255,255,0.14)   /* emphasis, hover */
border-stronger:rgba(255,255,255,0.22)   /* focus rings, selected */
```

## Surface Elevation
Same hue throughout — only lightness shifts. Sidebars = `surface`, canvas = `canvas` (darker).

```
canvas:  #0a0d12   level 0 — app background
surface: #0d1117   level 1 — panels, sidebars
raised:  #111823   level 2 — cards, nodes
overlay: #161d27   level 3 — dropdowns
control: #0d1117   inputs — "inset" darker feel
```

## Typography
Inter. 4 levels:
- primary:   `#e2eaf4`  — default content
- secondary: `#8d9eb5`  — labels, supporting
- tertiary:  `#566375`  — metadata, counts (tabular-nums for numbers)
- muted:     `#363f4d`  — disabled, placeholder

## Spacing Base
4px unit. Use multiples only (4, 8, 10, 12, 14, 16, 20, 24...).

## Border Radius Scale
- Inputs, buttons: 6px
- Cards, nodes: 10px
- Large containers: 12px

## Brand Accent
`#7c5cfc` — single accent, used for: brand logo, handles, active states, CTA button, edge strokes, glow.

## Key Patterns

### ToolBtn (left toolbar)
34×34px, radius 7, transparent bg → raised on hover, tertiary icon → primary on hover. 150ms ease-out.

### GhostBtn
Border border → border-strong on hover, transparent → raised bg. 11px 500 weight.

### PrimaryBtn
Brand fill → brand-hover on hover + brand-glow box-shadow. 11px 600 weight.

### Node (ScreenNode)
272px wide. raised bg. Window chrome bar (surface bg). Hollow handle rings (canvas bg + brand border).
Selected: border-stronger + brand-dim ring + large dark shadow.

### Panel dividers
rgba border-subtle (0.04), 1px height, with optional uppercase 9px 600 label.
