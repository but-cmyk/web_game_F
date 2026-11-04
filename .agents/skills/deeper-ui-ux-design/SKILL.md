---
name: deeper-ui-ux-design
description: "UI/UX design rules for DEEPER's pixel interface, covering screen layout on the 320x180 canvas, HUD, menus, modal choices (bargains, chests), Codex, Mirror, Settings, tutorial, touch controls, readable pixel text including Vietnamese diacritics, risk and odds hierarchy, feedback and microcopy, accessibility, and visual review with browser screenshots at desktop size and 360x640. Use whenever creating or changing any screen, HUD element, button, dialog, label, icon, layout, font, UI animation or player-facing text, even for a small tweak. Palette and asset files belong to deeper-pixel-audio-pipeline, Mirror wording belongs to deeper-mirror-telemetry."
---
# Deeper UI/UX Design

Read first: docs/IMPLEMENTATION_PLAN.md sections 1 (pillars), 2, 4.1, 4.9, 4.11 and the current milestone in section 5.

## 1. Design Stance & Philosophy
- **Darkness is the Protagonist**: Keep ambient backgrounds deep and muted; only gold treasures and active hazards receive bright, luminous highlights.
- **Zero Manipulative Pressure**: No ticking countdown clocks, no guilt microcopy, and no pre-selected greedy choices. The interface transparently equips the player to make autonomous, informed decisions.

## 2. Standard Screen Design Procedure
Follow this 8-step workflow for any interface modification:
1. **Define Core Purpose**: State the screen's single job and primary action in one sentence.
2. **Prioritize Information**: List and rank information chunks required at the moment of decision.
3. **Draft ASCII Wireframe**: Map layouts on the 320x180 canvas grid (including 20px top HUD).
4. **Bind Design Tokens**: Extract all spacing, padding, font sizes, and color roles strictly from [ui-tokens.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-ui-ux-design/resources/ui-tokens.md).
5. **Assemble Shared Components**: Utilize standard buttons, modal dialogs, status meters, and choice cards.
6. **Complete State Matrix**: Implement `default`, `focused`, `pressed`, `disabled`, `empty`, and `error` states.
7. **Screenshot Review**: Capture browser screenshots across desktop and mobile viewports following [screenshot-review-procedure.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-ui-ux-design/resources/screenshot-review-procedure.md) and verify with [ui-review-checklist.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-ui-ux-design/resources/ui-review-checklist.md).
8. **Document Questions**: Record at most 3 open design questions in the milestone plan artifact.

## 3. Decision-Moment Rules
- **Transparent Order**: Always display cost before reward ("You pay X, you receive Y").
- **Prominent Rejection**: The "Decline" button must share the identical visual weight, size, and elevation as the "Accept" button.
- **Cognitive Budget**: Limit decision interfaces to at most 5 discrete information chunks.
- **Glanceable Status**: Represent critical values (oil, Dread, HP, carried gold) via icon + number + meter bar, never color alone.
- **Fixed-Width Digits**: Use monospace or tabular number formatting to avoid layout jitter during value fluctuations.

## 4. Input Parity & Accessibility
- Complete dual support: Every action must be executable via keyboard (WASD / arrows + Enter/Space) and touch taps/swipes.
- Clear Focus Rings: Keep keyboard focus outlines constantly visible. Nothing may be hover-only (tooltips require tap or long-press).
- Contrast Standards: Maintain >= 4.5:1 text contrast and >= 3:1 graphical element contrast.
- Photosensitivity: Flashing strictly capped at <= 3 flashes/second; all camera shake must respect user toggles.
- Touch Minimums: Touch interactive targets must meet at least 44x44 CSS pixels (24x24 absolute minimum).

## 5. Pixel Typography & Vietnamese Localization
Consult [vietnamese-pixel-text.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-ui-ux-design/resources/vietnamese-pixel-text.md):
- Design layouts with +40% buffer for localized string expansion.
- Use sentence case; avoid ALL CAPS in Vietnamese to prevent overlapping diacritics at low pixel resolutions.
- Refer to [screen-inventory.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-ui-ux-design/resources/screen-inventory.md) for full screen specifications.

## 6. Mobile Portrait Tension (360x640)
- Canvas size 320x180 and integer scaling are `[LOCKED]`. On 360x640 mobile screens, 1x scale leaves vertical free space.
- In Milestone M9, render virtual touch buttons as a responsive DOM overlay in the empty viewport space beneath the game canvas, satisfying the 44x44px touch target requirement.
