# Visual Screenshot Review Procedure

Read this when executing visual reviews of screens or HUD changes.

## Viewport Configurations
1. **Desktop Native Integer Upscale**: 1280x720 window (4x integer scale of 320x180).
2. **Compact Desktop Window**: 800x600 window (verify clean integer ratio or centered padding).
3. **Mobile Portrait Frame**: 360x640 mobile simulation (verify touch targets and bottom DOM overlay).

## Variant Inspection
- **Default Theme**: Standard lighting and DEEPER-24 palette.
- **High Contrast Mode**: Verify border clarity and text readability against dark floor tiles.
- **Reduce Motion Active**: Verify that camera shake and continuous pulsating loops are suppressed.

## Review Artifacts
Capture screenshots during browser smoke testing. Embed snapshots directly into the milestone walkthrough artifact. Do not commit raw image binaries to git unless explicitly requested.
