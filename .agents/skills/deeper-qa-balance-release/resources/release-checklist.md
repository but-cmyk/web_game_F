# Final Release Packaging Checklist

Read this prior to closing Milestone M11 or packaging a public release.

## Verification Gates
- [ ] `npm run check` is completely green (typecheck, lint, test, build).
- [ ] Automated browser smoke test passes with 0 console warnings or errors.
- [ ] Packaged distribution zip is <= 5 MB.
- [ ] Cold initial load completes in < 3.0s under simulated 4G throttling.
- [ ] 60 FPS maintained under 4x CPU throttle in Chrome DevTools.
- [ ] Fully playable with touch controls at 360x640 mobile viewport.
- [ ] Localization check passes: 100% parity between `vi.json` and `en.json`.
- [ ] Game is completely playable offline with no active network connectivity.
- [ ] Photosensitivity and screen shake settings correctly disable high-frequency animations.
- [ ] `CREDITS.md` accounts for all licenses and author attributions.
- [ ] Standalone HTML5 package tested locally via `npm run preview`.
