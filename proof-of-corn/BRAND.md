# Proof of Corn — Brand System

> Single source of truth for all Proof of Corn visual tooling.
> Referenced by: `generate-visual.js`, Remotion compositions, Mermaid themes, SKILL.md

---

## Colors

| Token | Hex | Use |
|-------|-----|-----|
| `bg-primary` | `#fafafa` | Page background (light mode) |
| `bg-dark` | `#0a0a0a` | Dark mode / video backgrounds |
| `accent` | `#b8860b` | Dark goldenrod — primary corn accent |
| `accent-amber` | `#d97706` | Links, hover states, buttons |
| `accent-amber-dark` | `#b45309` | Button hover, emphasis |
| `green-active` | `#16a34a` | Active state, growth, outputs |
| `green-dot` | `#22c55e` | Online/live indicators |
| `blue-input` | `#2563eb` | Inputs, data, thinking state |
| `text-primary` | `#171717` | zinc-900, main body text |
| `text-secondary` | `#3f3f46` | zinc-700, supporting text |
| `text-muted` | `#71717a` | zinc-500, labels |
| `border` | `#e4e4e7` | zinc-200, dividers (light mode) |
| `border-dark` | `#27272a` | zinc-800, dividers (dark mode) |
| `surface` | `#fafafa` | zinc-50, card backgrounds |

## Typography

| Role | Font Stack | Use |
|------|-----------|-----|
| **Body / Narrative** | Georgia, 'Times New Roman', serif | Editorial voice, AVC.com inspired |
| **UI / Headings** | Geist Sans (system-ui fallback) | Interface labels, section titles |
| **Mono / Technical** | Geist Mono (ui-monospace fallback) | Status, logs, timestamps, data readouts |

### Sizing

| Element | Class / Size |
|---------|-------------|
| H1 | text-4xl/5xl bold |
| H2 | text-2xl bold |
| Body | text-lg leading-relaxed |

## Visual Principles

1. Editorial clarity over tech aesthetic
2. Corn-gold (`#b8860b`) as signature accent
3. Generous whitespace, subtle borders (not heavy boxes)
4. Weather-responsive elements (gradients shift with conditions)
5. Monospace for technical/decision data, serif for narrative
6. Status colors: green=active, amber=monitoring, blue=thinking, gray=dormant
7. NOT pixel art, NOT cyberpunk, NOT CRT retro, NOT corporate SaaS

## Farmer Fred Widget Style

- Weather-responsive gradient backgrounds
- Amber border (`border-2 border-amber-700`)
- Pulsing status dot (`green-dot` when active)
- Dark panel with amber text for thoughts/status

## Remotion Video Tokens

For dark-mode video compositions (`WeeklyRecap.tsx`, `StatusCard.tsx`):

```ts
const TOKENS = {
  bg: '#0a0a0a',
  bgLight: '#fafafa',
  accent: '#b8860b',
  amber: '#d97706',
  green: '#16a34a',
  blue: '#3b82f6',
  text: '#ededed',
  muted: '#71717a',
  border: '#27272a',
  fontSerif: 'Georgia, "Times New Roman", serif',
  fontSans: 'system-ui, -apple-system, sans-serif',
  fontMono: 'ui-monospace, "Geist Mono", monospace',
};
```

## Imagen / FLUX Prompt Suffix

```
Clean editorial infographic style inspired by AVC.com and agricultural reportage.
Primary accent: dark goldenrod (#b8860b) and amber (#d97706).
Green (#16a34a) for growth, active states, outputs.
Blue (#2563eb) for data, inputs, thinking.
Background: off-white (#fafafa).
Typography: serif headlines (Georgia feel), clean sans-serif labels.
Data-forward layout with generous whitespace and subtle borders.
Professional, editorial, agricultural.
NOT pixel art, NOT cyberpunk, NOT neon, NOT CRT retro, NOT corporate SaaS.
Warm, trustworthy, documentary tone.
```

---

*Last updated: January 28, 2026*
