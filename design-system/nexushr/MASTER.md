# Design System: NexusHR (Employee Management System)

Generated and refined using `ui-ux-pro-max`, `design-system`, and `ui-styling` skill intelligence.

---

### Design Dials
- **Variance:** 4/10 — Balanced / Modern
- **Motion:** 5/10 — Standard (subtle CSS transitions, zero overshoot on dense tables, `prefers-reduced-motion` compliant)
- **Density:** 8/10 — Dense / Dashboard (tight 8–32px scale, tabular figures, compact table rows)

### Style & Visual Direction
- **Primary Style:** Glassmorphism + Data-Dense Enterprise Dashboard
- **Mode Support:** Light Mode by default (`#F8FAFC` canvas, `#FFFFFF` elevated cards, `#2563EB` Trust Blue primary), with full Dark Mode parity (`.dark` obsidian `#09090B` canvas, `#121217` card surface, `#3B82F6` primary).
- **Key Effects:** Backdrop blur (`12px`), subtle 1px hairline borders, clean elevation hierarchy, tabular numerals (`tabular-nums`), SVG icons only (Lucide React — zero emojis).

### Three-Layer Design Tokens (`frontend/src/styles/tokens.css`)
- **Layer 1 (Primitives):** Slate, Blue, Orange, Emerald, Rose, Amber, Cyan, Violet hex ramps + 4px spacing scale + radius + typography tokens.
- **Layer 2 (Semantic):** `--color-background`, `--color-foreground`, `--color-card`, `--color-card-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-border`, `--color-primary`, `--color-on-primary`, `--color-accent`, `--color-on-accent`, `--color-destructive`, `--color-on-destructive`, `--color-ring`.
- **Layer 3 (Component):** `--header-height`, `--card-padding`, `--card-radius`, `--button-radius`, `--input-bg`, `--input-border`, `--table-header-bg`, `--table-row-hover`.

### Color Palette (Light / Dark)
| Role | Light Mode | Dark Mode | CSS Variable |
| :--- | :--- | :--- | :--- |
| Primary | `#2563EB` | `#3B82F6` | `--color-primary` |
| On Primary | `#FFFFFF` | `#FFFFFF` | `--color-on-primary` |
| Accent / Highlight | `#EA580C` | `#F97316` | `--color-accent` |
| On Accent (4.5:1+) | `#FFFFFF` | `#09090B` | `--color-on-accent` |
| Background | `#F8FAFC` | `#09090B` | `--color-background` |
| Foreground | `#0F172A` | `#F8FAFC` | `--color-foreground` |
| Card | `#FFFFFF` | `#121217` | `--color-card` |
| Muted Surface | `#E9EFF8` | `#181820` | `--color-muted` |
| Muted Foreground | `#475569` | `#A1A1AA` | `--color-muted-foreground` |
| Border | `#E2E8F0` | `#27272A` | `--color-border` |
| Destructive | `#DC2626` | `#EF4444` | `--color-destructive` |
| Focus Ring | `#2563EB` | `#60A5FA` | `--color-ring` |

### Typography
- **Heading & Body:** `Plus Jakarta Sans` (weights `400, 500, 600, 700, 800`)
- **Monospace / Tabular Data:** `JetBrains Mono` + `font-variant-numeric: tabular-nums`

### UX & Accessibility Standards Enforced
- **No Emojis as UI Icons:** Strict Lucide SVG icons with `aria-hidden="true"` when decorative beside text; accessible `aria-label` on icon-only controls.
- **Keyboard-Accessible Sort Headers:** Interactive `<button type="button">` inside `<th>` with `aria-sort="ascending" | "descending" | "none"`.
- **Accessible Forms & Error Summary:** Focusable error summary banner (`role="alert" tabIndex={-1}`) on invalid form submit with anchor links to invalid fields, paired with `aria-invalid` and `aria-describedby` inline field errors.
- **Compact Label Discipline:** `whitespace-nowrap` on pills and status chips; `min-w-0` + `truncate` on variable-length titles.
- **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` disables all non-essential animations and transitions.
- **Contrast & Touch Targets:** Minimum `4.5:1` contrast on text in both Light and Dark mode, visible `2px` focus rings on every interactive element, and comfortable click/touch hit targets (`>= 36px` / `gap-2`).

