# Design System — CitePath (independent)

Not a pixel clone of ReddGrow branding. Matches **information architecture and interaction patterns**.

## Brand

- Name: CitePath
- Tagline: Get cited where AI learns
- Logo: geometric path mark (original)

## Color roles

```css
--bg: #0f1419;
--bg-elevated: #171d25;
--bg-muted: #1e2630;
--border: #2a3441;
--text: #e8eef4;
--text-muted: #8b9aab;
--accent: #1a9b8e; /* teal */
--accent-hover: #148a7e;
--warning: #d4a017;
--danger: #d64545;
--success: #2f9e6f;
--promo: #3b82c4;
--warmup: #c47a3b;
```

Marketing surfaces use light variants of the same accent family.

## Typography

- Display: Fraunces
- UI/Body: DM Sans
- Mono: JetBrains Mono

## Spacing scale

4 / 8 / 12 / 16 / 24 / 32 / 48 / 64

## Radius

sm 6 · md 10 · lg 14 · xl 20 (no pill-heavy chrome)

## Shadows

Subtle elevation only; no multi-layer glow.

## Components

See UI_INVENTORY.md primitives. shadcn/ui base adapted to tokens.

## Responsive

| Breakpoint | Behavior |
|------------|----------|
| 375 | Sidebar → sheet; stacked metrics |
| 768 | Compact sidebar icons optional |
| 1024+ | Full sidebar 240px |
| 1280–1920 | Content max-width ~1280 |

**Confidence:** Design tokens = independent. Layout structure = HIGH from Help Center IA.
