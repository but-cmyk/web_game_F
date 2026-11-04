# UI Design Tokens

Single source of truth for UI spacing, text sizes, borders, layers, and color roles.

## Spacing Grid
- `space-1`: 2 px
- `space-2`: 4 px
- `space-3`: 8 px
- `space-4`: 12 px
- `space-5`: 16 px

## Typography
- `font-size-base`: 8 px (Standard HUD, dialogue descriptions, buttons)
- `font-size-title`: 16 px (Screen titles, milestone headings, victory banners)
- `line-height`: 1.25 (10 px on base, ensuring Vietnamese diacritics never clip)

## Border & Focus
- `border-width`: 1 px
- `outline-width`: 1 px (high-contrast focus ring)
- `border-radius`: 0 px (strictly crisp pixel aesthetic)

## Layer Z-Index Order
1. World Layer: z = 0
2. Fog & Lighting Mask: z = 10
3. HUD Layer: z = 20
4. Modal Choices & Dialogs: z = 30
5. Toasts & Floating Notifications: z = 40
6. Settings & Pause Overlay: z = 50

## Interactive Target Minimums
- Pointer / Mouse clickable: 16x16 px
- Touch targets: 44x44 CSS px (rendered via DOM overlay or virtual control panel)

## Animation & Motion
- `motion-fast`: 80 ms (Button press, focus snap)
- `motion-normal`: 150 ms (Modal open/close, card flip)
- `motion-pulse`: 400 ms (Dread heartbeat pulse, visual twin)

## Semantic Color Roles (Mapped to DEEPER-24 in M0)
*TO FILL IN M0 upon palette.ts generation*
- `color-bg`: Deep subterranean dark (#0a0908)
- `color-panel`: Dark stone grey
- `color-panel-border`: Medium slate border
- `color-text`: Off-white readable text
- `color-text-dim`: Muted parchment grey
- `color-gold`: Radiant gold accent (#f4d06f)
- `color-danger`: Warning crimson red (#d90429)
- `color-focus`: Cyan highlight ring
