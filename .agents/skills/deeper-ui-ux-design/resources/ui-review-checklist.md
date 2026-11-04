# UI Review Checklist (30 Items)

Read and evaluate against this checklist during visual screenshot reviews.

## Readability & Hierarchy
- [ ] 1. Is text legible at 320x180 without blurriness?
- [ ] 2. Are Vietnamese diacritics unclipped with proper line height?
- [ ] 3. Does the screen have exactly one prominent primary action?
- [ ] 4. Are numbers formatted with fixed-width spacing to prevent jitter?

## Information & Transparency
- [ ] 5. Are costs presented before rewards in bargain dialogues?
- [ ] 6. Is the "Decline" button as visible as the "Accept" button?
- [ ] 7. Are odds explicitly listed before cursed chest interactions?
- [ ] 8. Are there 5 or fewer information chunks per decision screen?

## Input Parity
- [ ] 9. Is every button accessible via keyboard focus navigation?
- [ ] 10. Is the active keyboard focus ring clearly visible?
- [ ] 11. Are all touch targets >= 44x44 CSS px on mobile viewports?
- [ ] 12. Can the movement mode be toggled with a single tap or key?

## Ethics & Transparency
- [ ] 13. Are there zero countdown timers coercing player choice?
- [ ] 14. Is microcopy strictly neutral, devoid of guilt-tripping?
- [ ] 15. Are fake "near-miss" animations completely absent?
- [ ] 16. Does the Mirror screen avoid clinical/judgmental terminology?

## Accessibility & Contrast
- [ ] 17. Does text achieve >= 4.5:1 contrast against its background?
- [ ] 18. Does meaningful pixel art achieve >= 3:1 contrast?
- [ ] 19. Is information conveyed via icon/shape in addition to color?
- [ ] 20. Does every critical audio cue have an active visual twin?
- [ ] 21. Are screen flashes strictly limited to <= 3 per second?
- [ ] 22. Does toggling "Reduce Shake" eliminate all camera rumble?
- [ ] 23. Does toggling "Reduce Flashing" tone down intense pulses?

## Localization & Copy
- [ ] 24. Do strings support a 40% length expansion without overflow?
- [ ] 25. Are all displayed strings pulled from `vi.json` and `en.json`?
- [ ] 26. Is ALL CAPS avoided for Vietnamese strings?

## Responsiveness & Performance
- [ ] 27. Does the layout scale with integer ratios at various desktop sizes?
- [ ] 28. Is the game playable within a 360x640 mobile portrait window?
- [ ] 29. Are active UI particle effects capped at 30 instances?
- [ ] 30. Does UI motion terminate in <= 200ms?

